export default function createEl(tagName, attrs) {
    const el = document.createElement(tagName);

    if (attrs) {
        if (typeof attrs === "string") {
            el.className = attrs;
        } else {
            for (let [prop, val] of Object.entries(attrs)) {
                if (prop === "text") {
                    el.innerText = val;

                    continue;
                }

                prop = prop.replace(/[A-Z0-9]/g, letter => `-${letter.toLowerCase()}`);
                el.setAttribute(prop, val);
            }
        }
    }

    return el;
}
