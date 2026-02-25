import { createEl } from "@codebundlesbyvik/js-helpers";

const MESSAGE_STORED_TEXT = "A previously unsent message was stored.";

export function makeFormDataObject(formData: FormData, excludedKeys: string[]) {
    const formDataObj: { [key: string]: string } = {};

    for (const [key, value] of formData.entries()) {
        if (excludedKeys.includes(key)) continue;

        if (typeof value !== "string" || value.trim() === "") continue;

        formDataObj[key] = value;
    }

    return formDataObj;
}

function loadStoredStringifiedFormData(formDataAsString: string, formEl: HTMLFormElement) {
    console.info("loadStoredStringifiedFormData: Running...");

    try {
        const formControlEls = formEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
            "input, textarea",
        );
        const formData = JSON.parse(formDataAsString) as { [name: string]: string };
        const formControlElsWithFormData = Object.keys(formData);

        formControlEls.forEach((el) => {
            if (formControlElsWithFormData.includes(el.id)) {
                el.value = formData[el.id];
                el.dispatchEvent(new Event("input"));
                el.dispatchEvent(new Event("blur"));
            }
        });

        return;
    } catch (error) {
        throw error instanceof Error
            ? error
            : new Error("Unknown error retrieving stored form data!");
    }
}

export function initStoredFormDataLoader(formDataAsString: string, formEl: HTMLFormElement) {
    console.info("initStoredFormDataLoader: Running...");

    const fieldsetEl = createEl("fieldset");
    const legendEl = createEl("legend", { textContent: MESSAGE_STORED_TEXT });

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

    fieldsetEl.append(legendEl, loadButtonEl);
    formEl.insertBefore(fieldsetEl, formEl.firstElementChild);

    return;
}
