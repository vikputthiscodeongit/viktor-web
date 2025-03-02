// import { createEl, fetchWithTimeout, wait } from "@codebundlesbyvik/js-helpers";
import { createEl, fetchWithTimeout } from "@codebundlesbyvik/js-helpers";
import { NtpSyncData, smartNtpSync } from "../time-sync/time-sync";

/*
 * Wanneer dit een library wordt moet de NTP sync functie user definable zijn.
 *
 * De huidige implementatie met mijn NTP sync library zou kunnen zijn:
 * const ntpSync = new NtpSync()
 * const formMc = new FormMc({ inputEl, ntpSyncFn: ntpSync.smartSync()}
 *   > ntpPlugin moet een object return met daarin ten minste een veld 'correctedDate'.
 *   > ntpPlugin returned data wordt binnen de FormMc instance opgeslagen.
 */

// Requirements:
// * An <input> to be used for inserting the solution to the problem

interface DefaultOptions {
    creationAttemptsDelays: number[];
}
interface Options extends Partial<DefaultOptions> {
    inputEl: HTMLInputElement;
}

const DEFAULT_INSTANCE_OPTIONS: DefaultOptions = {
    creationAttemptsDelays: [3000, 6000],
};

export default class FormMc {
    formEl: HTMLFormElement;
    fieldEl: HTMLElement;
    inputEl: HTMLInputElement;
    inputDigit1El: HTMLInputElement;
    inputDigit2El: HTMLInputElement;
    labelEl: HTMLLabelElement;
    loaderEl: HTMLDivElement;
    reinitializeButtonEl: HTMLButtonElement;

    events: {
        initialized: CustomEvent;
        deactivated: CustomEvent;
        problemCreated: CustomEvent;
    };

    creationAttemptsDelays: number[];

    // canLoop: boolean;
    totalProblemCreationAttempts: number;
    attemptsSinceSuccessfulCreation: number;
    timerId: ReturnType<typeof setTimeout> | null;

    ntp: NtpSyncData;

    constructor(options: Options) {
        try {
            const mergedOptions = {
                ...DEFAULT_INSTANCE_OPTIONS,
                ...options,
            };

            this.inputEl = mergedOptions.inputEl;

            const fieldEl = this.inputEl.parentElement;
            const formEl = this.inputEl.closest("form");

            if (!fieldEl || !formEl) {
                throw new Error(
                    "Initialization error - missing one or more required DOM elements.",
                );
            }

            this.formEl = formEl;
            this.fieldEl = fieldEl;
            this.labelEl = createEl("label", {
                for: this.inputEl.id,
            }) as HTMLLabelElement;
            this.inputDigit1El = createEl("input", {
                type: "hidden",
                name: "cf-form-mc-d1",
            }) as HTMLInputElement;
            this.inputDigit2El = createEl("input", {
                type: "hidden",
                name: "cf-form-mc-d2",
            }) as HTMLInputElement;
            this.loaderEl = createEl("div", {
                class: "spinner",
                style: "font-size: 1.5rem;",
            }) as HTMLDivElement;
            this.reinitializeButtonEl = createEl("button", {
                type: "button",
                text: "Activate",
            }) as HTMLButtonElement;

            this.events = {
                initialized: new CustomEvent("formMcInitialized"),
                deactivated: new CustomEvent("formMcDeactivated"),
                problemCreated: new CustomEvent("formMcProblemCreated"),
            };

            this.creationAttemptsDelays = mergedOptions.creationAttemptsDelays;

            // this.canLoop = false;
            this.totalProblemCreationAttempts = 0;
            this.attemptsSinceSuccessfulCreation = 0;
            this.timerId = null;

            this.ntp = {
                roundTripDelay: 0,
                clientOffset: 0,
                correctedDate: 0,
            };

            this.reinitializeButtonEl.addEventListener("click", () => {
                const fn = async () => {
                    this.reinitializeButtonEl.remove();
                    await this.activate();
                };
                fn().catch((reason) => console.error(reason));
            });
        } catch (error) {
            throw error instanceof Error
                ? error
                : new Error("Unknown error during initialization!");
        }
    }

