// TODO: Improve `removeExtraDataAttrs` solution. See contact-form-controller.ts.

import { createEl, fetchWithTimeout, wait } from "@codebundlesbyvik/js-helpers";
import { ntpSync } from "../ntp/ntp";

interface DefaultOptions {
    baseId: string;
    removeExtraDataAttrs: "activation" | "input" | true;
}

interface Options extends Partial<DefaultOptions> {
    activatorButtonEl: HTMLButtonElement;
}

const DEFAULT_INSTANCE_OPTIONS: DefaultOptions = {
    baseId: "simple-maths-captcha",
    removeExtraDataAttrs: true,
};

export default class SimpleMathsCaptcha {
    removeAnswerInputElExtraDataAttrs: "activation" | "input" | true;
    activatorButtonEl: HTMLButtonElement;
    formEl: HTMLFormElement;
    fieldEl: HTMLElement;
    answerInputEl: HTMLInputElement;
    labelEl: HTMLLabelElement;
    digit1InputEl: HTMLInputElement;
    digit2InputEl: HTMLInputElement;
    expiryTimerEl: HTMLSpanElement;
    loaderEl: HTMLDivElement;

    active: boolean;

    constructor(options: Options) {
        try {
            const mergedOptions = {
                ...DEFAULT_INSTANCE_OPTIONS,
                ...options,
            };

            this.activatorButtonEl = mergedOptions.activatorButtonEl;

            const fieldEl = this.activatorButtonEl.parentElement;
            const formEl = this.activatorButtonEl.closest("form");

            if (!fieldEl || !formEl) {
                const errorText = !fieldEl
                    ? "Input must have a parent element."
                    : "Input must be a <form> child.";
                throw new Error(errorText);
            }

            this.activatorButtonEl.setCustomValidity("false");

            this.removeAnswerInputElExtraDataAttrs = mergedOptions.removeExtraDataAttrs;

            this.formEl = formEl;
            this.fieldEl = fieldEl;
            this.answerInputEl = createEl("input", {
                type: "text",
                id: mergedOptions.baseId + "-answer",
                name: mergedOptions.baseId + "-answer",
                inputmode: "numeric",
                minlength: "1",
                required: "true",
            });
            this.labelEl = createEl("label", {
                for: this.answerInputEl.id,
            });
            this.digit1InputEl = createEl("input", {
                type: "hidden",
                id: mergedOptions.baseId + "-digit-1",
                name: mergedOptions.baseId + "-digit-1",
            });
            this.digit2InputEl = createEl("input", {
                type: "hidden",
                id: mergedOptions.baseId + "-digit-2",
                name: mergedOptions.baseId + "-digit-2",
            });
            this.expiryTimerEl = createEl("span");
            this.loaderEl = createEl("div", {
                class: "spinner spinner--lg",
            });

            this.active = false;

            this.activatorButtonEl.addEventListener("click", () => {
                const fn = async () => await this.activate();
                fn().catch((error) => {
                    console.error(error);
                    this.deactivate();
                });

                return;
            });

            if (
                this.removeAnswerInputElExtraDataAttrs === "input" ||
                this.removeAnswerInputElExtraDataAttrs === true
            ) {
                this.answerInputEl.addEventListener("input", () => {
                    Array.from(this.answerInputEl.attributes).forEach((attr) => {
                        if (attr.name.startsWith("data")) {
                            this.answerInputEl.removeAttribute(attr.name);
                        }
                    });

                    return;
                });
            }

            return;
        } catch (error) {
            throw error instanceof Error
                ? error
                : new Error("Unknown error during initialization!");
        }
    }

    isCaptchaInputEl(id: string) {
        return (
            id === this.answerInputEl.id ||
            id === this.digit1InputEl.id ||
            id === this.digit2InputEl.id
        );
    }

    setIsValidState(valid: boolean) {
        this.answerInputEl.setCustomValidity(!valid ? "false" : "");
    }

    async activate() {
        console.info("activate: Running...");

        if (this.active) {
            console.info("activate: CAPTCHA already active!");
            return;
        }

        this.active = true;

        try {
            this.activatorButtonEl.remove();

            this.labelEl.textContent = "Loading CAPTCHA";
            this.fieldEl.prepend(this.labelEl, this.loaderEl);

            this.answerInputEl.value = "";

            const [digit1, digit2, expiryTime] = await this.#makeProblemData();

            this.labelEl.textContent = `${digit1} + ${digit2} =`;

            if (
                this.removeAnswerInputElExtraDataAttrs === "activation" ||
                this.removeAnswerInputElExtraDataAttrs === true
            ) {
                Array.from(this.answerInputEl.attributes).forEach((attr) => {
                    if (attr.name.startsWith("data")) {
                        this.answerInputEl.removeAttribute(attr.name);
                    }
                });
            }

            this.digit1InputEl.value = digit1.toString();
            this.digit2InputEl.value = digit2.toString();
            this.labelEl.after(this.answerInputEl, this.digit1InputEl, this.digit2InputEl);

            this.loaderEl.remove();

            let expiryTimeSec = Math.floor(expiryTime / 1000);

            const expiryTimer = setInterval(() => {
                expiryTimeSec = expiryTimeSec - 1;

                if (expiryTimeSec < 6) {
                    // TODO: Fix timer. "0 s" is shown when for example expiryTime is 5999 ms
                    // but not when it's 6001 ms.
                    this.expiryTimerEl.textContent = `Expires in ${expiryTimeSec} s`;

                    if (!document.body.contains(this.expiryTimerEl)) {
                        this.answerInputEl.after(this.expiryTimerEl);
                    }
                }
            }, 1000);

            await wait(expiryTime);
            clearInterval(expiryTimer);

            this.deactivate();

            return;
        } catch (error) {
            throw error instanceof Error
                ? error
                : new Error("Unknown error during CAPTCHA activation!");
        }
    }

    deactivate() {
        console.info("deactivate: Running...");

        if (!this.active) {
            console.info("activate: CAPTCHA already deactivated!");
            return;
        }

        this.labelEl.remove();
        this.answerInputEl.remove();
        this.digit1InputEl.remove();
        this.digit2InputEl.remove();
        this.expiryTimerEl.remove();
        this.loaderEl.remove();

        this.fieldEl.prepend(this.activatorButtonEl);

        this.active = false;

        return;
    }

    async #makeProblemData() {
        console.info("#makeProblemData: Running...");

        try {
            const ntpValues = await ntpSync();

            if (!ntpValues) {
                throw new Error("NTP values fetch failed.");
            }

            const response = await fetchWithTimeout(
                "./api/simple-maths-captcha/generate-problem.php",
            );

            if (!response.ok) {
                throw new Error(`Problem fetch failed with HTTP status code ${response.status}.`);
            }

            const fetchedData = (await response.json()) as {
                problem_data: [number, number, number];
            };
            console.debug("#makeProblemData - fetchedData:", fetchedData);
            const [digit1, digit2, invalidAfterTime] = fetchedData.problem_data;

            const expiryTime = Math.ceil(Math.max(invalidAfterTime - ntpValues.correctedDate, 0));
            const problemData = [digit1, digit2, expiryTime];
            console.debug("#makeProblemData - problemData:", problemData);

            return problemData;
        } catch (error) {
            throw error instanceof Error ? error : new Error("Unknown error during problem fetch!");
        }
    }
}
