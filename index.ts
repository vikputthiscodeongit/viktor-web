import htmlDevLabel from "@codebundlesbyvik/html-dev-label";
import initTypeItAboutMe from "./components/sections/home/about-me/typeit";
import initForm from "./components/sections/contact/form/form-controller";
import "./style.scss";

document.documentElement.classList.replace("js-disabled", "js-enabled");
document.body.addEventListener("mousedown", () => document.body.classList.add("using-mouse"));
document.body.addEventListener("keydown", () => document.body.classList.remove("using-mouse"));

htmlDevLabel();

initTypeItAboutMe(document.querySelector(".viktor-about--typeit > span"));

try {
    await initForm(document.querySelector(".form--contact"));
} catch (error) {
    console.log(error);
}
