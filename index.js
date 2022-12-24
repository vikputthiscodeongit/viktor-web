import htmlDevLabel from "@codebundlesbyvik/html-dev-label";
import typeItAboutMe from "./components/about-me/typeit";
import initContactForm from "./components/form/form-controller";
import "./sass/style.scss";

replaceJsClass(document.documentElement);

initMouseInputDetector(document.body);

htmlDevLabel();

typeItAboutMe(document.querySelector(".viktor-about--typeit > span"));

// initContactForm(document.querySelector(".form--contact"));

function replaceJsClass(targetEl) {
    targetEl.classList.replace("no-js", "js");
}

function initMouseInputDetector(targetEl) {
    targetEl.addEventListener("mousedown", () => targetEl.classList.add("using-mouse"));
    targetEl.addEventListener("keydown", () => targetEl.classList.remove("using-mouse"));
}
