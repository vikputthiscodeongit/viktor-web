// TODO:
// * Fade out Simple Notifications when #contact not in viewport.

import { createEl, fetchWithTimeout } from "@codebundlesbyvik/js-helpers";
import Ntp, { convertUnixTimeFormatToMs } from "@codebundlesbyvik/ntp-sync";
import SimpleMathsCaptcha from "@codebundlesbyvik/simple-maths-captcha";
import SimpleNotifier from "@codebundlesbyvik/simple-notifier";

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
    maxlength: "Input must be shorter than %d characters",
    minlength: "Input must contain more than %d characters",
    pattern: "Input format invalid",
    requiredEmpty: "Input required",
};

const NotificationContent = {
    submit: {
        success: {
            title: "Message sent",
            text: "I'll be in touch soon!",
            variant: "success",
        },
        validationError: {
            text: "One or more fields failed validation. Please check and correct them.",
            variant: "warning",
        },
        unknownError: {
            text: "Failed to send message. Please try again at a later time.",
            variant: "error",
        },
    },
    formDataStorage: {
        inUse: {
            text: "A previously unsent message was stored.",
            variant: "info",
        },
        stored: {
            text: [
                "Your message has been stored on your device.",
                "You may close this page and come back at a later time to retry sending it.",
            ],
            variant: "warning",
            hideAfterTime: 6000,
        },
        removed: {
            text: "Message removed from storage.",
        },
    },
};

function getFormControlValidationMessage(
    el: HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement,
) {
    if (el.validity.valid === true) {
        return null;
    }

    if (
        el.validity.valueMissing ||
        (el.validity.customError && el.getAttribute("data-required") === "true")
    ) {
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

    return FormControlValidationMessage.default;
}

function updateFieldMessage(el: HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement) {
    console.info("updateFieldMessage: Running...");

    if (!el.parentElement) return;

    const messageEl = el.parentElement.querySelector(".field__message");

    if (!messageEl) return;

    messageEl.textContent = getFormControlValidationMessage(el);

    return;
}

function updateValidation(
    el: HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement,
    border: "auto" | "neutral" | false = "auto",
) {
    updateFieldMessage(el);
    el.setAttribute("data-show-validation-message", "true");

    if (!border) return;

    el.setAttribute(
        "data-show-validation-border",
        el.validity.valid && border === "neutral"
            ? "neutral"
            : el.validity.valid
              ? "valid"
              : "invalid",
    );

    return;
}

function clearValidation(el: HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement) {
    el.setAttribute("data-had-interaction", "false");
    el.setAttribute("data-update-validation-on-input", "false");
    el.setAttribute("data-show-validation-message", "false");
    el.setAttribute("data-show-validation-border", "false");

    return;
}

function initSimpleMathsCaptcha(formEl: HTMLFormElement) {
    const id =
        formEl.name || formEl.id
            ? (formEl.name ?? formEl.id) + "-simple-maths-captcha"
            : "simple-maths-captcha";

    const activatorButtonEl = formEl.querySelector<HTMLButtonElement>(`#${id}-activator`);

    if (!activatorButtonEl) {
        throw new Error("Failed to initialize SimpleMathsCaptcha - activator button not found.");
    }

    const ntp = new Ntp({
        t1EndpointUrl: "/api/ntp/get-server-time.php",
        t1CalcFn: async function (response: Response) {
            const fetchedData = (await response.json()) as unknown;

            const isValidData = (data: unknown): data is { received_time: number } =>
                typeof data === "object" && data !== null && "received_time" in data;

            return isValidData(fetchedData)
                ? convertUnixTimeFormatToMs(fetchedData.received_time)
                : null;
        },
        t2CalcFn: function (responseHeaders: Headers) {
            const header = responseHeaders.get("Response-Timing");

            if (!header) return null;

            // https://httpd.apache.org/docs/2.4/mod/mod_headers.html#header
            const reqReceivedTime = /\bt=([0-9]+)\b/.exec(header);
            const reqProcessingTime = /\bD=([0-9]+)\b/.exec(header);

            if (!reqReceivedTime || !reqProcessingTime) return null;

            const respTransmitTime =
                Number.parseInt(reqReceivedTime[1]) + Number.parseInt(reqProcessingTime[1]);

            return convertUnixTimeFormatToMs(respTransmitTime);
        },
    });
    const dataEndpoint = {
        url: "/api/simple-maths-captcha/generate-problem.php",
        fetchOptions: {
            method: "POST",
            body: JSON.stringify({ id }),
        },
    };
    const dataHandlerFn = async (response: Response) => {
        const fetchedData = (await response.json()) as unknown;

        const isValidData = (
            data: unknown,
        ): data is {
            digit_1: number;
            digit_2: number;
            generation_time: number;
            valid_for_time: number;
        } =>
            typeof data === "object" &&
            data !== null &&
            "digit_1" in data &&
            "digit_2" in data &&
            "generation_time" in data &&
            "valid_for_time" in data &&
            Object.values(data).every((value) => typeof value === "number");

        if (!isValidData(fetchedData)) return null;

        const { digit_1, digit_2, generation_time, valid_for_time } = fetchedData;

        return {
            digit1: digit_1,
            digit2: digit_2,
            generationTime: generation_time,
            validForTime: valid_for_time,
        };
    };
    const answerInputElEventHandlers = [
        {
            // TODO: Debounce
            type: "input",
            listener: () => {
                captcha.answerInputEl.setAttribute("data-had-interaction", "true");

                // The <input> is marked invalid after the answer is confirmed to be incorrect
                // proceeding the back end validation.
                // On any input, reset the validity state.
                if (captcha.answerInputEl.value.length >= captcha.answerInputEl.minLength) {
                    captcha.answerInputEl.setCustomValidity("");
                }

                if (
                    captcha.answerInputEl.getAttribute("data-update-validation-on-input") === "true"
                ) {
                    updateValidation(captcha.answerInputEl, "neutral");
                }

                return;
            },
        },
        {
            type: "blur",
            listener: () => {
                if (captcha.answerInputEl.getAttribute("data-had-interaction") === "true") {
                    captcha.answerInputEl.setAttribute("data-update-validation-on-input", "true");
                }

                if (
                    captcha.answerInputEl.getAttribute("data-update-validation-on-input") === "true"
                ) {
                    updateValidation(captcha.answerInputEl, "neutral");
                }

                return;
            },
        },
    ];
    const loaderEl = createEl("div", {
        class: "spinner spinner--lg",
        role: "presentation",
    });
    const captcha = new SimpleMathsCaptcha({
        activatorButtonEl,
        id,
        ntp,
        dataEndpoint,
        dataHandlerFn,
        answerInputElEventHandlers,
        loaderEl,
    });

    return captcha;
}

function loadStoredStringifiedFormData(formDataFromAsString: string, formEl: HTMLFormElement) {
    console.info("loadStoredStringifiedFormData: Running...");

    try {
        const formControlEls = formEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
            "input, textarea",
        );
        const formData = JSON.parse(formDataFromAsString) as { [name: string]: string };
        const formControlElsWithFormData = Object.keys(formData);

        formControlEls.forEach((el) => {
            if (formControlElsWithFormData.includes(el.id)) {
                el.value = formData[el.id];
                updateValidation(el);
            }
        });

        return;
    } catch (error) {
        throw error instanceof Error
            ? error
            : new Error("Unknown error retrieving stored form data!");
    }
}

