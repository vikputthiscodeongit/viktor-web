export default async function initFormMc(mcEl) {
    console.log("initFormMc() - running");

    const mcLabel = mcEl.previousElementSibling;
    console.log("initFormMc() - mcLabel");
    console.log(mcLabel);

    mcLabel.textContent = "MC LOADING";

    try {
        throw new Error();
        await makeProblem(mcLabel);

        return true;
    } catch (error) {
        console.error(error);

        return error;
    }
}

// https://stackoverflow.com/a/22969338/6396604
function getServerTime() {
    // the NTP algorithm
    // t0 is the client's timestamp of the request packet transmission,
    // t1 is the server's timestamp of the request packet reception,
    // t2 is the server's timestamp of the response packet transmission and
    // t3 is the client's timestamp of the response packet reception.
    function ntp(t0, t1, t2, t3) {
        return {
            roundtripdelay: (t3 - t0) - (t2 - t1),
            offset: ((t1 - t0) + (t2 - t3)) / 2
        };
    }

    // calculate the difference in seconds between the client and server clocks, use
    // the NTP algorithm, see: http://en.wikipedia.org/wiki/Network_Time_Protocol#Clock_synchronization_algorithm
    var t0 = (new Date()).valueOf();

    $.ajax({
        url: '/ntp',
        success: function(servertime, text, resp) {
            // NOTE: t2 isn't entirely accurate because we're assuming that the server spends 0ms on processing.
            // (t1 isn't accurate either, as there's bound to have been some processing before that, but we can't avoid that)
            var t1 = servertime,
                t2 = servertime,
                t3 = (new Date()).valueOf();

            // we can get a more accurate version of t2 if the server's response
            // contains a Date header, which it generally will.
            // EDIT: as @Ariel rightly notes, the HTTP Date header only has
            // second resolution, thus using it will actually make the calculated
            // result worse. For higher accuracy, one would thus have to
            // return an extra header with a higher-resolution time. This
            // could be done with nginx for example:
            // http://nginx.org/en/docs/http/ngx_http_core_module.html
            // var date = resp.getResponseHeader("Date");
            // if (date) {
            //     t2 = (new Date(date)).valueOf();
            // }

            var c = ntp(t0, t1, t2, t3);

            // log the calculated value rtt and time driff so we can manually verify if they make sense
            console.log("NTP delay:", c.roundtripdelay, "NTP offset:", c.offset, "corrected: ", (new Date(t3 + c.offset)));
        }
    });
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

        return error;
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