    async activate() {
        // console.log("activate(): Running...");

        try {
            this.fieldEl.append(this.inputEl);
            this.fieldEl.append(this.inputDigit1El);
            this.fieldEl.append(this.inputDigit2El);
            // this.canLoop = true;
            await this.createProblem();
        } catch (error) {
            throw error instanceof Error
                ? error
                : new Error("Unknown error during CAPTCHA activation!");
        }
    }

    deactivate(recoverable?: boolean) {
        console.log("deactivate(): Running...");

        // Return if already deactivated.
        // if (!this.canLoop) return;
        if (this.timerId) clearTimeout(this.timerId);

        console.log(`deactivate() - recoverable: ${recoverable}`);

        // this.canLoop = false;

        this.inputEl.remove();
        this.inputDigit1El.remove();
        this.inputDigit2El.remove();

        // Should only occur if #makeProblemData() failed directly after initialization or if labelEl
        // has been manually removed from the DOM.
        if (!this.fieldEl.contains(this.labelEl)) {
            this.fieldEl.prepend(this.labelEl);
        }

        if (recoverable) {
            this.labelEl.textContent = "CAPTCHA deactivated.";
            this.labelEl.after(this.reinitializeButtonEl);
        } else {
            this.labelEl.textContent = "CAPTCHA error. Please reload the page.";
        }

        this.formEl.dispatchEvent(this.events.deactivated);
    }

    clearTimer() {
        console.log("clearTimer(): Running...");

        if (this.timerId) {
            clearTimeout(this.timerId);
            console.log("clearTimer(): Timeout cleared.");
        }
    }

    async #makeProblemData() {
        // console.log("#makeProblemData(): Running...");

