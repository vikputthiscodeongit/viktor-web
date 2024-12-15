import { createEl, fetchWithTimeout, wait } from "@codebundlesbyvik/js-helpers";
import SimpleNotifier from "@codebundlesbyvik/simple-notifier";
import FormMc from "../form-mc/form-mc-controller";

type ObjectWithStrings = { [key: string]: string };
type ObjectWithStringArrays = { [key: string]: string[] };

function isObjectWithStringArrays(data: unknown): data is ObjectWithStringArrays {
    return (
        !!data &&
        typeof data === "object" &&
        Object.values(data).every((item) => Array.isArray(item))
    );
}

const StatusCode = {
    NoContent: 204,
    MethodNotAllowed: 405,
    UnprocessableContent: 422,
    InternalServerError: 500,
    BadGateway: 502,
};

const StatusMessages = new Map([
    [StatusCode.NoContent, "Message sent - I'll be in touch soon!"],
    [
        StatusCode.MethodNotAllowed,
        "An error occurred - your message has not been sent. Please try again later.",
    ],
    [
        StatusCode.UnprocessableContent,
        "One or more fields failed validation. Please check and correct them.",
    ],
    [
        StatusCode.InternalServerError,
        "An unknown error occurred - your message has not been sent. Please try again later.",
    ],
    [
        StatusCode.BadGateway,
        "Messsage failed to send - please try to send it again in a few minutes.\nThe message has been saved to your device, so you may also try again another time.",
    ],
]);

const getStatusMessage = (responseStatus: number) =>
    StatusMessages.get(responseStatus) ||
    (responseStatus >= 200 && responseStatus <= 299 ? "Message sent!" : "Message failed to send!");

const ValidationMessages = new Map([
    ["email", "Email address invalid"],
    ["form-mc", "Answer incorrect"],
    ["maxlength", "Input must be shorter than %d characters"],
    ["maxlength-unknown", "Input too long"],
    ["minlength", "Input must contain more than %d characters"],
    ["minlength-unknown", "Input too short"],
    ["pattern", "Input format invalid"],
    ["required", "Input required"],
]);

const getValidationMessage = (condition?: string) =>
    condition ? ValidationMessages.get(condition) || "Input invalid" : "Input invalid";

type HTMLFormControlElements =
    | HTMLButtonElement
    | HTMLFieldSetElement
    | HTMLInputElement
    | HTMLOutputElement
    | HTMLSelectElement
    | HTMLTextAreaElement;

const getElValidationMessage = (el: HTMLFormControlElements) => {
    if (!el.id.includes("form-mc") && el.validity.valid) {
        return null;
    }

    if (el.validity.valueMissing) {
        return getValidationMessage("required");
    }

    if (el.validity.patternMismatch || el.validity.typeMismatch) {
        if (el.type === "email") {
            return getValidationMessage("email");
        }

        return getValidationMessage("pattern");
    }

    if (el.validity.tooLong) {
        const maxLength = el.getAttribute("maxlength");
        const message = maxLength
            ? getValidationMessage("maxlength").replace("%d", maxLength)
            : getValidationMessage("maxlength-unknown");

        return message;
    }

    if (el.validity.tooShort) {
        const minLength = el.getAttribute("minlength");
        const message = minLength
            ? getValidationMessage("minlength").replace("%d", minLength)
            : getValidationMessage("minlength-unknown");

        return message;
    }

    if (el.id.includes("form-mc")) {
        return getValidationMessage("form-mc");
    }

    return getValidationMessage();
};

const updateInputMessage = (inputEl: HTMLFormControlElements) => {
    if (!inputEl.parentElement) return;

    const messageEl = inputEl.parentElement.querySelector(".field__message");

    if (!messageEl) return;

    messageEl.textContent = getElValidationMessage(inputEl);
};

