import htmlDevLabel from "@codebundlesbyvik/html-dev-label";
import initTypeItAboutMe from "./ts/controllers/typeit-controller";
import initContactForm from "./ts/controllers/contact-form-controller";
import "./style.scss";

(function () {
    document.documentElement.classList.replace("js-disabled", "js-enabled");

    document.body.addEventListener("mousedown", () => document.body.classList.add("using-mouse"));
    document.body.addEventListener("keydown", () => document.body.classList.remove("using-mouse"));

    htmlDevLabel({ hideOnHover: true });

    try {
        const typeItContainerEl = document.querySelector<HTMLSpanElement>(
            ".viktor-properties-typeit > span",
        );

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
