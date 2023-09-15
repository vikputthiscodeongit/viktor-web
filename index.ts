import htmlDevLabel from "@codebundlesbyvik/html-dev-label";
import initMouseInputDetector from "./helpers/js/mouse-input-detector";
import initTypeItAboutMe from "./components/about-me/typeit";
import initForm from "./components/form/form-controller";
import "./sass/style.scss";

document.documentElement.classList.replace("js-disabled", "has-js");

initMouseInputDetector(document.body);

htmlDevLabel();

initTypeItAboutMe(document.querySelector(".viktor-about--typeit > span"));

initForm(document.querySelector(".form--contact"));
