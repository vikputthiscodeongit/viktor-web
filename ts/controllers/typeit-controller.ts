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
        .type("Likes technlo", { delay: 500 })
        .move(-2, { delay: 350 })
        .type("o", { delay: 300 })
        .move(2, { delay: 400 })
        .type("gy ...", { delay: 1500 })
        .move(-3, { delay: 333 })
        .delete(undefined, { delay: 900 })
        .move(3, { delay: 450 })
        //
        .type(" and cars", { delay: 1650 })
        .delete(4, { delay: 900 })
        //
        .type("photography", { delay: 1800 })
        .delete(15, { delay: 900 })
        //
        .type("but also goodfood", { delay: 300 })
        .move(-4, { delay: 350 })
        .type(" ", { delay: 250 })
        .move(4, { delay: 1450 })
        .delete(9, { delay: 900 })
        //
        .type("music", { delay: 1600 })
        .delete(14, { delay: 900 })
        //
        .type("and nature", { delay: 1400 })
        .delete(undefined, { delay: 900 })
        //
        .go();

    return instance;
}
