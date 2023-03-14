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

        const elsToEnable = formEl.querySelectorAll(".js-enable:disabled");
        elsToEnable.forEach((el) => el.removeAttribute("disabled"));

        const submitInputEl = formEl.querySelector("[type=submit]");
        submitInputEl.addEventListener("click", (e) => submitForm(e, alert));
    // } catch (error) {
    //     return console.error(error);
    // }
}

async function submitForm(e, alert) {
    e.preventDefault();

    const form = e.target.form;
    const formData = new FormData(form);
    const formSendResponse = await sendForm(formData);

    showAlert(alert, formSendResponse[0]);
}

async function sendForm(formData) {
    try {
        const response = await fetch("./components/form/form-controller.php", {
            method: "POST",
            body: formData,
        });
        console.log(response);
        const data = response.json();

        if (!response.ok) {
            console.warn("sendForm(): Recieved erroreous response.");
        }

        return [response.status, data];
    } catch (error) {
        console.error(error);
    }
}

function showAlert(alert, statusCode) {
    const message = USER_STATUS_MESSAGES[statusCode] ?? USER_STATUS_MESSAGES[500];
    alert.show(message);
}


}
