import type SimpleNotifier from "@codebundlesbyvik/simple-notifier";
import { createEl } from "@codebundlesbyvik/js-helpers";

const MESSAGE_STORED_TEXT = "A previously unsent message was stored.";
const MESSAGE_REMOVED_TEXT = "Message removed from storage.";

export function makeFormDataObject(formData: FormData, excludedKeys: string[]) {
    const formDataObj: { [key: string]: string } = {};

    for (const [key, value] of formData.entries()) {
        if (excludedKeys.includes(key)) continue;

        if (typeof value !== "string" || value.trim() === "") continue;

        formDataObj[key] = value;
    }

    return formDataObj;
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

export function initStoredFormDataLoader(
    formDataAsString: string,
    formEl: HTMLFormElement,
    notifier: SimpleNotifier,
) {
    console.info("initStoredFormDataLoader: Running...");

    const fieldsetEl = createEl("fieldset");
    const legendEl = createEl("legend", { textContent: MESSAGE_STORED_TEXT });
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

            notifier.show(MESSAGE_REMOVED_TEXT);

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
