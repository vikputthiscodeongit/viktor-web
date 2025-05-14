import "./style.scss";

import htmlDevLabel from "@codebundlesbyvik/html-dev-label";
import initTypeItAboutMe from "./components/about-me/typeit";
import initContactForm from "./components/contact-form/contact-form-controller";

(function () {
    document.documentElement.classList.replace("js-disabled", "js-enabled");

    document.body.addEventListener("mousedown", () => document.body.classList.add("using-mouse"));
    document.body.addEventListener("keydown", () => document.body.classList.remove("using-mouse"));

    htmlDevLabel({ hideOnHover: true });

    try {
        const typeItContainerEl = document.querySelector(".viktor-about--typeit > span");

        if (typeItContainerEl) {
            initTypeItAboutMe(typeItContainerEl);
        }
    } catch (error) {
        console.error(error);
    }

    try {
        const contactFormEl = document.querySelector<HTMLFormElement>("#contact-form");

        if (contactFormEl) {
            initContactForm(contactFormEl);
            console.info("Contact form initialized.");
        }
    } catch (error) {
        console.error(error);
    }
})();