function initStoredFormDataLoader(
    formDataAsString: string,
    formEl: HTMLFormElement,
    notifier: SimpleNotifier,
) {
    console.info("initStoredFormDataLoader: Running...");

    const fieldsetEl = createEl("fieldset");
    const legendEl = createEl("legend", { textContent: "A previously unsent message was stored." });
    const buttonContainerEl = createEl("div", { class: "item-grid" });

    const loadButtonContainerEl = createEl("div", { class: "item" });
    const loadButtonEl = createEl("button", {
        type: "button",
        class: "btn btn--sm",
        textContent: "Load",
    });
    loadButtonEl.addEventListener(
        "click",
        () => {
            loadStoredStringifiedFormData(formDataAsString, formEl);
            fieldsetEl.remove();

            return;
        },
        { once: true },
    );
    loadButtonContainerEl.append(loadButtonEl);

    const clearButtonContainerEl = createEl("div", { class: "item" });
    const clearButtonEl = createEl("button", {
        type: "button",
        class: "btn btn--sm",
        textContent: "Remove",
    });
    clearButtonEl.addEventListener(
        "click",
        () => {
            localStorage.removeItem(`${formEl.name}-data`);
            fieldsetEl.remove();

            notifier.show(NotificationContent.formDataStorage.removed);

            return;
        },
        { once: true },
    );
    clearButtonContainerEl.append(clearButtonEl);

    buttonContainerEl.append(loadButtonContainerEl, clearButtonContainerEl);
    fieldsetEl.append(legendEl, buttonContainerEl);
    formEl.insertBefore(fieldsetEl, formEl.firstElementChild);

    return;
}

function scrollToElWithOffset(elId: string) {
    const firstInvalidFormControl = document.querySelector(`#${elId}`);

    if (!firstInvalidFormControl) return;

    document.documentElement.classList.add("has-scroll-offset");
    firstInvalidFormControl.scrollIntoView();
    document.documentElement.classList.remove("has-scroll-offset");

    return;
}

function makeFormDataObject(formData: FormData, excludedKeys: string[]) {
    const formDataObj: { [key: string]: string } = {};

    for (const [key, value] of formData.entries()) {
        if (excludedKeys.includes(key)) continue;

        if (typeof value !== "string" || value.trim() === "") continue;

        formDataObj[key] = value;
    }

    return formDataObj;
}

