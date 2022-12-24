export default function initContactForm(formEl) {
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
