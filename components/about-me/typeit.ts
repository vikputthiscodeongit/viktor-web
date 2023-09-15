import { El, Options, TypeItInstance } from "typeit/dist/types";
import TypeIt from "typeit";

export default function initTypeItAboutMe(targetEl: Element | null) {
    if (!targetEl) {
        console.error("initTypeItAboutMe(): Aborting initialization - targetEl undefined or not found!");

        return;
    }

    const options: Options = {
        speed: 75,
        deleteSpeed: 40,
        loop: true
    };

    const instance: TypeItInstance = new (TypeIt as any)(targetEl as El, options)
        //
        .type("Photographer", {delay: 1800})
        .delete(null, {delay: 1000})
        //
        .type("Web devlo", {delay: 500})
        .move(-2, {speed: 150, delay: 350})
        .type("e", {delay: 500})
        .move(2, {speed: 100, delay: 400})
        .type("per", {delay: 1850})
        .delete(null, {delay: 1000})
        //
        .type("Moti", {delay: 400})
        .delete(2, {speed: 120, delay: 350})
        .type("toring enthusiast", {delay: 2000})
        .delete(null, {delay: 900})
        //
        .type("Human", {delay: 1450})
        .delete(null, {delay: 900})
        //
        .go();

    return instance;
}
