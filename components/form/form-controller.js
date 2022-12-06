export default async function sendForm(e) {
    e.preventDefault();

    try {
        const response = await fetch("./components/form/form-controller.php", {
            method: "POST",
            body: new FormData(e.target.form),
        });
        console.log(response);
        return response;
    } catch (error) {
        return console.error(error);
    }
}