        try {
            // TODO: Validate that fetchWithTimeout abort is properly handled.
            const response = await fetchWithTimeout("./components/form-mc/form-mc-generator.php");

            if (!response.ok) {
                throw new Error(
                    `Problem fetch failed: ${response.status} - ${response.statusText}`,
                );
            }

            const fetchedData = (await response.json()) as [number, number, number];
            // console.log(`#makeProblemData() - fetchedData: ${fetchedData}`);
            const [digit1, digit2, invalidAfterTime] = fetchedData;

            const timeToRefresh = Math.ceil(Math.max(invalidAfterTime - this.ntp.correctedDate, 0));
            const problemData = [digit1, digit2, timeToRefresh];
            // console.log(`#makeProblemData() - problemData: ${problemData}`);

            return problemData;
        } catch (error) {
            throw error instanceof Error ? error : new Error("Unknown error during problem fetch!");
        }
    }

    #insertProblem(digit1: number, digit2: number) {
        // console.log("#insertProblem(): Running...");

        try {
            if (!this.formEl || !this.fieldEl || !this.fieldEl.contains(this.inputEl)) {
                throw new Error("Required element not in DOM.");
            }

            if (!this.fieldEl.contains(this.labelEl)) {
                this.inputEl.before(this.labelEl);
            }

            this.inputDigit1El.value = digit1.toString();
            this.inputDigit2El.value = digit2.toString();

            const labelString = `${digit1} + ${digit2} =`;
            this.labelEl.textContent = labelString;
        } catch (error) {
            this.deactivate(false);

            throw error instanceof Error
                ? error
                : new Error("Unknown error during insertion of CAPTCHA elements into DOM!");
        }
    }

    async createProblem() {
        try {
            this.fieldEl.append(this.loaderEl);

            this.attemptsSinceSuccessfulCreation++;
            this.totalProblemCreationAttempts++;
            console.log(
                `createProblem() - attemptsSinceSuccessfulCreation: ${this.attemptsSinceSuccessfulCreation}`,
            );
            // console.log(
            //     `createProblem() - totalProblemCreationAttempts: ${this.totalProblemCreationAttempts}`,
            // );

            const inputInFocusBeforeRefresh = this.inputEl === document.activeElement;

            this.inputEl.disabled = true;

            this.ntp = await smartNtpSync({ prevNtpSyncData: this.ntp });
            const [digit1, digit2, timeToRefresh] = await this.#makeProblemData();
            this.#insertProblem(digit1, digit2);

            this.inputEl.disabled = false;

            if (inputInFocusBeforeRefresh) {
                this.inputEl.focus();
            }

            this.loaderEl.remove();

            this.attemptsSinceSuccessfulCreation = 0;

            this.formEl.dispatchEvent(this.events.problemCreated);

            this.timerId = setTimeout(() => {
                const fn = async () => await this.createProblem();
                fn().catch((error) => console.error(error));
            }, timeToRefresh);

            if (this.totalProblemCreationAttempts === 1) {
                this.formEl.dispatchEvent(this.events.initialized);
            }
        } catch (error) {
            console.error(error);

            if (this.attemptsSinceSuccessfulCreation > this.creationAttemptsDelays.length) {
                // TODO: Debug because this does not work. Also, maybe check for TypeError too
                // since that seems to be the error thrown when going offline.
                const recoverable =
                    error instanceof Error &&
                    error.cause instanceof Error &&
                    (error.cause.name === "AbortError" || error.cause.name === "NetworkError");
                this.deactivate(recoverable);

                this.loaderEl.remove();

                throw new Error(
                    `CAPTCHA deactivated because problem generation failed ${this.attemptsSinceSuccessfulCreation} concurrent times!`,
                );
            }

            const delay =
                this.creationAttemptsDelays[Math.max(this.attemptsSinceSuccessfulCreation - 1, 0)];
            this.timerId = setTimeout(() => {
                const fn = async () => await this.createProblem();
                fn().catch((error) => console.error(error));
            }, delay);
        }
    }

    // async #problemLoopHandlerOld() {
    //     while (this.canLoop) {
    //         try {
    //             this.fieldEl.append(this.loaderEl);

    //             this.attemptsSinceSuccessfulCreation++;
    //             this.totalProblemCreationAttempts++;
    //             // console.log(
    //             //     `createProblem() - attemptsSinceSuccessfulCreation: ${this.attemptsSinceSuccessfulCreation}`,
    //             // );
    //             // console.log(
    //             //     `createProblem() - totalProblemCreationAttempts: ${this.totalProblemCreationAttempts}`,
    //             // );

    //             const inputInFocusBeforeRefresh = this.inputEl === document.activeElement;

    //             this.inputEl.disabled = true;

    //             this.ntp = await smartNtpSync({ prevNtpSyncData: this.ntp });
    //             const [digit1, digit2, timeToRefresh] = await this.#makeProblemData();
    //             this.#insertProblem(digit1, digit2);

    //             this.inputEl.disabled = false;

    //             if (inputInFocusBeforeRefresh) {
    //                 this.inputEl.focus();
    //             }

    //             this.loaderEl.remove();

    //             this.attemptsSinceSuccessfulCreation = 0;

    //             this.formEl.dispatchEvent(this.events.problemCreated);

    //             if (this.totalProblemCreationAttempts === 1) {
    //                 this.formEl.dispatchEvent(this.events.initialized);
    //             }

    //             await wait(timeToRefresh);
    //         } catch (error) {
    //             console.error(error);

    //             if (this.attemptsSinceSuccessfulCreation > this.creationAttemptsDelays.length) {
    //                 // TODO: Debug because this does not work. Also, maybe check for TypeError too
    //                 // since that seems to be the error thrown when going offline.
    //                 const recoverable =
    //                     error instanceof Error &&
    //                     error.cause instanceof Error &&
    //                     (error.cause.name === "AbortError" || error.cause.name === "NetworkError");
    //                 this.deactivate(recoverable);

    //                 this.loaderEl.remove();

    //                 throw new Error(
    //                     `CAPTCHA deactivated because problem generation failed ${this.attemptsSinceSuccessfulCreation} concurrent times!`,
    //                 );
    //             }

    //             await wait(
    //                 this.creationAttemptsDelays[
    //                     Math.max(this.attemptsSinceSuccessfulCreation - 1, 0)
    //                 ],
    //             );
    //         }
    //     }
    // }
}
