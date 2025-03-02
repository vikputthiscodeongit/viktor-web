import { createEl, fetchWithTimeout } from "@codebundlesbyvik/js-helpers";
import SimpleNotifier from "@codebundlesbyvik/simple-notifier";
// import FormMc from "../form-mc/form-mc-controller";

interface CaptchaResponse {
    valid: boolean;
}

interface UnprocessableContentSubmitResponse {
    validated_form_data: { id: string; validation_errors: string[] }[];
}

const HttpStatus = {
    Ok: 200,
    NoContent: 204,
    MethodNotAllowed: 405,
    UnprocessableContent: 422,
    InternalServerError: 500,
    BadGateway: 502,
};

const FormControlValidationMessage = {
    default: "Input invalid",
    email: "Email address invalid",
    // formMc: "Answer incorrect",
    maxlength: "Input must be shorter than %d characters",
    minlength: "Input must contain more than %d characters",
    pattern: "Input format invalid",
    requiredEmpty: "Input required",
};

const FormSubmitMessageContent = {
    [HttpStatus.NoContent]: {
        title: "Message sent",
        text: "I'll be in touch soon!",
    },
    [HttpStatus.MethodNotAllowed]: {
        text: "Failed to send message. Please try again at a later time.",
    },
    [HttpStatus.UnprocessableContent]: {
        text: "One or more fields failed validation. Please check and correct them.",
    },
    [HttpStatus.InternalServerError]: {
        text: "Failed to send message. Please try again at a later time.",
    },
    [HttpStatus.BadGateway]: {
        text: "Failed to send message. Please try again at a later time.",
    },
};

const FormDataInStorageMessageContent = {
    currentlyInStorage: {
        text: "A previously unsent message was stored.",
    },
    pushedToStorage: {
        text: "The message has been stored locally on your device.",
    },
    removedFromStorage: {
        text: "Message removed from storage.",
    },
};

function getFormControlValidationMessage(el: HTMLInputElement | HTMLTextAreaElement) {
    // if (!el.id.includes("form-mc") && el.validity.valid) {
    if (el.validity.valid === true) {
        return null;
    }

    if (el.validity.valueMissing) {
        return FormControlValidationMessage.requiredEmpty;
    }

    if (el.validity.patternMismatch || el.validity.typeMismatch) {
        if (el.type === "email") {
            return FormControlValidationMessage.email;
        }

        return FormControlValidationMessage.pattern;
    }

    if (el.validity.tooLong) {
        const maxLength = el.getAttribute("maxlength");
        const message = FormControlValidationMessage.maxlength.replace(
            "%d",
            maxLength || "the current amount of",
        );

        return message;
    }

    if (el.validity.tooShort) {
        const minLength = el.getAttribute("minlength");
        const message = FormControlValidationMessage.minlength.replace(
            "%d",
            minLength || "the current amount of",
        );

        return message;
    }

    // if (el.id.includes("form-mc")) {
    //     return FormControlValidationMessage.formMc;
    // }

    return FormControlValidationMessage.default;
}

function updateFieldMessage(el: HTMLInputElement | HTMLTextAreaElement) {
    if (!el.parentElement) return;

    const messageEl = el.parentElement.querySelector(".field__message");

    if (!messageEl) return;

    messageEl.textContent = getFormControlValidationMessage(el);

    return;
}

function getFormSubmitNotificationContent(statusCode: number) {
    const content = {
        ...FormSubmitMessageContent[
            Object.keys(FormSubmitMessageContent).includes(statusCode.toString()) ? statusCode : 500
        ],
        variant:
            statusCode >= 200 && statusCode <= 299
                ? "success"
                : statusCode === HttpStatus.UnprocessableContent
                  ? "warning"
                  : "error",
    };

    return content;
}

function getFormDataInStorageNotificationContent(
    state: keyof typeof FormDataInStorageMessageContent,
) {
    return {
        ...FormDataInStorageMessageContent[state],
        variant: "info",
    };
}

