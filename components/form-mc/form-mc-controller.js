import createEl from "/helpers/create-el";

export default async function initFormMc(mcEl, mcLabelEl, loaderEl, initFormMcButtonEl) {
    console.log("initFormMc(): Running.");

    const freshLoad = !mcLabelEl && !loaderEl && !initFormMcButtonEl;
    console.log(freshLoad);

    if (freshLoad) {
        mcEl.setAttribute("disabled", true);

        loaderEl = createEl("div", { class: "spinner", style: "font-size: 1.5rem;" });
        mcLabelEl = createEl("label", { for: mcEl.name });
    } else {
        initFormMcButtonEl.setAttribute("disabled", true);
    }

    mcEl.parentElement.appendChild(loaderEl);

    try {
        // throw new Error();
        await makeProblem(-1, mcEl, mcLabelEl, loaderEl);

        if (freshLoad) {
            mcEl.parentElement.insertBefore(mcLabelEl, mcEl);
            mcEl.removeAttribute("disabled");
        } else {
            initFormMcButtonEl.remove();
            mcLabelEl.parentElement.appendChild(mcEl);
        }

        loaderEl.remove();

        return true;
    } catch (error) {
        console.error(error);

        initFormMcButtonEl.removeAttribute("disabled");

        return error;
    }

}

// DEBUG VALUES
const MAKE_PROBLEM_TIMEOUTS = [3000 / 3, 5000 / 3, 8000 / 3];

async function makeProblem(tryCount, mcEl, mcLabelEl, loaderEl) {
    console.log("makeProblem(): Running.");
    console.log(tryCount);
    console.log(mcEl);
    console.log(mcLabelEl);
    console.log(loaderEl);

    tryCount++;
    console.log(`makeProblem(): tryCount - ${tryCount}`);

    if (tryCount > 0) {
        mcEl.parentElement.appendChild(loaderEl);
    }

    try {
        const problem = await getMathsProblem();

        if (problem instanceof Error) {
            throw new Error(problem.message);
        }

        scheduleMakeProblem(problem[2], 0, mcEl, mcLabelEl, loaderEl);

        mcLabelEl.textContent = `${problem[0]} + ${problem[1]} =`;

        if (tryCount > 0) {
            loaderEl.remove();
        }
    } catch (error) {
        console.error(error);

        if (tryCount > MAKE_PROBLEM_TIMEOUTS.length) {
            console.error(`makeProblem(): Failed to make problem ${tryCount} times. Exiting.`);

            addInitFormMcButton(mcEl, mcLabelEl, loaderEl);

            loaderEl.remove();

            return;
        }

        setTimeout(scheduleMakeProblem, MAKE_PROBLEM_TIMEOUTS[tryCount > 0 ? tryCount - 1 : 0], 0, tryCount, mcEl, mcLabelEl, loaderEl);
    }
}

async function getMathsProblem() {
    console.log("getMathsProblem(): Running.");

    try {
        const response = await fetch("./components/form-mc/form-mc-generator.php", {
            method: "GET"
        });

        if (!response.ok) {
            console.warn("getMathsProblem(): Received erroreous response.");

            throw new Error(response.statusText);
        }

        const problem = await response.json();
        console.log(`getMathsProblem(): problem - ${problem}`);

        return problem;
    } catch (error) {
        console.error(error);

        return error;
    }
}

const PROBLEM_REFRESH_GRACE_TIME = 500;

function scheduleMakeProblem(invalidAfter, tryCount, mcEl, mcLabelEl, loaderEl) {
    console.log("scheduleMakeProblem(): Running.");

    let timeToRefresh = invalidAfter - Date.now() - PROBLEM_REFRESH_GRACE_TIME;
    console.log(`scheduleMakeProblem(): timeToRefresh 1 - ${timeToRefresh}`);

    if (timeToRefresh <= 0) {
        timeToRefresh = 0;
    }
    console.log(`scheduleMakeProblem(): timeToRefresh 2 - ${timeToRefresh}`);

    setTimeout(makeProblem, timeToRefresh, tryCount, mcEl, mcLabelEl, loaderEl);
}

function addInitFormMcButton(mcEl, mcLabelEl, loaderEl) {
    mcEl.remove();

    mcLabelEl.textContent = "CAPTCHA inactive";

    const initFormMcButtonEl = createEl("button", { type: "button", text: "Activate" });
    initFormMcButtonEl.addEventListener("click", () => initFormMc(mcEl, mcLabelEl, loaderEl, initFormMcButtonEl));
    mcLabelEl.parentElement.appendChild(initFormMcButtonEl);
}
