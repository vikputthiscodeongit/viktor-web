// TODO: Only run when in viewport.

import { El } from "typeit/dist/types";
import TypeIt from "typeit";

export default function initTypeItAboutMe(targetEl: Element) {
    const instance = new TypeIt(targetEl as El, {
        speed: 75,
        deleteSpeed: 40,
        loop: true,
    })
        //
        .type("Photographer", { delay: 1800 })
        .delete(undefined, { delay: 1000 })
        //
        .type("Web devlo", { delay: 500 })
        .move(-2, { speed: 150, delay: 350 })
        .type("e", { delay: 500 })
        .move(2, { speed: 100, delay: 400 })
        .type("per", { delay: 1850 })
        .delete(undefined, { delay: 1000 })
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
