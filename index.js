import htmlDevLabel from "@codebundlesbyvik/html-dev-label";
import typeItAboutMe from "./components/about-me/typeit";
import { sendForm, getJsUtf8RegExFromPerlUtf8RegEx } from "./components/form/form-controller";
import "./sass/style.scss";

replaceBodyJsClass(document.documentElement);

initMouseInputDetector(document.body);

htmlDevLabel();

typeItAboutMe(document.querySelector(".viktor-about--typeit > span"));

document.querySelector("#cf-submit").addEventListener("click", (e) => sendForm(e));
getJsUtf8RegExFromPerlUtf8RegEx(document.querySelector("#cf-email").getAttribute("pattern"));

function replaceBodyJsClass(targetEl) {
    targetEl.classList.replace("no-js", "js");
}

function initMouseInputDetector(targetEl) {
    console.log("In initMouseInputDetector().");

    targetEl.addEventListener("mousedown", function() {
        targetEl.classList.add("using-mouse");
    });

    targetEl.addEventListener("keydown", function() {
        targetEl.classList.remove("using-mouse");
    });
}
