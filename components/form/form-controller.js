export default function initForm(formEl) {
    // TODO: Do the following after form interaction.
    const disabledEls = formEl.querySelectorAll(":disabled");
    disabledEls.forEach((el) => el.removeAttribute("disabled"));

    const submitInputEl = formEl.querySelector("[type=submit]");
    submitInputEl.addEventListener("click", (e) => sendForm(e));
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