function loadStoredFormData(formDataFromLocalStorage: string, formEl: HTMLFormElement) {
    try {
        const formControlEls = formEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
            "input:not([type=button], [type=reset], [type=submit]), textarea",
        );
        const formData = JSON.parse(formDataFromLocalStorage) as { [inputName: string]: string };
        const formControlElsWithFormData = Object.keys(formData);

        formControlEls.forEach((el) => {
            if (formControlElsWithFormData.includes(el.id)) {
                el.value = formData[el.id];
            }
        });

        return;
    } catch (error) {
        throw error instanceof Error
            ? error
            : new Error("Unknown error retrieving stored form data!");
    }
}

function prepareStoredFormData(
    formDataFromLocalStorage: string,
    formEl: HTMLFormElement,
    notifier: SimpleNotifier,
) {
    const fieldsetEl = createEl("fieldset");

    const fieldEl = createEl("div", { class: "field" });

    const loadButtonEl = createEl("button", {
        type: "button",
        class: "btn",
        textContent: "Load",
    });
    loadButtonEl.addEventListener(
        "click",
        () => {
            loadStoredFormData(formDataFromLocalStorage, formEl);
            fieldsetEl.remove();
        },
        { once: true },
    );
    fieldEl.appendChild(loadButtonEl);

    const clearButtonEl = createEl("button", {
        type: "button",
        class: "btn",
        textContent: "Remove",
    });
    clearButtonEl.addEventListener(
        "click",
        () => {
            localStorage.removeItem(`${formEl.name}-data`);
            fieldsetEl.remove();

            notifier.show(getFormDataInStorageNotificationContent("removedFromStorage"));
        },
        { once: true },
    );
    fieldEl.appendChild(clearButtonEl);

    fieldsetEl.appendChild(fieldEl);
    formEl.insertBefore(fieldsetEl, formEl.firstElementChild);

    notifier.show({
        ...getFormDataInStorageNotificationContent("currentlyInStorage"),
        hideAfterTime: 0,
        dismissable: true,
    });

    return;
}

// TODO: Do after form interaction.
export default async function initForm(formEl: HTMLFormElement, notifier: SimpleNotifier) {
    try {
        const submitTriggerEl = formEl.querySelector("[type=submit]");

        if (!submitTriggerEl) {
            throw new Error("submitTriggerEl not found!");
        }

        // const formMcInputEl = formEl.querySelector<HTMLInputElement>("input[name=cf-form-mc]");

        // if (!formMcInputEl) {
        //     throw new Error("formMcInputEl not found!");
        // }

        // const formMc = new FormMc({ inputEl: formMcInputEl });

        const pushedToStorageFormData = localStorage.getItem(`${formEl.name}-data`);

        if (pushedToStorageFormData) {
            prepareStoredFormData(pushedToStorageFormData, formEl, notifier);
        }

        const formControlEls = formEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
            "input:not([type=button], [type=reset], [type=submit]), textarea",
        );

        formControlEls.forEach((el) => {
            el.setAttribute("data-show-validation-message", "false");

            el.addEventListener("input", () => el.setAttribute("data-had-interaction", "true"), {
                once: true,
            });

            // TODO: Debounce.
            el.addEventListener("input", () => {
                updateFieldMessage(el);

                if (el.value !== "") {
                    el.setAttribute("data-has-input", "true");
                } else {
                    el.removeAttribute("data-has-input");
                }
            });

            el.addEventListener("blur", () => {
                if (el.hasAttribute("data-has-input") && el.hasAttribute("data-had-interaction")) {
                    el.setAttribute("data-show-validation-message", "true");
                }
            });
        });

        // formEl.addEventListener("formMcInitialized", () => {
        // TODO: Mogelijke edge case: FormMc wordt verwijderd uit het formulier wanneer deze input heeft, en later weer toegevoegd. Attribute is dan set. Oplossen in FormMc? InputEl moet altijd props reset bij verwijdering uit DOM?
        submitTriggerEl.addEventListener("click", (e) => {
            e.preventDefault();

            // const fn = async () => await submitForm(formEl, formMc, notifier);
            const fn = async () => await submitForm(formEl, notifier);
            fn().catch((reason) => console.error(reason));
        });

        formEl
            .querySelectorAll("fieldset:disabled")
            .forEach((el) => el.removeAttribute("disabled"));

        formEl.classList.remove("has-overlay");
        // });

        // TODO: Add event listener on formMc activated & return to caller.
        // await formMc.activate();

        return;
    } catch (error) {
        throw error instanceof Error
            ? error
            : new Error("initForm(): Unknown form initialization error!");
    }
}

