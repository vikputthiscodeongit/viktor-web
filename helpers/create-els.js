import createEl from "/helpers/create-el";

export default function createEls(elSkeletons) {
    let els = {};

    for (const [name, skeleton] of Object.entries(elSkeletons)) {
        const el = createEl(skeleton.el, skeleton.attrs);
        els[name] = el;
    }

    console.log(els);
    return els;
}
