// TODO:
// * Add border when CAPTCHA :valid.
// Possible solution: add instance option for answerInputEl data attributes to be
// added on either input and/or submit. Would solve :invalid border missing when
// form submit produces HTTP 500 and CAPTCHA is :valid.

import { createEl, fetchWithTimeout } from "@codebundlesbyvik/js-helpers";
import SimpleNotifier from "@codebundlesbyvik/simple-notifier";
import SimpleMathsCaptcha from "../simple-maths-captcha/simple-maths-captcha-controller";

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
    sumbitSuccess: {
        title: "Message sent",
        text: "I'll be in touch soon!",
        variant: "success",
    },
    submitErrorCaptchaInactive: {
        text: "CAPTCHA is required. Please load it and solve the problem.",
        variant: "warning",
    },
    submitErrorValidationFailed: {
        text: "One or more fields failed validation. Please check and correct them.",
        variant: "warning",
    },
    submitErrorUnknown: {
        text: "Failed to send message. Please try again at a later time.",
        variant: "error",
    },
    msgInStorage: {
        text: "A previously unsent message was stored.",
        variant: "info",
    },
    msgPushedToStorage: {
        text: "Your message has been stored on your device. You may close this page and come back at a later time to retry sending it.",
        variant: "info",
        hideAfterTime: 8000,
    },
    msgRemovedFromStorage: {
        text: "Message removed from storage.",
        variant: "info",
    },
};

