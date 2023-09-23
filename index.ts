import htmlDevLabel from "@codebundlesbyvik/html-dev-label";
import initMouseInputDetector from "./helpers/js/mouse-input-detector";
import initTypeItAboutMe from "./components/sections/home/about-me/typeit";
import initForm from "./components/sections/contact/form/form-controller";
import "./style.scss";

document.documentElement.classList.replace("js-disabled", "has-js");

initMouseInputDetector(document.body);

htmlDevLabel();

initTypeItAboutMe(document.querySelector(".viktor-about--typeit > span"));

initForm(document.querySelector(".form--contact"));
