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
        .type("Software devlo", { delay: 500 })
        .move(-2, { delay: 350 })
        .type("e", { delay: 500 })
        .move(2, { delay: 400 })
        .type("per", { delay: 1850 })
        .delete(undefined, { delay: 900 })
        //
        .type("Photographer", { delay: 1800 })
        .delete(undefined, { delay: 900 })
        //
        .type("Moti", { delay: 400 })
        .delete(2, { speed: 120, delay: 350 })
        .type("toring enthusiast", { delay: 2000 })
        .delete(undefined, { delay: 900 })
        //
        .type("Human", { delay: 1450 })
        .delete(undefined, { delay: 900 })
        //
        .go();

    return instance;
}
