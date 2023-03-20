import initFormMc from "../form-mc/form-mc-controller";
import SimpleNotifier from "@codebundlesbyvik/simple-notifier";

const USER_STATUS_MESSAGES = {
    200: "Message sent - I'll be in touch soon :).",
    405: "An error occurred - your message has not been sent. Please try again at a later time.",
    422: "One or more fields didn't pass validation, please check and correct them.",
    500: "An error occurred - your message has not been sent. Please try again at a later time.",
    502: "An error occurred - your message has not been sent. Please try again at a later time."
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

        if (localStorage.getItem(`${formEl.name}-data`)) {
            const loadStorageButtonEl = Object.assign(
                document.createElement("button"),
                {
                    type: "button",
                    value: "Load values"
                }
            );

            formEl.appendChild(loadStorageButtonEl);
            loadStorageButtonEl.addEventListener("click", () => loadStorageFormData(formEl));
        }

        const elsToEnable = formEl.querySelectorAll(".js-enable:disabled");
        elsToEnable.forEach((el) => el.removeAttribute("disabled"));

        const submitInputEl = formEl.querySelector("[type=submit]");
        submitInputEl.addEventListener("click", (e) => submitForm(e, alert));
    // } catch (error) {
    //     return console.error(error);
    // }
}

var formDataClearTimeout;

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
    const inputs = form.querySelectorAll("input:not([type=button], [type=reset], [type=submit]), textarea");
    console.log(inputs);

    inputs.forEach((input) => input.value = "");
}


function storeFormInput(formName, formData) {
    console.log(formData);

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
};