// TODO:
// * Validate that fetchWithTimeout abort is properly handled.
// * Immediately refresh CAPTCHA after submit.
// async function submitForm(formEl: HTMLFormElement, formMc: FormMc, notifier: SimpleNotifier) {
async function submitForm(formEl: HTMLFormElement, notifier: SimpleNotifier) {
    const formControlEls = formEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        "input, textarea",
    );

    try {
        // formMc.clearTimer();

        const formData = new FormData(formEl);

        formControlEls.forEach((el) => el.setAttribute("disabled", "disabled"));

        // const captchaResponse = await fetchWithTimeout();
        // const captchaResponseData = (await captchaResponse.json()) as CaptchaResponse;

        // if (!captchaResponse.ok || !captchaResponseData.valid) {
        //     notifier.show(getFormSubmitNotificationContent(captchaResponse.status));

        //     return;
        // }

        const submitResponse = await fetchWithTimeout(
            "./components/contact-form/contact-form-controller.php",
            {
                method: "POST",
                body: formData,
            },
        );
        const submitResponseData = submitResponse.body
            ? ((await submitResponse.json()) as UnprocessableContentSubmitResponse)
            : null;

        const formControlElsWithoutButtons = formEl.querySelectorAll<
            HTMLInputElement | HTMLTextAreaElement
        >("input:not([type=button], [type=reset], [type=submit]), textarea");

        if (!submitResponse.ok) {
            if (
                submitResponse.status === HttpStatus.UnprocessableContent &&
                submitResponseData !== null
            ) {
                for (const formControlData of submitResponseData["validated_form_data"]) {
                    const el = document.getElementById(formControlData.id);

                    if (!el) continue;

                    el.removeAttribute("disabled");

                    updateFieldMessage(el as HTMLInputElement | HTMLTextAreaElement);

                    el.setAttribute("disabled", "disabled");
                    el.setAttribute("data-show-validation-message", "true");
                }
            }

            notifier.show(getFormSubmitNotificationContent(submitResponse.status));

            if (submitResponse.status !== HttpStatus.UnprocessableContent) {
                const formData: { [inputName: string]: string } = {};

                for (const el of Array.from(formControlElsWithoutButtons)) {
                    // if (el.name.includes("form-mc")) continue;

                    formData[el.name] = el.value;
                }

                localStorage.setItem(`${formEl.name}-data`, JSON.stringify(formData));

                notifier.show({
                    ...getFormDataInStorageNotificationContent("pushedToStorage"),
                    hideOlder: false,
                });
            }

            return;
        }

        notifier.show(getFormSubmitNotificationContent(submitResponse.status));

        localStorage.removeItem(`${formEl.name}-data`);
        formControlElsWithoutButtons.forEach((el) => (el.value = ""));

        return;
    } catch (error) {
        notifier.show(getFormSubmitNotificationContent(500));

        throw error instanceof Error ? error : new Error("Unknown error during form submission!");
    } finally {
        formControlEls.forEach((el) => el.removeAttribute("disabled"));

        // await formMc.createProblem();
    }
}
