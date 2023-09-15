import mergeOptions from "merge-options";
import createEl from "../../helpers/js/create-el";
import fetchWithTimeout from "../../helpers/js/fetch-with-timeout";
import getDateSyncValues from "../time-sync/time-sync";
import timeout from "../../helpers/js/set-timeout-promise";

/*
FORM-MC REGELS

Gebruik:
* form-mc wordt altijd gebruikt met form-controller (dus: geen support voor third party form controllers).
* <input name="cf-mc"> wordt automatisch geselecteerd.
  > Overige elementen worden gegenereerd.

NTP:
* 5x on load.
  > Sla resultaat op.
* 1x on problem refresh.
  > Indien afwijking < 250ms, gebruik en behoud oude waarde.
  > Indien afwijking > 250ms, volg 'load' routine.
*/

interface IFormMcDefaultOptions {
    makeProblemRetryTimesMs: number[];
}
interface IFormMcUserOptions extends Partial<IFormMcDefaultOptions>{
    formEl: HTMLFormElement;
}

const DEFAULT_OPTIONS: IFormMcDefaultOptions = {
    makeProblemRetryTimesMs: [3000, 5000, 8000],
};

export default class FormMc {
    makeProblemRetryTimesMs: number[];

    formEl: HTMLFormElement;
    inputElWrapper: HTMLElement | null;
    inputEl: HTMLInputElement | null;
    labelEl: HTMLLabelElement;
    loaderEl: HTMLDivElement;
    initButtonEl: HTMLButtonElement;

    canLoop: boolean;
    loopTryCountTotal: number;
    loopConcurrentTryCount: number;

    prevClientOffsetMs: number | null;

    inputInFocusBeforeRefresh: boolean;

    constructor(userOptions: Required<IFormMcUserOptions>) {
        const mergedOptions: Required<IFormMcUserOptions> =
            mergeOptions.apply({ ignoreUndefined: true }, [DEFAULT_OPTIONS, userOptions]);

        this.makeProblemRetryTimesMs = mergedOptions.makeProblemRetryTimesMs;

        this.formEl = mergedOptions.formEl;
        this.inputElWrapper = null
        this.inputEl = null;
        this.labelEl = createEl("label") as HTMLLabelElement;
        this.loaderEl = createEl("div", { class: "spinner", style: "font-size: 1.5rem;" }) as HTMLDivElement;
        this.initButtonEl = createEl("button", { type: "button", text: "Activate" }) as HTMLButtonElement;

        this.canLoop = false;
        this.loopTryCountTotal = 0;
        this.loopConcurrentTryCount = 0;

        this.prevClientOffsetMs = null;

        this.inputInFocusBeforeRefresh = false;

        this.initButtonEl.addEventListener("click", this.handleInitButtonPress.bind(this));
    }

    static STATE_MESSAGES_USER = {
        deactivated: "CAPTCHA deactivated.",
        error: "CAPTCHA error. Please reload the page."
    }

    showLoader = () => (
        this.inputEl && document.body.contains(this.inputEl)
            ? this.inputEl.after(this.loaderEl)
            : this.inputElWrapper
                ? this.inputElWrapper.appendChild(this.loaderEl)
                : undefined
    );

    hideLoader = () => this.loaderEl.remove();

    async handleInitButtonPress() {
        this.initButtonEl.remove();

        await this.init();
    }

    async init() {
        console.log("FormMc init(): Running...");

        try {
            this.assignInputEl();

            this.canLoop = true;
            await this.problemLoopHandler();
        } catch (error) {
            throw error instanceof Error ? error : new Error("FormMc init(): Failed to initialize!");
        }
    }

    deactivate(reactivatable: boolean) {
        console.log("FormMc deactivate(): Running...");

        // Return if already deactivated.
        if (!this.canLoop) return;

        console.log(`FormMc deactivate(): CAPTCHA ${reactivatable ? "may be" : "may NOT be"} reactivated.`);

        this.canLoop = false;

        if (this.inputEl) {
            this.inputEl.remove();
        }

        if (!document.body.contains(this.labelEl) && this.inputElWrapper) {
            this.inputElWrapper.insertBefore(this.labelEl, this.inputElWrapper.firstChild);
        }

        if (!document.body.contains(this.labelEl)) return;

        if (reactivatable) {
            this.labelEl.textContent = FormMc.STATE_MESSAGES_USER.deactivated;
            this.labelEl.after(this.initButtonEl);
        } else {
            this.labelEl.textContent = FormMc.STATE_MESSAGES_USER.error;
        }
    }

