import htmlDevLabel from "@codebundlesbyvik/html-dev-label";
import initMouseInputDetector from "./helpers/js/mouse-input-detector";
import initTypeItAboutMe from "./components/home/about-me/typeit";
import initForm from "./components/contact/form/form-controller";
import "./sass/style.scss";

document.documentElement.classList.replace("js-disabled", "has-js");

initMouseInputDetector(document.body);

htmlDevLabel();

initTypeItAboutMe(document.querySelector(".viktor-about--typeit > span"));

initForm(document.querySelector(".form--contact"));
