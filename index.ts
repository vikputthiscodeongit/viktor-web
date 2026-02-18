import htmlDevLabel from "@codebundlesbyvik/html-dev-label";
import initTypeItAboutMe from "./ts/controllers/typeit-controller";
import initPhotoDialog from "./ts/controllers/photo-dialog-controller";
import initContactForm from "./ts/controllers/contact-form/index";
import "./style.scss";

(function () {
    document.documentElement.classList.replace("js-loading", "js-enabled");

    document.body.addEventListener("mousedown", () => document.body.classList.add("using-mouse"));
    document.body.addEventListener("keydown", () => document.body.classList.remove("using-mouse"));

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
        const dialog = document.querySelector<HTMLDialogElement>("#photo-dialog");
        const dialogTrigger = document.querySelectorAll("[data-photo-dialog-trigger=true]");

        if (dialog && dialogTrigger) {
            initPhotoDialog(dialog, dialogTrigger);
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