const clearInputMessage = (inputEl: HTMLFormControlElements) => {
    if (!inputEl.parentElement) return;

    const messageEl = inputEl.parentElement.querySelector(".field__message");

    if (!messageEl) return;

    messageEl.textContent = "";
};

// TODO: Do after form interaction.
export default async function initForm(formEl: HTMLFormElement, notifier: SimpleNotifier) {
    try {
        const submitTriggerEl = formEl.querySelector("[type=submit]");

        if (!submitTriggerEl) {
            throw new Error("submitTriggerEl not found!");
        }

        const formMcInputEl = formEl.querySelector<HTMLInputElement>("input[name=cf-form-mc]");

        if (!formMcInputEl) {
            throw new Error("formMcInputEl not found!");
        }

        const storedFormData = localStorage.getItem(`${formEl.name}-data`);

        if (storedFormData) {
            prepareStoredFormData(formEl, storedFormData, notifier);
        }

        const formMc = new FormMc({ inputEl: formMcInputEl });
        const inputEls = formEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
            "input:not([type=button], [type=reset], [type=submit]), textarea",
        );

        formEl.addEventListener("formMcInitialized", () => {
            // TODO: Mogelijke edge case: FormMc wordt verwijderd uit het formulier wanneer deze input heeft, en later weer toegevoegd. Attribute is dan set. Oplossen in FormMc? InputEl moet altijd props reset bij verwijdering uit DOM?
            inputEls.forEach((el) => {
                const messageEl = createEl("span", {
                    class: "field__message",
                });
                el.after(messageEl);

                el.addEventListener("input", () => el.setAttribute("data-has-had-input", "true"), {
                    once: true,
                });

                // TODO: Debounce.
                el.addEventListener("input", () => {
                    if (el.value !== "") {
                        el.setAttribute("data-has-input", "true");
                    } else {
                        el.removeAttribute("data-has-input");
                    }

                    if (el.hasAttribute("data-validate-input")) {
                        if (!el.validity.valid) {
                            updateInputMessage(el);
                        } else {
                            clearInputMessage(el);
                        }
                    } else {
                        clearInputMessage(el);
                    }
                });

                el.addEventListener("blur", () => {
                    if (el.hasAttribute("data-has-had-input")) {
                        el.setAttribute("data-validate-input", "true");
                    }

                    if (!el.validity.valid && el.hasAttribute("data-validate-input")) {
                        updateInputMessage(el);
                    }

                    if (el.validity.valid) {
                        clearInputMessage(el);
                    }
                });
            });

            submitTriggerEl.addEventListener("click", (e) => {
                e.preventDefault();

                const fn = async () => await submitForm(formEl, formMc, notifier);
                fn().catch((reason) => console.error(reason));
            });

            if (formEl.classList.contains("js-auto-enable")) {
                // .js-ignore-auto-enable overrides automatic removal of :disabled.
                const elsToEnable = formEl.querySelectorAll(
                    ":not(.js-ignore-auto-enable):disabled",
                );
                elsToEnable.forEach((el) => el.removeAttribute("disabled"));

                formEl.classList.remove("has-overlay");
            }
        });

        // TODO: Add event listener on formMc activated & return to caller.
        await formMc.activate();
    } catch (error) {
        throw error instanceof Error
            ? error
            : new Error("initForm(): Unknown form-mc initialization error!");
    }
}