async function submitForm(
    formEl: HTMLFormElement,
    captcha: SimpleMathsCaptcha,
    notifier: SimpleNotifier,
) {
    console.info("submitForm: Running...");

    let submitSuccessful = false;
    const formFieldsets = formEl.querySelectorAll<HTMLFieldSetElement>("fieldset");
    const formControlElsWithoutButtons = formEl.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement
    >("input:not([type=button], [type=reset], [type=submit]), textarea");

    try {
        formFieldsets.forEach((el) => {
            el.setAttribute("disabled", "disabled");
        });

        const formData = new FormData();

        formControlElsWithoutButtons.forEach((el) => {
            formData.set(el.name, el.value);
        });

        const response = await fetchWithTimeout("/api/form/submit-contact-form.php", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            if (response.status === HttpStatus.UnprocessableContent) {
                const data = (await response.json()) as unknown;

                const isValidData = (
                    data: unknown,
                ): data is {
                    message: string;
                    invalid_form_controls: {
                        id: string;
                        validation_errors: [string | true];
                    }[];
                } =>
                    typeof data === "object" &&
                    data !== null &&
                    "invalid_form_controls" in data &&
                    Array.isArray(data.invalid_form_controls);

                let invalidCaptchaEl = null;

                if (isValidData(data) && data.invalid_form_controls.length > 0) {
                    scrollToElWithOffset(data.invalid_form_controls[0].id);

                    for (const el of [captcha.activatorButtonEl, captcha.answerInputEl]) {
                        if (invalidCaptchaEl) break;

                        if (!data.invalid_form_controls.find((control) => control.id === el.id))
                            continue;

                        invalidCaptchaEl = el;
                    }
                }

                captcha.answerInputEl.setCustomValidity(invalidCaptchaEl ? "required" : "");

                notifier.show(NotificationContent.submit.validationError);
            } else {
                captcha.answerInputEl.setCustomValidity("");

                localStorage.setItem(
                    `${formEl.name}-data`,
                    JSON.stringify(
                        makeFormDataObject(formData, [
                            captcha.answerInputEl.id,
                            captcha.digit1InputEl.id,
                            captcha.digit2InputEl.id,
                        ]),
                    ),
                );

                notifier.show(NotificationContent.submit.unknownError);
                notifier.show({
                    ...NotificationContent.formDataStorage.stored,
                    hideOlder: false,
                });
            }

            return;
        }

        submitSuccessful = true;

        notifier.show(NotificationContent.submit.success);

        localStorage.removeItem(`${formEl.name}-data`);
        formControlElsWithoutButtons.forEach((el) => (el.value = ""));

        return;
    } catch (error) {
        notifier.show(NotificationContent.submit.unknownError);

        throw error instanceof Error ? error : new Error("Unknown error during form submission!");
    } finally {
        formFieldsets.forEach((el) => el.removeAttribute("disabled"));

        if (!submitSuccessful) {
            const formControlElsToUpdate = formEl.querySelectorAll<
                HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement
            >(
                "button[type=button], input:not([type=hidden], [type=reset], [type=submit]), textarea",
            );
            for (const [, el] of formControlElsToUpdate.entries()) {
                if (
                    el.getAttribute("required") === null &&
                    el.getAttribute("data-required") !== "true"
                )
                    continue;

                if (el.id === captcha.activatorButtonEl.id) {
                    updateValidation(el, false);
                } else {
                    el.setAttribute("data-update-validation-on-input", "true");
                    updateValidation(el);
                }
            }
        } else {
            formControlElsWithoutButtons.forEach((el) => clearValidation(el));
            captcha.deactivate();
        }
    }
}

export default function initContactForm(formEl: HTMLFormElement) {
    console.info("initContactForm: Running...");

    const submitButtonEl = formEl.querySelector("[type=submit]");

    if (!submitButtonEl) {
        throw new Error("submitButtonEl not found!");
    }

    const captcha = initSimpleMathsCaptcha(formEl);
    const notifier = new SimpleNotifier({ hideOlder: true });

    const storedFormData = localStorage.getItem(`${formEl.name}-data`);

    if (storedFormData) {
        initStoredFormDataLoader(storedFormData, formEl, notifier);
    }

    const formControlElsWithoutButtonsOrHidden = formEl.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement
    >("input:not([type=button], [type=hidden], [type=reset], [type=submit]), textarea");
    formControlElsWithoutButtonsOrHidden.forEach((el) => {
        // TODO: Debounce
        el.addEventListener("input", () => {
            el.setAttribute("data-had-interaction", "true");

            if (el.getAttribute("data-update-validation-on-input") === "true") {
                updateValidation(el);
            }

            return;
        });

        el.addEventListener("blur", () => {
            if (el.getAttribute("data-had-interaction") === "true") {
                el.setAttribute("data-update-validation-on-input", "true");
            }

            if (el.getAttribute("data-update-validation-on-input") === "true") {
                updateValidation(el);
            }

            return;
        });
    });

    submitButtonEl.addEventListener("click", (e) => {
        e.preventDefault();
        submitForm(formEl, captcha, notifier).catch((error) => console.error(error));

        return;
    });

    formEl.querySelectorAll("fieldset:disabled").forEach((el) => el.removeAttribute("disabled"));
    formEl.classList.remove("has-overlay");

    return;
}
