import htmlDevLabel from "@codebundlesbyvik/html-dev-label";
import initTypeItAboutMe from "./ts/controllers/typeit-controller";
import MediaDialog from "./ts/controllers/media-dialog-controller";
import initContactForm from "./ts/controllers/contact-form/index";
import "./style.scss";

(function () {
    document.documentElement.classList.replace("js-loading", "js-enabled");

    htmlDevLabel({ hideOnHover: true });

    try {
        const typeItContainerEl = document.querySelector<HTMLSpanElement>(
            "#viktor-properties-typeit",
        );

        if (typeItContainerEl) {
            initTypeItAboutMe(typeItContainerEl);
        }
    } catch (error) {
        console.error(error);
    }

    try {
        const dialog = document.querySelector<HTMLDialogElement>(".media-dialog");
        const dialogTrigger = document.querySelectorAll("[data-post-shortcode]");

        if (dialog && dialogTrigger) {
            new MediaDialog(dialog, dialogTrigger);
        }
    } catch (error) {
        console.error(error);
    }

    try {
        const contactFormEl = document.querySelector<HTMLFormElement>("#contact-form");

        if (contactFormEl) {
            initContactForm(contactFormEl);
        }
    } catch (error) {
        console.error(error);
    }
})();
