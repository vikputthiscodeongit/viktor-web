const FormControlValidationMessage = {
    default: "Input invalid",
    emailTypeMismatch: "Email address invalid",
    tooLong: "Input must be shorter than %d characters",
    tooShort: "Input must contain more than %d characters",
    patternMismatch: "Input format invalid",
    valueMissing: "Input required",
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
        return FormControlValidationMessage.valueMissing;
    }

    if (el.validity.typeMismatch && el.type === "email") {
        return FormControlValidationMessage.emailTypeMismatch;
    }

    if (el.validity.patternMismatch || el.validity.typeMismatch) {
        return FormControlValidationMessage.patternMismatch;
    }

    if (el.validity.tooLong) {
        const maxLength = el.getAttribute("maxlength");
        const message = FormControlValidationMessage.tooLong.replace(
            "%d",
            maxLength || "the current amount of",
        );

        return message;
    }

    if (el.validity.tooShort) {
        const minLength = el.getAttribute("minlength");
        const message = FormControlValidationMessage.tooShort.replace(
            "%d",
            minLength || "the current amount of",
        );

        return message;
    }

    return FormControlValidationMessage.default;
}

export function updateValidation(
    el: HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement,
    border: "auto" | "neutral" = "auto",
) {
    const messageEl = el?.parentElement?.querySelector(".field__message");
    if (messageEl) messageEl.textContent = getFormControlValidationMessage(el);

    el.setAttribute("data-show-validation-message", "true");
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

export function clearValidation(el: HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement) {
    el.setAttribute("data-had-interaction", "false");
    el.setAttribute("data-validation-on-input", "false");
    el.setAttribute("data-show-validation-message", "false");
    el.setAttribute("data-show-validation-border", "false");

    return;
}
