async function sendForm(e) {
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

function getJsUtf8RegExFromPerlUtf8RegEx(regex) {
    console.log(regex);

    const perlUtf8CharacterSyntax = new RegExp("x{(\\w|\\d){4}}", "g");
    const matchAll = regex.matchAll(perlUtf8CharacterSyntax);
    console.log(...matchAll);
}

export { sendForm, getJsUtf8RegExFromPerlUtf8RegEx };
