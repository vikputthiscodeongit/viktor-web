import htmlDevLabel from "@codebundlesbyvik/html-dev-label";
import typeItAboutMe from "./components/about-me/typeit";
import initContactForm from "./components/form/form-controller";
import "./sass/style.scss";

unlockJavaScript(document.documentElement);

initMouseInputDetector(document.body);

htmlDevLabel();

typeItAboutMe(document.querySelector(".viktor-about--typeit > span"));

// initContactForm(document.querySelector(".form--contact"));

async function unlockJavaScript(rootEl) {
    rootEl.classList.remove("js-disabled");
    rootEl.classList.add("js-client");

    try {
        const response = await fetch("/admin/global-controller.php", {
            method: "POST",
        });

        if (response.status < 200 || response.status > 299) {
            throw new Error("Invalid server response.");
        }

        rootEl.classList.add("js-server");
    } catch (error) {
        rootEl.classList.add("js-server-error")

        return console.error(error);
    }
}

function initMouseInputDetector(targetEl) {
    targetEl.addEventListener("mousedown", () => targetEl.classList.add("using-mouse"));
    targetEl.addEventListener("keydown", () => targetEl.classList.remove("using-mouse"));
}
