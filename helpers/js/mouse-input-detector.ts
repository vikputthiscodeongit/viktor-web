export default function initMouseInputDetector(targetEl: Element) {
    if (!targetEl) {
        console.error("initMouseInputDetector(): Aborting initialization - targetEl undefined or not found!");
        return;
    }

    targetEl.addEventListener("mousedown", () => targetEl.classList.add("using-mouse"));
    targetEl.addEventListener("keydown", () => targetEl.classList.remove("using-mouse"));
}
