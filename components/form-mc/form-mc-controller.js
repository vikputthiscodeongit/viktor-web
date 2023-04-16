import createEl from "/helpers/create-el";

export default async function initFormMc(mcEl) {
    console.log("initFormMc(): Running.");

    mcEl.setAttribute("disabled", true);

    const mcLabelEl = createEl("label", { for: mcEl.name });
    const loaderEl = createEl("div", { class: "spinner", style: "font-size: 1.5rem;" });

    try {
        // throw new Error();
        await makeProblem(0, mcEl, mcLabelEl, loaderEl);

        mcEl.parentElement.insertBefore(mcLabelEl, mcEl);
        mcEl.removeAttribute("disabled");

        return true;
    } catch (error) {
        console.error(error);

        return error;
    }
}

const MAKE_PROBLEM_TIMEOUTS = [3000, 5000, 8000];

async function makeProblem(tryCount, mcEl, mcLabelEl, loaderEl) {
    console.log("makeProblem(): Running.");

    tryCount++;
    console.log(`makeProblem(): tryCount - ${tryCount}`);

    mcEl.parentElement.appendChild(loaderEl);

    try {
        const problem = await getMathsProblem();

        if (problem instanceof Error) {
            throw new Error(problem.message);
        }

        scheduleMakeProblem(problem[2], 0, mcEl, mcLabelEl, loaderEl);

        mcLabelEl.textContent = `${problem[0]} + ${problem[1]} =`;

        loaderEl.remove();
    } catch (error) {
        console.error(error);

        if (tryCount > MAKE_PROBLEM_TIMEOUTS.length) {
            console.error(`makeProblem(): Failed to make problem ${tryCount} times. Exiting.`);

            return;
        }

        setTimeout(scheduleMakeProblem, MAKE_PROBLEM_TIMEOUTS[tryCount - 1], 0, tryCount, mcEl, mcLabelEl, loaderEl);
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
