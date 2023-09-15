import createEl from "./create-el";

type TElSkeletons = { [key: string]: { [key: string]: any } };
type TCreatedEls = { [key: string]: HTMLElement };

export default function createEls(elSkeletons: TElSkeletons) {
    const createdEls: TCreatedEls = {};

    for (const [name, skeleton] of Object.entries(elSkeletons)) {
        const createdEl = createEl(skeleton.el, skeleton.attrs);
        createdEls[name] = createdEl;
    }

    return createdEls;
}
