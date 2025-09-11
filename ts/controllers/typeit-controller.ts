// TODO:
// * Extract the content somehow.
// * Only run when in viewport.

import TypeIt from "typeit";

export default function initTypeItAboutMe(targetEl: HTMLElement) {
    const instance = new TypeIt(targetEl, {
        speed: 80,
        deleteSpeed: 40,
        loop: true,
    })
        //
        .type("Technlo", { delay: 500 })
        .move(-2, { delay: 350 })
        .type("o", { delay: 300 })
        .move(2, { delay: 400 })
        .type("gy", { delay: 1500 })
        .delete(undefined, { delay: 900 })
        //
        .type("Cars", { delay: 1650 })
        .delete(undefined, { delay: 900 })
        //
        .type("Photography", { delay: 1800 })
        .delete(undefined, { delay: 900 })
        //
        .type("Goodfood", { delay: 300 })
        .move(-4, { delay: 350 })
        .type(" ", { delay: 250 })
        .move(4, { delay: 1450 })
        .delete(undefined, { delay: 900 })
        //
        .type("Music", { delay: 1600 })
        .delete(undefined, { delay: 900 })
        //
        .type("Nature", { delay: 1400 })
        .delete(undefined, { delay: 900 })
        //
        .go();

    return instance;
}
