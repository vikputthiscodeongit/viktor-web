import { fetchWithTimeout, getAverage, wait } from "@codebundlesbyvik/js-helpers";

function convertUnixTimeFormatToMs(time: number) {
    const timeString = time.toString().trim().replace(".", "");
    const processedTimeString =
        timeString.length > 16 ? timeString.slice(0, 16) : timeString.padEnd(16, "0");
    console.debug("convertUnixTimeFormatToMs(): processedTimeString - ", processedTimeString);
    const timeNumber = Number.parseInt(processedTimeString);

    if (Number.isNaN(timeNumber)) {
        throw new Error("`time` must be a `number`");
    }

    const timeInMs = Math.round(timeNumber / 1000);

    return timeInMs;
}

function filterOutliers(values: number[]) {
    if (values.length < 5) return values;

    return values.sort((a, b) => a - b).slice(1, values.length - 2);
}

function t2CalcFn(resHeaders: Headers) {
    const header = resHeaders.get("Response-Timing");

    if (!header) {
        return null;
    }

    // https://httpd.apache.org/docs/2.4/mod/mod_headers.html#header
    const reqReceivedTime = /\bt=([0-9]+)\b/.exec(header);
    const reqProcessingTime = /\bD=([0-9]+)\b/.exec(header);

    if (!reqReceivedTime || !reqProcessingTime) {
        return null;
    }

    const resTransmitTime =
        Number.parseInt(reqReceivedTime[1]) + Number.parseInt(reqProcessingTime[1]);

    if (Number.isNaN(resTransmitTime)) {
        return null;
    }

    return convertUnixTimeFormatToMs(resTransmitTime);
}

// https://stackoverflow.com/a/22969338/6396604
//
// NTP
// t0 is the client's timestamp at the request packet transmission
// t1 is the server's timestamp at the request packet reception
// t2 is the server's timestamp at the response packet transmission
// t3 is the client's timestamp at the response packet reception
async function generateNtpData() {
    console.info("generateNtpData: Running...");

    const t0 = new Date().valueOf();
    console.debug(`generateNtpData - t0:`, t0);

    const response = await fetchWithTimeout("./api/ntp/get-server-time.php", {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`t1 fetch failed: ${response.status} - ${response.statusText}`);
    }

    const data = (await response.json()) as { request_time: number };
    const t1 = convertUnixTimeFormatToMs(data.request_time);
    console.debug(`generateNtpData - t1:`, t1);

    let t2 = t1;

    // if (t2CalcFn) {
    //     console.debug("generateNtpData: Custom t2 calculation function provided.");

    const t2CalcFnResult = t2CalcFn(response.headers);
    console.debug("generateNtpData - t2CalcFnResult:", t2CalcFnResult);

    if (t2CalcFnResult !== null && t2CalcFnResult > t1) {
        console.debug("generateNtpData: Using t2CalcFnResult.");

        t2 = t2CalcFnResult;
    }
    // }

    console.debug(`generateNtpData - t2:`, t2);

    const t3 = new Date().valueOf();
    console.debug(`generateNtpData - t3:`, t3);

    if ([t0, t1, t2, t3].some((time) => Number.isNaN(time))) {
        throw new Error("Some of the generated time values aren't of type `number`.");
    }

    const roundTripDelay = t3 - t0 - (t2 - t1);
    const clientOffset = (t1 - t0 + (t2 - t3)) / 2; // client > server
    console.debug(`generateNtpData: RTL / CO:`, [roundTripDelay, clientOffset]);

    return { roundTripDelay, clientOffset };
}

export async function ntpSync(attempts = 6, requiredOkAttempts = 4) {
    console.info("ntpSync: Running...");

    try {
        const data = [];

        for (let iteration = 0, successfulIterations = 0; iteration < attempts; iteration++) {
            console.debug(`ntpSync - fetch loop run: ${iteration}`);

            try {
                if (iteration > requiredOkAttempts) {
                    await wait(1000);
                }

                const ntpData = await generateNtpData();
                data.push(ntpData);

                successfulIterations++;

                if (successfulIterations > requiredOkAttempts) break;
            } catch (error) {
                console.error(error);
                console.debug(`ntpSync: Error during loop iteration ${iteration}.`);

                if (iteration < attempts - 1) {
                    console.debug(`ntpSync: Retrying ${attempts - 1 - iteration} more time(s)!`);
                }
            }
        }

        console.debug(`ntpSync - data:`, data);
        console.debug(`ntpSync - data.length:`, data.length);

        if (data.length < requiredOkAttempts) {
            throw new Error(
                `Didn't meet the required amount of ${requiredOkAttempts} successful sync attempts within the allowed amount of ${attempts} total.`,
            );
        }

        const roundTripDelay = getAverage(
            filterOutliers(data.map((item) => item.roundTripDelay)),
            "floor",
        );
        const clientOffset = getAverage(
            filterOutliers(data.map((item) => item.clientOffset)),
            "floor",
        );
        const correctedDate = new Date().valueOf() - clientOffset;

        const values = { roundTripDelay, clientOffset, correctedDate };
        console.debug("ntpSync - values:", values);

        return values;
    } catch (error) {
        throw error instanceof Error ? error : new Error("Unknown error during NTP sync!");
    }
}