// TODO:
// * Validate that fetchWithTimeout abort is properly handled.
// * Disable inputs on submission start.
// * Immediately refresh CAPTCHA after submit.
async function submitForm(formEl: HTMLFormElement, formMc: FormMc, notifier: SimpleNotifier) {
    const submitTriggerEl = formEl.querySelector<HTMLButtonElement | HTMLInputElement>(
        "[type=submit]",
    );

    try {
        submitTriggerEl?.setAttribute("disabled", "disabled");

        formMc.clearTimer();

        const inputEls = formEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
            "input:not([type=button], [type=reset], [type=submit]), textarea",
        );

        const response = await fetchWithTimeout(
            "./components/sections/contact/form/form-controller.php",
            {
                method: "POST",
                body: new FormData(formEl),
            },
        );

        if (response.ok) {
            notifier.show(getStatusMessage(response.status), "success");
            localStorage.removeItem(`${formEl.name}-data`);

            await wait(5000);

            inputEls.forEach((el) => (el.value = ""));

            return;
        }

        inputEls.forEach((el) => el.setAttribute("data-validate-input", "true"));

        const contentType = response.headers.get("Content-Type");
        let data: ObjectWithStringArrays | string | undefined = undefined;

        if (response.body && contentType) {
            if (contentType.includes("/json")) {
                data = (await response.json()) as ObjectWithStringArrays;
            } else if (contentType.includes("text/")) {
                data = await response.text();
            } else {
                console.warn("Response Content-Type is unsupported.");
            }
        }

        // Validation failed
        if (response.status === StatusCode.UnprocessableContent) {
            if (isObjectWithStringArrays(data)) {
                for (const elId in data) {
                    const el = formEl.querySelector<HTMLFormControlElements>("#" + elId);

                    if (!el) continue;

                    updateInputMessage(el);
                }
            } else {
                console.warn("Can't mark fields as data returned by server cannot be processed.");
            }
        }
        // Mail send failed
        else if (response.status === StatusCode.BadGateway) {
            const formData: ObjectWithStrings = {};

            for (const el of Array.from(inputEls)) {
                if (el.name.includes("form-mc")) continue;

                formData[el.name] = el.value;
            }

            localStorage.setItem(`${formEl.name}-data`, JSON.stringify(formData));
        }

        notifier.show(getStatusMessage(response.status), "warning");
    } catch (error) {
        notifier.show(getStatusMessage(500), "warning");

        throw error instanceof Error ? error : new Error("Unknown error during form submission!");
    } finally {
        submitTriggerEl?.removeAttribute("disabled");

        await formMc.createProblem();
    }
}

function loadStoredFormData(formEl: HTMLFormElement, formDataFromLocalStorage: string) {
    try {
        const inputEls = formEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
            "input:not([type=button], [type=reset], [type=submit]), textarea",
        );
        const formData = JSON.parse(formDataFromLocalStorage) as { [inputName: string]: string };
        const inputElsWithFormData = Object.keys(formData);

        inputEls.forEach((el) => {
            if (inputElsWithFormData.includes(el.id)) {
                el.value = formData[el.id];
            }
        });
    } catch (error) {
        throw error instanceof Error
            ? error
            : new Error("Unknown error retrieving stored form data!");
    }
}

function prepareStoredFormData(
    formEl: HTMLFormElement,
    formDataFromLocalStorage: string,
    notifier: SimpleNotifier,
) {
    const fieldsetEl = createEl("fieldset");

    const fieldEl = createEl("div", { class: "field" });

    const helpEl = createEl("p", {
        textContent: "Your last message failed to send and was stored.",
    });
    fieldEl.appendChild(helpEl);

    const loadButtonEl = createEl("button", {
        type: "button",
        class: "btn",
        textContent: "Insert in form",
    });
    loadButtonEl.addEventListener(
        "click",
        () => {
            loadStoredFormData(formEl, formDataFromLocalStorage);
            fieldsetEl.remove();
        },
        { once: true },
    );
    fieldEl.appendChild(loadButtonEl);

    const clearButtonEl = createEl("button", {
        type: "button",
        class: "btn",
        textContent: "Remove from storage",
    });
    clearButtonEl.addEventListener(
        "click",
        () => {
            localStorage.removeItem(`${formEl.name}-data`);
            fieldsetEl.remove();
            notifier.show("Removed stored message.", "info");
        },
        { once: true },
    );
    fieldEl.appendChild(clearButtonEl);

    fieldsetEl.appendChild(fieldEl);

    formEl.insertBefore(fieldsetEl, formEl.firstElementChild);
}
