import initFormMc from "../form-mc/form-mc-controller";

export default async function initForm(formEl) {
    // TODO: Do the following after form interaction.

    try {
        const mcInit = await initFormMc(formEl);

        if (mcInit !== true) {
            console.warn("form-mc not initiated.");
        }

        const disabledEls = formEl.querySelectorAll(":disabled");
        disabledEls.forEach((el) => el.removeAttribute("disabled"));

        const submitInputEl = formEl.querySelector("[type=submit]");
        submitInputEl.addEventListener("click", (e) => sendForm(e));
    } catch (error) {
        return console.error(error);
    }
}

async function sendForm(e) {
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

        return data;
    } catch (error) {
        return console.error(error);
    }
}
