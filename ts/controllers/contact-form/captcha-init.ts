import { createEl } from "@codebundlesbyvik/js-helpers";
import Ntp, { convertUnixTimeFormatToMs } from "@codebundlesbyvik/ntp-sync";
import SimpleMathsCaptcha from "@codebundlesbyvik/simple-maths-captcha";
import { updateValidation } from "./validate";

type ProblemEndpointData = {
    digit_1: number;
    digit_2: number;
    generation_time: number;
    valid_for_time: number;
};

export function initSimpleMathsCaptcha(formEl: HTMLFormElement) {
    const id =
        formEl.name || formEl.id
            ? (formEl.name ?? formEl.id) + "-simple-maths-captcha"
            : "simple-maths-captcha";

    const activatorButtonEl = formEl.querySelector<HTMLButtonElement>(`#${id}-activator`);

    if (!activatorButtonEl) {
        throw new Error("Failed to initialize SimpleMathsCaptcha - activator button not found.");
    }

    const ntp = new Ntp({
        t1EndpointUrl: "/api/ntp/get-server-time.php",
        t1CalcFn: async function (response: Response) {
            const fetchedData = (await response.json()) as unknown;

            const isValidData = (data: unknown): data is { received_time_micro: number } =>
                typeof data === "object" && data !== null && "received_time_micro" in data;

            return isValidData(fetchedData)
                ? convertUnixTimeFormatToMs(fetchedData.received_time_micro)
                : null;
        },
        t2CalcFn: function (responseHeaders: Headers) {
            const header = responseHeaders.get("Response-Timing");

            if (!header) return null;

            // https://httpd.apache.org/docs/2.4/mod/mod_headers.html#header
            const reqReceivedTimeMicro = /\bt=([0-9]+)\b/.exec(header);
            const reqProcessingTimeMicro = /\bD=([0-9]+)\b/.exec(header);

            if (!reqReceivedTimeMicro || !reqProcessingTimeMicro) return null;

            const respTransmitTime =
                Number.parseInt(reqReceivedTimeMicro[1]) +
                Number.parseInt(reqProcessingTimeMicro[1]);

            return convertUnixTimeFormatToMs(respTransmitTime);
        },
    });
    const dataEndpoint = {
        url: "/api/simple-maths-captcha/generate-problem.php",
        fetchOptions: {
            method: "POST",
            body: JSON.stringify({ id }),
        },
    };
    const dataHandlerFn = async (response: Response) => {
        const fetchedData = (await response.json()) as unknown;

        const isValidData = (data: unknown): data is ProblemEndpointData =>
            typeof data === "object" &&
            data !== null &&
            "digit_1" in data &&
            "digit_2" in data &&
            "generation_time" in data &&
            "valid_for_time" in data &&
            Object.values(data).every((value) => typeof value === "number");

        if (!isValidData(fetchedData)) return null;

        const { digit_1, digit_2, generation_time, valid_for_time } = fetchedData;

        return {
            digit1: digit_1,
            digit2: digit_2,
            generationTime: generation_time,
            validForTime: valid_for_time,
        };
    };
    const answerInputElEventHandlers = [
        {
            // TODO: Debounce
            type: "input",
            listener: () => {
                captcha.answerInputEl.setAttribute("data-had-interaction", "true");

                // The <input> is marked invalid after the answer is confirmed to be incorrect
                // proceeding the back end validation.
                // On any input, reset the validity state.
                if (captcha.answerInputEl.value.length >= captcha.answerInputEl.minLength) {
                    captcha.answerInputEl.setCustomValidity("");
                }

                if (captcha.answerInputEl.getAttribute("data-validation-on-input") === "true") {
                    updateValidation(captcha.answerInputEl, "neutral");
                }

                return;
            },
        },
        {
            type: "blur",
            listener: () => {
                if (captcha.answerInputEl.getAttribute("data-had-interaction") === "true") {
                    captcha.answerInputEl.setAttribute("data-validation-on-input", "true");
                }

                if (captcha.answerInputEl.getAttribute("data-validation-on-input") === "true") {
                    updateValidation(captcha.answerInputEl, "neutral");
                }

                return;
            },
        },
    ];
    const loaderEl = createEl("div", {
        class: "spinner spinner--lg",
        role: "presentation",
    });
    const captcha = new SimpleMathsCaptcha({
        activatorButtonEl,
        id,
        ntp,
        dataEndpoint,
        dataHandlerFn,
        answerInputElEventHandlers,
        loaderEl,
    });

    return captcha;
}