function getFormControlValidationMessage(
    el: HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement,
) {
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

function loadStoredFormData(formDataFromLocalStorage: string, formEl: HTMLFormElement) {
    console.info("loadStoredFormData: Running...");

    try {
        const formControlElsWithoutButtons = formEl.querySelectorAll<
            HTMLInputElement | HTMLTextAreaElement
        >("input:not([type=button], [type=reset], [type=submit]), textarea");
        const formData = JSON.parse(formDataFromLocalStorage) as { [name: string]: string };
        const formControlElsWithFormData = Object.keys(formData);

        formControlElsWithoutButtons.forEach((el) => {
            if (formControlElsWithFormData.includes(el.id)) {
                el.value = formData[el.id];
                updateFieldMessage(el);
                el.setAttribute("data-has-input", "true");
                el.setAttribute("data-had-interaction", "true");
                el.setAttribute("data-show-validation-message", "true");
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
    formDataFromLocalStorage: string,
    formEl: HTMLFormElement,
    notifier: SimpleNotifier,
) {
    console.info("initStoredFormDataLoader: Running...");

    const fieldsetEl = createEl("fieldset");
    const fieldEl = createEl("div", { class: "field" });
    const legendEl = createEl("legend", { textContent: "A previously unsent message was stored." });
    const buttonContainerEl = createEl("div", { class: "item-grid" });

    const loadButtonEl = createEl("button", {
        type: "button",
        class: "btn btn--sm",
        textContent: "Load",
    });
    loadButtonEl.addEventListener(
        "click",
        () => {
            loadStoredFormData(formDataFromLocalStorage, formEl);
            fieldsetEl.remove();

            return;
        },
        { once: true },
    );
    buttonContainerEl.append(loadButtonEl);

    const clearButtonEl = createEl("button", {
        type: "button",
        class: "btn btn--sm",
        textContent: "Remove",
    });
    clearButtonEl.addEventListener(
        "click",
        () => {
            localStorage.removeItem(`${formEl.id}-data`);
            fieldsetEl.remove();

            notifier.show(NotificationContent.msgRemovedFromStorage);

            return;
        },
        { once: true },
    );
    buttonContainerEl.append(clearButtonEl);

    fieldEl.append(legendEl, buttonContainerEl);
    fieldsetEl.append(fieldEl);
    formEl.insertBefore(fieldsetEl, formEl.firstElementChild);

    return;
}

async function submitForm(
    formEl: HTMLFormElement,
    mathsCaptcha: SimpleMathsCaptcha,
    notifier: SimpleNotifier,
) {
    console.info("submitForm: Running...");

    let submitSuccessful = false;
    const formFieldsets = formEl.querySelectorAll<HTMLFieldSetElement>("fieldset");

    try {
        formFieldsets.forEach((el) => {
            el.setAttribute("disabled", "true");
        });

        const formControlElsWithoutButtons = formEl.querySelectorAll<
            HTMLInputElement | HTMLTextAreaElement
        >("input:not([type=button], [type=reset], [type=submit]), textarea");
        const formData = new FormData();

        formControlElsWithoutButtons.forEach((el) => {
            formData.set(el.name, el.value);
        });

        const submitResponse = await fetchWithTimeout("./api/contact-form/submit-form.php", {
            method: "POST",
            body: formData,
        });

        if (!submitResponse.ok) {
            if (submitResponse.status === HttpStatus.UnprocessableContent) {
                const responseData = (await submitResponse.json()) as {
                    message: string;
                    invalid_form_controls: {
                        id: string;
                        validation_errors: [string | true];
                    }[];
                };

                let notificationOptions = NotificationContent.submitErrorValidationFailed;

                if (
                    responseData.invalid_form_controls.find((control) =>
                        control.id.includes(mathsCaptcha.answerInputEl.id),
                    )
                ) {
                    mathsCaptcha.setIsValidState(false);

                    if (
                        responseData.invalid_form_controls.length === 1 &&
                        responseData.invalid_form_controls[0].validation_errors.includes(true)
                    ) {
                        notificationOptions = NotificationContent.submitErrorCaptchaInactive;
                    }
                } else {
                    mathsCaptcha.setIsValidState(true);
                }

                notifier.show(notificationOptions);
            } else {
                notifier.show(NotificationContent.submitErrorUnknown);

                mathsCaptcha.setIsValidState(true);

                const formDataObj: { [name: string]: string } = {};

                // TODO: Fix TypeScript error.
                for (const [name, value] of formData.entries()) {
                    if (mathsCaptcha.isCaptchaInputEl(name)) continue;

                    // This form has no input of type "file".
                    if (typeof value !== "string" || value.trim() === "") continue;

                    formDataObj[name] = value;
                }

                localStorage.setItem(`${formEl.id}-data`, JSON.stringify(formDataObj));

                notifier.show({
                    ...NotificationContent.msgPushedToStorage,
                    hideOlder: false,
                });
            }

            return;
        }

        submitSuccessful = true;

        notifier.show(NotificationContent.sumbitSuccess);

        localStorage.removeItem(`${formEl.id}-data`);
        formControlElsWithoutButtons.forEach((el) => (el.value = ""));

        return;
    } catch (error) {
        notifier.show(NotificationContent.submitErrorUnknown);

        throw error instanceof Error ? error : new Error("Unknown error during form submission!");
    } finally {
        formFieldsets.forEach((el) => el.removeAttribute("disabled"));

        const formControlElsWithButtonButtonsWithId = formEl.querySelectorAll<
            HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement
        >(
            "button[id]:not([type=reset], [type=submit]), input:not([type=reset], [type=submit]), textarea",
        );
        formControlElsWithButtonButtonsWithId.forEach((el) => {
            updateFieldMessage(el);
            el.setAttribute("data-show-validation-message", !submitSuccessful ? "true" : "false");
        });
    }
}

export default function initContactForm(formEl: HTMLFormElement) {
    console.info("initContactForm: Running...");

    try {
        const submitButtonEl = formEl.querySelector("[type=submit]");

        if (!submitButtonEl) {
            throw new Error("submitButtonEl not found!");
        }

        const mathsCaptchaActivatorButtonEl = formEl.querySelector<HTMLButtonElement>(
            `#${formEl.id}-simple-maths-captcha-activator`,
        );

        if (!mathsCaptchaActivatorButtonEl) {
            throw new Error("mathsCaptchaActivatorButtonEl not found!");
        }

        const mathsCaptcha = new SimpleMathsCaptcha({
            activatorButtonEl: mathsCaptchaActivatorButtonEl,
            baseId: `${formEl.id}-simple-maths-captcha`,
        });
        const notifier = new SimpleNotifier({ hideOlder: true });

        const storedFormData = localStorage.getItem(`${formEl.id}-data`);

        if (storedFormData) {
            initStoredFormDataLoader(storedFormData, formEl, notifier);
        }

        const formControlElsWithoutButtons = formEl.querySelectorAll<
            HTMLInputElement | HTMLTextAreaElement
        >("input:not([type=button], [type=reset], [type=submit]), textarea");

        formControlElsWithoutButtons.forEach((el) => {
            el.setAttribute("data-show-validation-message", "false");

            el.addEventListener(
                "input",
                () => {
                    console.debug(
                        "initContactForm: `input` event fired for first time on form control.",
                    );

                    el.setAttribute("data-had-interaction", "true");

                    return;
                },
                { once: true },
            );

            // TODO: Debounce
            el.addEventListener("input", () => {
                console.debug("initContactForm: `input` event fired on form control.");

                updateFieldMessage(el);

                if (el.value !== "") {
                    el.setAttribute("data-has-input", "true");
                } else {
                    el.removeAttribute("data-has-input");
                }

                return;
            });

            el.addEventListener("blur", () => {
                console.debug("initContactForm: `blur` event fired on form control.");

                if (el.hasAttribute("data-has-input") && el.hasAttribute("data-had-interaction")) {
                    el.setAttribute("data-show-validation-message", "true");
                }

                return;
            });
        });

        submitButtonEl.addEventListener("click", (e) => {
            e.preventDefault();

            submitForm(formEl, mathsCaptcha, notifier).catch((error) => console.error(error));

            return;
        });

        formEl
            .querySelectorAll("fieldset:disabled")
            .forEach((el) => el.removeAttribute("disabled"));

        formEl.classList.remove("has-overlay");

        return;
    } catch (error) {
        throw error instanceof Error
            ? error
            : new Error("Unknown error during form initialization!");
    }
}
