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

// https://stackoverflow.com/a/22969338/6396604
//
// NTP
// t0 is the client's timestamp at the request packet transmission
// t1 is the server's timestamp at the request packet reception
// t2 is the server's timestamp at the response packet transmission
// t3 is the client's timestamp at the response packet reception
async function generateNtpData() {
    console.info("generateNtpData: Running...");

    const t0ReqTransmitTime = new Date().valueOf();
    console.debug(`generateNtpData - t0ReqTransmitTime:`, t0ReqTransmitTime);

    const response = await fetchWithTimeout("./api/ntp/get-server-time.php", {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`t1 fetch failed: ${response.status} - ${response.statusText}`);
    }

    const data = (await response.json()) as { request_time: number };
    const t1ReqReceivedTime = convertUnixTimeFormatToMs(data.request_time);
    console.debug(`generateNtpData - t1ReqReceivedTime:`, t1ReqReceivedTime);

    let t2RespTransmitTime = t1ReqReceivedTime;
    const t2RespDateMicroHeader = response.headers.get("Date-Micro");

    // If available, use HTTP header with date in miliseconds.
    if (
        t2RespDateMicroHeader &&
        t2RespDateMicroHeader.length > t2RespTransmitTime.toString().length
    ) {
        console.info("generateNtpData: Using custom HTTP header for better t2 accuracy.");

        t2RespTransmitTime = convertUnixTimeFormatToMs(t2RespTransmitTime);
    }

    console.debug(`generateNtpData - t2RespTransmitTime:`, t2RespTransmitTime);

    const t3RespReceivedTime = new Date().valueOf();
    console.debug(`generateNtpData - t3RespReceivedTime:`, t3RespReceivedTime);

    if (
        [t0ReqTransmitTime, t1ReqReceivedTime, t2RespTransmitTime, t3RespReceivedTime].some(
            (time) => Number.isNaN(time),
        )
    ) {
        throw new Error("Some of the generated time values aren't of type `number`.");
    }

    const roundTripDelay =
        t3RespReceivedTime - t0ReqTransmitTime - (t2RespTransmitTime - t1ReqReceivedTime);
    const clientOffset =
        (t1ReqReceivedTime - t0ReqTransmitTime + (t2RespTransmitTime - t3RespReceivedTime)) / 2; // client > server
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
