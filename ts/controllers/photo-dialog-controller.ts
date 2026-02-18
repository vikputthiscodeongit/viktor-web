export default function initPhotoDialog(dialog: HTMLDialogElement, triggers: NodeListOf<Element>) {
    // TODO: Cancel enter = dialog close?
    const closeButtonEl = document.querySelector("#photo-dialog-close-button");
    closeButtonEl?.addEventListener("click", () => {
        dialog.close();
    });

    triggers.forEach((trigger) => {
        trigger.setAttribute("href", "#");
        trigger.removeAttribute("target");
        trigger.removeAttribute("rel");

        trigger.setAttribute("role", "button");
        trigger.addEventListener("click", (e) => {
            e.preventDefault();
            dialog.showModal();
        });
    });
}

function showDialog() {}
