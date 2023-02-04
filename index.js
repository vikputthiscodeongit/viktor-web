import htmlDevLabel from "@codebundlesbyvik/html-dev-label";
import typeItAboutMe from "./components/about-me/typeit";
import initForm from "./components/form/form-controller";
import "./sass/style.scss";

document.documentElement.classList.replace("js-disabled", "js-enabled");

initMouseInputDetector(document.body);

htmlDevLabel();

typeItAboutMe(document.querySelector(".viktor-about--typeit > span"));

initForm(document.querySelector(".form--contact"));

function initMouseInputDetector(bodyEl) {
    bodyEl.addEventListener("mousedown", () => bodyEl.classList.add("using-mouse"));
    bodyEl.addEventListener("keydown", () => bodyEl.classList.remove("using-mouse"));
}
