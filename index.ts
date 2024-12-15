import "./style.scss";

import htmlDevLabel from "@codebundlesbyvik/html-dev-label";
import SimpleNotifier from "@codebundlesbyvik/simple-notifier";
import initTypeItAboutMe from "./components/sections/home/about-me/typeit";
import initForm from "./components/sections/contact/form/form-controller";

void (async function () {
    document.documentElement.classList.replace("js-disabled", "js-enabled");

    document.body.addEventListener("mousedown", () => document.body.classList.add("using-mouse"));
    document.body.addEventListener("keydown", () => document.body.classList.remove("using-mouse"));

    htmlDevLabel();

    const typeItContainerEl = document.querySelector(".viktor-about--typeit > span");

    if (typeItContainerEl) {
        initTypeItAboutMe(typeItContainerEl);
    }

    const notifier = new SimpleNotifier();

    try {
        const formEl = document.querySelector<HTMLFormElement>(".form--contact");

        if (!formEl) {
            throw new Error("formEl not found!");
        }

        await initForm(formEl, notifier);

        console.log("Contact form initialized.");
    } catch (error) {
        console.error(error);
    }
})();
