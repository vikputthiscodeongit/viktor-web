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
        submitInputEl.addEventListener("click", (e) => sendForm(e, alert));
    // } catch (error) {
    //     return console.error(error);
    // }
}

async function sendForm(e, alert) {
    e.preventDefault();

    try {
        const response = await fetch("./components/form/form-controller.php", {
            method: "POST",
            body: new FormData(e.target.form),
        });

        if (!response.ok) {
            console.warn("Recieved erroreous response.");
        }

        const data = await response.json();
        console.log(data);

        const message = getStatusMessage(response, data);
        alert.show(message);

        return data;
    } catch (error) {
        return console.error(error);
    }
}

function getStatusMessage(response, data) {
    switch (response.status) {
        case 200:
            return ;

        case 405:
            return ;

        case 422:
            return ;

        case 500:
            return ;

        case 502:
            return ;

        default:
            return ;
    }
}
