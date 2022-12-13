export default function initContactForm(formEl) {
    const inputElsWithUtf8EncPerlPattern = formEl.querySelectorAll(".ipce-utf8-perl");
    const submitInputEl = formEl.querySelector("[type=submit]");

    inputElsWithUtf8EncPerlPattern.forEach(inputEl => convertPerlUtf8RegExInputPatternToJsUtf8RegEx(inputEl));
    submitInputEl.addEventListener("click", (e) => sendForm(e));
}

function convertPerlUtf8RegExInputPatternToJsUtf8RegEx(inputEl) {
    const PerlUtf8RegEx = inputEl.getAttribute("pattern");

    if (PerlUtf8RegEx === null) return;

    const jsUtf8RegEx = convertPerlUtf8RegExToJsUtf8RegEx(PerlUtf8RegEx);

    inputEl.setAttribute("pattern", jsUtf8RegEx);
}


function convertPerlUtf8RegExToJsUtf8RegEx(PerlUtf8RegEx) {
    const perlUtf8CharSyntax = new RegExp("x({[\\w\\d]{4}})", "g");
    const jsUtf8RegEx = PerlUtf8RegEx.replace(perlUtf8CharSyntax, (match, p1) => `u${p1}`);

    return jsUtf8RegEx;
}

async function sendForm(e) {
    e.preventDefault();

    try {
        const response = await fetch("./components/form/form-controller.php", {
            method: "POST",
            body: new FormData(e.target.form),
        });
        const data = await response.json();

        return [response.status, data];
    } catch (error) {
        return console.error(error);
    }
}
