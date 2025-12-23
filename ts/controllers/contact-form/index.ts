// TODO:
// * Fade out Simple Notifications when #contact not in viewport.

import type SimpleMathsCaptcha from "@codebundlesbyvik/simple-maths-captcha";
import { fetchWithTimeout } from "@codebundlesbyvik/js-helpers";
import SimpleNotifier from "@codebundlesbyvik/simple-notifier";
import { UPROCESSABLE_CONTENT } from "../../helpers/http-status-codes";
import { initSimpleMathsCaptcha } from "./captcha-init";
import { initStoredFormDataLoader, makeFormDataObject } from "./store-data";
import { clearValidation, updateValidation } from "./validate";

type UnprocessableContentData = {
    message: string;
    invalid_controls: {
        id: string;
        errors: string[];
    }[];
};

const NotificationContent = {
    messageStored: {
        text: [
            "Your message has been stored on your device.",
            "You may close this page and come back at a later time to retry sending it.",
        ],
        variant: "warning",
        hideAfterTime: 6000,
    },
    submitted: {
        title: "Message sent",
        text: "I'll be in touch soon!",
        variant: "success",
    },
    unknownError: {
        text: "Failed to send message. Please try again at a later time.",
        variant: "error",
    },
    validationError: {
        text: "One or more fields failed validation. Please check and correct them.",
        variant: "warning",
    },
};

async function submitForm({
    formEl,
    captcha,
    notifier,
}: {
    formEl: HTMLFormElement;
    captcha?: SimpleMathsCaptcha;
    notifier: SimpleNotifier;
}) {
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
            if (response.status === UPROCESSABLE_CONTENT) {
                const data = (await response.json()) as unknown;

                const isValidData = (data: unknown): data is UnprocessableContentData =>
                    typeof data === "object" &&
                    data !== null &&
                    "invalid_controls" in data &&
                    Array.isArray(data.invalid_controls);

                let invalidCaptchaEl = null;

                if (isValidData(data) && data.invalid_controls.length > 0) {
                    const scrollTarget = document.querySelector(`#${data.invalid_controls[0].id}`);

                    if (scrollTarget) {
                        document.documentElement.classList.add("has-scroll-offset");
                        scrollTarget.scrollIntoView();
                        document.documentElement.classList.remove("has-scroll-offset");
                    }

                    if (captcha) {
                        for (const el of [captcha.activatorButtonEl, captcha.answerInputEl]) {
                            if (!data.invalid_controls.find((control) => control.id === el.id))
                                continue;

                            invalidCaptchaEl = el;

                            break;
                        }
                    }
                }

                if (captcha) {
                    captcha.answerInputEl.setCustomValidity(invalidCaptchaEl ? "required" : "");
                }

                notifier.show(NotificationContent.validationError);
            } else {
                const formDataObjExcludedKeys = [];

                if (captcha) {
                    captcha.answerInputEl.setCustomValidity("");

                    formDataObjExcludedKeys.push(
                        captcha.answerInputEl.id,
                        captcha.digit1InputEl.id,
                        captcha.digit2InputEl.id,
                    );
                }

                localStorage.setItem(
                    `${formEl.name}-data`,
                    JSON.stringify(makeFormDataObject(formData, formDataObjExcludedKeys)),
                );

                notifier.show(NotificationContent.unknownError);
                notifier.show({
                    ...NotificationContent.messageStored,
                    hideOlder: false,
                });
            }

            return;
        }

        submitSuccessful = true;

        notifier.show(NotificationContent.submitted);

        localStorage.removeItem(`${formEl.name}-data`);
        formControlElsWithoutButtons.forEach((el) => (el.value = ""));

        return;
    } catch (error) {
        notifier.show(NotificationContent.unknownError);

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

                if (!captcha || el.id === captcha.activatorButtonEl.id) {
                    el.setAttribute("data-validation-on-input", "true");
                }

                updateValidation(el);
            }
        } else {
            formControlElsWithoutButtons.forEach((el) => clearValidation(el));
            if (captcha) captcha.deactivate();
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

            if (el.getAttribute("data-validation-on-input") === "true") {
                updateValidation(el);
            }

            return;
        });

        el.addEventListener("blur", () => {
            if (el.getAttribute("data-had-interaction") === "true") {
                el.setAttribute("data-validation-on-input", "true");
            }

            if (el.getAttribute("data-validation-on-input") === "true") {
                updateValidation(el);
            }

            return;
        });
    });

    submitButtonEl.addEventListener("click", (e) => {
        e.preventDefault();
        submitForm({ formEl, captcha, notifier }).catch((error) => console.error(error));

        return;
    });

    formEl.querySelectorAll("fieldset:disabled").forEach((el) => el.removeAttribute("disabled"));
    formEl.classList.remove("has-overlay");

    return;
}
