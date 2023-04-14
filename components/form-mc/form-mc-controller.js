export default async function initFormMc(mcEl) {
    console.log("initFormMc() - running");

    const mcLabel = mcEl.previousElementSibling;
    console.log("initFormMc() - mcLabel");
    console.log(mcLabel);

    mcLabel.textContent = "MC LOADING";

    try {
        // throw new Error();
        await makeProblem(mcLabel);

        return true;
    } catch (error) {
        console.error(error);

        return error;
    }
}

const MAKE_PROBLEM_TIMEOUTS = [3000, 5000, 8000];
let makeProblemTryCount = 0;

async function makeProblem(mcLabel) {
    console.log("makeProblem() - running");

    makeProblemTryCount++;
    console.log(`makeProblem(): makeProblemTryCount - ${makeProblemTryCount}`);

    if (makeProblemTryCount > MAKE_PROBLEM_TIMEOUTS.length) {
        console.error("makeProblem(): Failed to make problem 3 times. Exiting.");

        return;
    }

    try {
        const problem = await getMathsProblem();
        console.log(problem);

        if (problem instanceof Error) {
            throw new Error(problem.message);
        }

        mcLabel.textContent = `${problem[0]} + ${problem[1]} =`;

        scheduleMakeProblem(problem[2], mcLabel);
        makeProblemTryCount = 0;
    } catch (error) {
        console.error(error);

        setTimeout(scheduleMakeProblem, MAKE_PROBLEM_TIMEOUTS[makeProblemTryCount - 1], 0, mcLabel);
    }
}

async function getMathsProblem() {
    console.log("getMathsProblem() - running");

    try {
        const response = await fetch("./components/form-mc/form-mc-generator.php", {
            method: "GET"
        });

        if (!response.ok) {
            console.warn("getMathsProblem() - Received erroreous response.");

            throw new Error(response.statusText);
        }

        const problem = await response.json();
        console.log(`getMathsProblem() / problem - ${problem}`);

        return problem;
    } catch (error) {
        console.error(error);

        return error;
    }
}

const PROBLEM_REFRESH_GRACE_TIME = 500;

function scheduleMakeProblem(invalidAfter, mcLabel) {
    console.log("scheduleMakeProblem(): Running.");

    let timeToRefresh = invalidAfter - Date.now() - PROBLEM_REFRESH_GRACE_TIME;
    console.log(`scheduleMakeProblem(): timeToRefresh 1 - ${timeToRefresh}`);

    if (timeToRefresh <= 0) {
        timeToRefresh = 0;
    }
    console.log(`scheduleMakeProblem(): timeToRefresh 2 - ${timeToRefresh}`);

    setTimeout(makeProblem, timeToRefresh, mcLabel);
}