    assignInputEl() {
        try {
            if (!this.inputEl) {
                this.inputEl = this.formEl.querySelector("[name=cf-mc]");

                if (!this.inputEl) {
                    throw new Error("FormMc init(): <input> not found!");
                }

                this.inputElWrapper = this.inputEl.parentElement;
            }
        } catch (error) {
            this.deactivate(false);

            throw error instanceof Error ? error : new Error("FormMc assignInputEl(): Unknown error!");

        }
    }

    async getProblem() {
        console.log("FormMc getProblem(): Running...");

        try {
            const response =
                await fetchWithTimeout({ resource: "./components/form-mc/form-mc-generator.php" });
            console.log(response);

            if (!response.ok) {
                throw new Error(`FormMc getProblem() - fetch failed: ${response.status} ${response.statusText}`);
            }

            const problem: [number, number, number] = await response.json();
            console.log(`FormMc getProblem() - problem: ${problem}`);

            return problem;
        } catch (error) {
            throw error instanceof Error ? error : new Error("FormMc getProblem(): Unknown error!");
        }
    }

    async makeProblem() {
        console.log("FormMc makeProblem(): Running...");

        try {
            const dateSyncValues = await getDateSyncValues(this.prevClientOffsetMs, 8, 5);
            this.prevClientOffsetMs = dateSyncValues.clientOffsetMs;
            const correctedDateMs = dateSyncValues.correctedDateMs;

            const [digit1, digit2, invalidAfterTime] = await this.getProblem();

            const timeToRefresh = Math.ceil(Math.max(invalidAfterTime - correctedDateMs, 0));

            const problemData: [number, number, number] = [digit1, digit2, timeToRefresh];
            console.log(`FormMc makeProblem() - problemData: ${problemData}`);

            return problemData;
        } catch (error) {
            throw error instanceof Error ? error : new Error("FormMc makeProblem(): Unknown error!");
        }
    }

    insertProblem(digit1: number, digit2: number) {
        console.log("FormMc insertProblem(): Running...");

        try {
            if (!this.inputEl) {
                throw new Error("FormMc insertProblem(): <input> not found!");
            }

            const labelString = `${digit1} + ${digit2} =`;

            if (document.body.contains(this.inputEl) && !document.body.contains(this.labelEl)) {
                this.inputEl.before(this.labelEl);
            }

            if (document.body.contains(this.labelEl) && !document.body.contains(this.inputEl)) {
                this.labelEl.after(this.inputEl);
            }

            this.labelEl.textContent = labelString;
        } catch (error) {
            this.deactivate(false);

            throw error instanceof Error ? error : new Error("FormMc insertProblem(): Unknown error!");
        }
    }

    async problemLoopHandler() {
        while (this.canLoop) {
            try {
                this.showLoader();

                this.loopConcurrentTryCount++;
                console.log(`FormMc problemLoopHandler() - loopConcurrentTryCount: ${this.loopConcurrentTryCount}`);
                this.loopTryCountTotal++;
                console.log(`FormMc problemLoopHandler() - loopTryCountTotal: ${this.loopTryCountTotal}`);

                if (!this.inputEl) {
                    throw new Error("FormMc problemLoopHandler(): <input> not found!");
                }

                this.inputInFocusBeforeRefresh = this.inputEl === document.activeElement;
                this.inputEl.disabled = true;

                const [digit1, digit2, timeToRefresh] = await this.makeProblem();
                this.insertProblem(digit1, digit2);

                this.inputEl.disabled = false;
                if (this.inputInFocusBeforeRefresh) this.inputEl.focus();

                this.loopConcurrentTryCount = 0;

                this.hideLoader(),

                await timeout(timeToRefresh);
            } catch (error) {
                console.error(error);

                if (this.loopConcurrentTryCount > this.makeProblemRetryTimesMs.length) {
                    const errorCause = error instanceof Error && error.cause instanceof Error
                        ? error.cause.name
                        : false;
                    this.deactivate(!!errorCause);

                    this.hideLoader();

                    throw new Error(`FormMc problemLoopHandler(): deactivated because generation failed ${this.loopConcurrentTryCount} concurrent times!`);
                }

                await timeout(this.makeProblemRetryTimesMs[Math.max(this.loopConcurrentTryCount - 1, 0)]);
            }
        }
    }
}
