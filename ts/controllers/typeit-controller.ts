// TODO:
// * Extract the content somehow.
// * Only run when in viewport.

import TypeIt from "typeit";

export default function initTypeItAboutMe(targetEl: HTMLElement) {
    const instance = new TypeIt(targetEl, {
        speed: 80,
        deleteSpeed: 40,
        startDelay: 400,
        loop: true,
        loopDelay: 2000,
    })
        //
        .type("Likes technlo", { delay: 350 })
        .move(-2, { delay: 300 })
        .type("o", { delay: 200 })
        .move(2, { delay: 300 })
        .type("gy", { delay: 2100 })
        .delete(10, { delay: 900 })
        //
        .type("cars", { delay: 1950 })
        .delete(4, { delay: 850 })
        //
        .type("photography", { delay: 2200 })
        .delete(11, { delay: 950 })
        //
        .type("goodfood", { delay: 400 })
        .move(-4, { delay: 300 })
        .type(" ", { delay: 250 })
        .move(4, { delay: 1950 })
        .delete(9, { delay: 850 })
        //
        .type("music", { delay: 2050 })
        .delete(5, { delay: 1000 })
        //
        .type("nature", { delay: 2000 })
        .delete(undefined)
        //
        .go();

    return instance;
}
