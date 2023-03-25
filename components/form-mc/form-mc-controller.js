export default async function initFormMc(mcEl) {
    console.log("initFormMc() - running");

    const mcLabel = mcEl.previousElementSibling;
    console.log("initFormMc() - mcLabel");
    console.log(mcLabel);

    mcLabel.textContent = "MC LOADING";

    try {
        await makeProblem(mcLabel);

        return true;
    } catch (error) {
        return console.error(error);
    }
}

async function makeProblem(mcLabel) {
    console.log("makeProblem() - running");

    try {
        const problem = await getMathsProblem();
        console.log(problem);

        if (problem instanceof Error) {
            // Retry 2 times
            return;
        }

        setMathsProblem(mcLabel, problem);
        scheduleProblemRefresh(problem[2], mcLabel);
    } catch (error) {
        console.error(error);
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
        }

        const problem = await response.json();
        console.log(`getMathsProblem() / problem - ${problem}`);

        return problem;
    } catch (error) {
        console.error(error);

        return error;
    }
}

function setMathsProblem(mcLabel, problem) {
    console.log("setMathsProblem() - running");

    mcLabel.textContent = `${problem[0]} + ${problem[1]} =`;
}

async function refreshProblem(mcLabel) {
    console.log("refreshProblem() - running");

    let retries = 0;

    try {
        await makeProblem(mcLabel);
    } catch (error) {
        retries++;

        if (retries <= 2) {
            setTimeout(() => refreshProblem(mcLabel), 5000);
        } else {
            return console.error(error);
        }
    }
}

function scheduleProblemRefresh(invalidAfter, mcLabel) {
    console.log("scheduleProblemRefresh() - running");

    const currentTime = Date.now();
    const timeToRefresh = invalidAfter - currentTime - 500;

    if (timeToRefresh <= 0) {
        refreshProblem(mcLabel);

        return;
    }

    setTimeout(() => refreshProblem(mcLabel), timeToRefresh);
}
