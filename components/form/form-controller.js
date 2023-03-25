import initFormMc from "../form-mc/form-mc-controller";
import SimpleNotifier from "@codebundlesbyvik/simple-notifier";

const USER_STATUS_MESSAGES = {
    200: "Message sent - I'll be in touch soon :).",
    405: "An error occurred - your message has not been sent. Please try again at a later time.",
    422: "One or more fields didn't pass validation, please check and correct them.",
    500: "An error occurred - your message has not been sent. Please try again at a later time.",
    502: "An error occurred - your message has not been sent. Please try again at a later time."
const FORM_STORED_MSG_EL_SKELETONS = {
    fieldset: {
        el: "fieldset"
    },
    field: {
        el: "div",
        attrs: {
            class: "field"
        }
    },
    explainer: {
        el: "p",
        attrs: {
            id: `stored-msg-info`,
            text: "Your last message failed to send and was stored.",
        }
    },
    loadStorageButton: {
        el: "button",
        attrs: {
            class: "button",
            ariaLabelledby: `stored-msg-info`,
            text: "Insert message in form"
        }
    },
    clearStorageButton: {
        el: "button",
        attrs: {
            class: "button",
            ariaLabelledby: `stored-msg-info`,
            text: "Remove message from storage"
        }
    }
};

function createEl(tagName, attrs) {
    const el = document.createElement(tagName);

    if (attrs) {
        for (let [prop, val] of Object.entries(attrs)) {
            if (prop === "text") {
                el.innerText = val;

                continue;
            }

            prop = prop.replace(/[A-Z0-9]/g, letter => `-${letter.toLowerCase()}`);
            el.setAttribute(prop, val);
        }
    }

    return el;
}

function createEls(elSkeletons) {
    let els = {};

    for (const [name, skeleton] of Object.entries(elSkeletons)) {
        const el = createEl(skeleton.el, skeleton.attrs);
        els[name] = el;
    }

    console.log(els);
    return els;
}

export default async function initForm(formEl) {
    // // TODO: Do the following after form interaction.

    const alert = new SimpleNotifier();
    alert.init();

    // const mcEl = formEl.querySelector("[name=cf-mc]");
    // console.log(mcEl);

    // try {
    //     const mcInit = await initFormMc(mcEl);

    //     if (mcInit !== true) {
    //         console.warn("form-mc not initiated.");
    //     }

        const elsToEnable = formEl.querySelectorAll(".js-enable:disabled");
        elsToEnable.forEach((el) => el.removeAttribute("disabled"));

        if (localStorage.getItem(`${formEl.name}-data`)) {
            makeStorageEls(formEl, FORM_STORED_MSG_EL_SKELETONS, notifier);
        }

        const submitInputEl = formEl.querySelector("[type=submit]");
        submitInputEl.addEventListener("click", (e) => submitForm(e, alert));
    // } catch (error) {
    //     return console.error(error);
    // }
}

let formDataClearTimeout;

async function submitForm(e, alert) {
    e.preventDefault();

    if (formDataClearTimeout) {
        clearTimeout(formDataClearTimeout);
    }

    const form = e.target.form;
    const formData = new FormData(form);
    const formSendResponse = await sendForm(formData);

    if (formSendResponse.status === 200) {
        console.log("submitForm(): Form sent successfully.");

        formDataClearTimeout = setTimeout(clearForm, 3000, form);
    }

    if (formSendResponse.status === 502 || formSendResponse instanceof Error) {
        console.log("submitForm(): Storing form data...");

        storeFormInput(form.name, formSendResponse.data);
    }

    const [alertMessage, alertType] = getMessageByStatusCode(formSendResponse.status);
    alert.show(alertMessage, alertType);
}

async function sendForm(formData) {
    try {
        const response = await fetch("./components/form/form-controller.php", {
            method: "POST",
            body: formData,
        });
        console.log(response);

        const contentType = response.headers.get("Content-Type");

        if (!contentType.includes("application/json")) {
            throw new Error("sendForm(): Response type invalid.");
        }

        const data = await response.json();
        console.log(data);

        return { status: response.status, data };
    } catch (error) {
        return error;
    }
}

function clearForm(form) {
    const inputEls = form.querySelectorAll("input:not([type=button], [type=reset], [type=submit]), textarea");
    console.log(inputEls);

    inputEls.forEach((input) => input.value = "");
}


function storeFormInput(formName, formData) {
    console.log(`storeFormInput - formName: ${formName}`);
    console.log(`storeFormInput - formData: ${formData}`);

    const key = `${formName}-data`;
    const value = JSON.stringify(formData);
    localStorage.setItem(key, value);
}

function getMessageByStatusCode(statusCode) {
    const message = USER_STATUS_MESSAGES[statusCode] ?? USER_STATUS_MESSAGES[500];
    const messageType = statusCode === 200 ? "success" : "warning";
    return [message, messageType];
}

function loadStorageFormData(form) {
    const storageItem = localStorage.getItem(`${form.name}-data`);
    const formData = JSON.parse(storageItem);
    console.log(`loadStorageFormData - formData: ${formData}`);

    const inputElList = document.querySelectorAll(`form[name=${form.name}] input, form[name=${form.name}] textarea`)
    const inputEls = Array.prototype.slice.call(inputElList);
    console.log(`loadStorageFormData - inputEls: ${inputEls}`);

    Object.keys(formData).map((inputName) => {
        inputEls.map((input) => input.name === inputName ? input.value = formData[inputName] : false);
    });
}

function makeStorageEls(formEl, elSkeletons, notifier) {
    elSkeletons = getStoredFormDataElSkeletons(formEl.name, elSkeletons);
    const els = createEls(elSkeletons);

    els.field.appendChild(els.explainer);
    els.field.appendChild(els.loadStorageButton);
    els.field.appendChild(els.clearStorageButton);
    els.fieldset.appendChild(els.field);
    formEl.insertBefore(els.fieldset, formEl.firstElementChild);

    els.loadStorageButton.addEventListener("click", () => loadStoredFormData(formEl));
    els.clearStorageButton.addEventListener("click", () => {
        localStorage.removeItem(`${formEl.name}-data`);
        notifier.show("Your locally stored message has been removed.", "info");
        setTimeout(() => els.fieldset.remove(), 3500);
    });
}

function getStoredFormDataElSkeletons(formName, elSkeletons) {
    const SEARCH_VALUES = {
        explainer: "id",
        loadStorageButton: "ariaLabelledby",
        clearStorageButton: "ariaLabelledby"
    };

    let modifiedSkeletons = {...elSkeletons};

    for (const [elName, skeleton] of Object.entries(modifiedSkeletons)) {
        if (SEARCH_VALUES.hasOwnProperty(elName)) {
            skeleton.attrs[SEARCH_VALUES[elName]] = `${formName}-${skeleton.attrs[elName]}`;
        }
    }

    console.log(modifiedSkeletons);
    return modifiedSkeletons;
}
