type TTagName = string;
type TAttrs = string | { [key: string]: any };

export default function createEl(tagName: TTagName, attrs?: TAttrs) {
    const el = document.createElement(tagName);

    if (attrs) {
        if (typeof attrs === "string") {
            el.className = attrs;
        } else {
            for (const [prop, val] of Object.entries(attrs)) {
                if (prop === "text") {
                    el.innerText = val;

                    continue;
                }

                const propKebab = prop.replace(/[A-Z0-9]/g, letter => `-${letter.toLowerCase()}`);
                el.setAttribute(propKebab, val);
            }
        }
    }

    return el;
}
