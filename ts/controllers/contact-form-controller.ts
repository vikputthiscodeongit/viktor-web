import { createEl, fetchWithTimeout } from "@codebundlesbyvik/js-helpers";
import SimpleNotifier from "@codebundlesbyvik/simple-notifier";
import SimpleMathsCaptcha from "@codebundlesbyvik/simple-maths-captcha";
import { convertUnixTimeFormatToMs } from "@codebundlesbyvik/ntp-sync";

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
                el.setAttribute("data-show-validation", "true");
                el.setAttribute(
                    "data-show-validation-border",
                    el.validity.valid ? "valid" : "invalid",
                );
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
            loadStoredFormData(formDataFromLocalStorage, formEl);
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
            localStorage.removeItem(`${formEl.id}-data`);
            fieldsetEl.remove();

            notifier.show(NotificationContent.msgRemovedFromStorage);

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
            el.setAttribute("disabled", "disabled");
        });

        const formControlElsWithoutButtons = formEl.querySelectorAll<
            HTMLInputElement | HTMLTextAreaElement
        >("input:not([type=button], [type=reset], [type=submit]), textarea");
        const formData = new FormData();

        formControlElsWithoutButtons.forEach((el) => {
            formData.set(el.name, el.value);
        });

        const submitResponse = await fetchWithTimeout("./api/form/submit-contact-form.php", {
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

                let invalidCaptchaEl = null;

                if (responseData.invalid_form_controls.length > 0) {
                    const firstInvalidFormControl = document.querySelector(
                        `#${responseData.invalid_form_controls[0].id}`,
                    );

                    if (firstInvalidFormControl) {
                        document.documentElement.style.scrollPadding = "7.5rem";
                        firstInvalidFormControl.scrollIntoView();
                        document.documentElement.style.scrollPadding = "";
                    }

                    for (const el of [mathsCaptcha.activatorButtonEl, mathsCaptcha.answerInputEl]) {
                        if (invalidCaptchaEl) break;

                        if (
                            !responseData.invalid_form_controls.find(
                                (control) => control.id === el.id,
                            )
                        )
                            continue;

                        invalidCaptchaEl = el;
                    }
                }

                if (invalidCaptchaEl) {
                    mathsCaptcha.answerInputEl.setCustomValidity("required");

                    if (invalidCaptchaEl.id === mathsCaptcha.activatorButtonEl.id) {
                        updateFieldMessage(mathsCaptcha.activatorButtonEl);
                        mathsCaptcha.activatorButtonEl.setAttribute("data-show-validation", "true");
                    }
                } else {
                    mathsCaptcha.answerInputEl.setCustomValidity("");
                    // No need to update the activatorButton validation message as all data attributes
                    // are reset on deactivation.
                }

                notifier.show(NotificationContent.submitErrorValidationFailed);
            } else {
                mathsCaptcha.answerInputEl.setCustomValidity("");

                const formDataObj: { [name: string]: string } = {};

                for (const [name, value] of formData.entries()) {
                    if (mathsCaptcha.isCaptchaInputEl(name)) continue;

                    // This form has no input of type "file".
                    if (typeof value !== "string" || value.trim() === "") continue;

                    formDataObj[name] = value;
                }

                localStorage.setItem(`${formEl.id}-data`, JSON.stringify(formDataObj));

                notifier.show(NotificationContent.submitErrorUnknown);
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

        const formControlElsWithoutButtonsAndHidden = formEl.querySelectorAll<
            HTMLInputElement | HTMLTextAreaElement
        >("input:not([type=button], [type=hidden], [type=reset], [type=submit]), textarea");
        formControlElsWithoutButtonsAndHidden.forEach((el) => {
            updateFieldMessage(el);

            if (submitSuccessful) {
                el.setAttribute("data-had-interaction", "false");
                el.setAttribute("data-show-validation", "false");
                el.setAttribute("data-show-validation-border", "false");

                mathsCaptcha.deactivate();
            } else {
                el.setAttribute("data-show-validation", "true");

                if (el.getAttribute("required") !== null) {
                    el.setAttribute(
                        "data-show-validation-border",
                        el.validity.valid ? "valid" : "invalid",
                    );
                }
            }
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

        const notifier = new SimpleNotifier({ hideOlder: true });
        const mathsCaptcha = new SimpleMathsCaptcha({
            activatorButtonEl: mathsCaptchaActivatorButtonEl,
            baseId: formEl.id,
            generatorEndpoint: {
                url: "./api/simple-maths-captcha/generate-problem.php",
                fetchOptions: {
                    method: "POST",
                    body: JSON.stringify({ base_id: formEl.id }),
                },
            },
            answerInputElEventHandlers: [
                {
                    type: "input",
                    listener: () => {
                        console.debug("initContactForm: `input` event fired on SMC input.");

                        mathsCaptcha.answerInputEl.setAttribute("data-had-interaction", "true");

                        // The <input> is marked invalid after the answer is confirmed to be incorrect
                        // proceeding the back end validation.
                        // On any input, reset the validity state so that validation elements & styles
                        // are gone until next the validation.
                        if (
                            mathsCaptcha.answerInputEl.value.length >=
                            mathsCaptcha.answerInputEl.minLength
                        ) {
                            console.debug(
                                "initContactForm: Setting SMC input custom validity to empty...",
                            );

                            mathsCaptcha.answerInputEl.setCustomValidity("");
                        }

                        if (
                            mathsCaptcha.answerInputEl.getAttribute("data-show-validation") ===
                            "true"
                        ) {
                            console.debug(
                                "initContactForm: Updating SMC validation elements & styles...",
                            );
                            console.debug(
                                "mathsCaptcha.answerInputEl.validity:",
                                mathsCaptcha.answerInputEl.validity,
                            );

                            updateFieldMessage(mathsCaptcha.answerInputEl);
                            mathsCaptcha.answerInputEl.setAttribute(
                                "data-show-validation-border",
                                mathsCaptcha.answerInputEl.validity.valid ? "neutral" : "invalid",
                            );
                        }

                        return;
                    },
                },
                {
                    type: "blur",
                    listener: () => {
                        console.debug("initContactForm: `blur` event fired on SMC input.");

                        if (
                            mathsCaptcha.answerInputEl.getAttribute("data-had-interaction") ===
                            "true"
                        ) {
                            mathsCaptcha.answerInputEl.setAttribute("data-show-validation", "true");
                        }

                        if (
                            mathsCaptcha.answerInputEl.getAttribute("data-show-validation") ===
                            "true"
                        ) {
                            console.debug(
                                "initContactForm: Updating SMC validation elements & styles...",
                            );
                            console.debug(
                                "mathsCaptcha.answerInputEl.validity:",
                                mathsCaptcha.answerInputEl.validity,
                            );

                            updateFieldMessage(mathsCaptcha.answerInputEl);
                            mathsCaptcha.answerInputEl.setAttribute(
                                "data-show-validation-border",
                                mathsCaptcha.answerInputEl.validity.valid ? "neutral" : "invalid",
                            );
                        }

                        return;
                    },
                },
            ],
            ntpOptions: {
                t1EndpointUrl: "./api/ntp/get-server-time.php",
                t1CalcFn: async function t1CalcFn(response: Response) {
                    const data = (await response.json()) as { req_received_time: number };

                    return convertUnixTimeFormatToMs(data.req_received_time);
                },
                t2CalcFn: function t2CalcFn(resHeaders: Headers) {
                    // https://httpd.apache.org/docs/2.4/mod/mod_headers.html#header
                    const header = resHeaders.get("Response-Timing");

                    if (!header) {
                        return null;
                    }

                    const reqReceivedTime = /\bt=([0-9]+)\b/.exec(header);
                    const reqProcessingTime = /\bD=([0-9]+)\b/.exec(header);

                    if (!reqReceivedTime || !reqProcessingTime) {
                        return null;
                    }

                    const resTransmitTime =
                        Number.parseInt(reqReceivedTime[1]) + Number.parseInt(reqProcessingTime[1]);

                    return convertUnixTimeFormatToMs(resTransmitTime);
                },
            },
        });

        const storedFormData = localStorage.getItem(`${formEl.id}-data`);

        if (storedFormData) {
            initStoredFormDataLoader(storedFormData, formEl, notifier);
        }

        const formControlElsWithoutButtonsAndHidden = formEl.querySelectorAll<
            HTMLInputElement | HTMLTextAreaElement
        >("input:not([type=button], [type=hidden], [type=reset], [type=submit]), textarea");

        formControlElsWithoutButtonsAndHidden.forEach((el) => {
            // TODO: Debounce
            el.addEventListener("input", () => {
                console.debug("initContactForm: `input` event fired on form control.");

                el.setAttribute("data-had-interaction", "true");

                if (el.getAttribute("data-show-validation") === "true") {
                    console.debug("initContactForm: Updating validation elements & styles...");

                    updateFieldMessage(el);
                    el.setAttribute(
                        "data-show-validation-border",
                        el.validity.valid ? "valid" : "invalid",
                    );
                }

                return;
            });

            el.addEventListener("blur", () => {
                console.debug("initContactForm: `blur` event fired on form control.");

                if (el.getAttribute("data-had-interaction") === "true") {
                    el.setAttribute("data-show-validation", "true");
                }

                if (el.getAttribute("data-show-validation") === "true") {
                    console.debug("initContactForm: Updating validation elements & styles...");

                    updateFieldMessage(el);
                    el.setAttribute(
                        "data-show-validation-border",
                        el.validity.valid ? "valid" : "invalid",
                    );
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
