/*
Wanneer dit een library wordt:
* Converteer naar class
* NTP sync result wordt opgeslagen
  > smartNtpSync() return dit resultaat indien laatste sync < 5 seconden geleden.
*/

import { fetchWithTimeout, getAverage, wait } from "@codebundlesbyvik/js-helpers";

function filterOutliers(values: number[]) {
    if (values.length < 5) return values;

    return values.sort((a, b) => a - b).slice(1, values.length - 2);
}

function convertUnixTimeFormatToMs(time: number) {
    console.log(time);

    const timeString = time.toString().trim().replace(".", "");

    const processedTimeString =
        timeString.length > 16 ? timeString.slice(0, 16) : timeString.padEnd(16, "0");
    console.log("convertUnixTimeFormatToMs(): processedTimeString - ", processedTimeString);

    const processedTime = Number.parseInt(processedTimeString);

    if (Number.isNaN(processedTime)) {
        throw new Error("`time` must be a `number`");
    }

    if (processedTimeString.length !== 16) {
        throw new Error("Something went terribly wrong during Unix Time conversion.");
    }

    const timeInMs = Math.round(processedTime / 1000);
    console.log(timeInMs);

    return timeInMs;
}

// https://stackoverflow.com/a/22969338/6396604
//
// NTP
// t0 is the client's timestamp at the request packet transmission
// t1 is the server's timestamp at the request packet reception
// t2 is the server's timestamp at the response packet transmission
// t3 is the client's timestamp at the response packet reception
type NtpData = {
    roundTripDelay: number;
    clientOffset: number;
};

async function generateNtpData(): Promise<NtpData> {
    // console.log("generateNtpData(): Running...");

    try {
        const t0ReqTransmitTime = new Date().valueOf();
        console.log(`generateNtpData() - t0ReqTransmitTime:`, t0ReqTransmitTime);

        // TODO: Validate that fetchWithTimeout abort is properly handled.
        const response = await fetchWithTimeout("./components/time-sync/ntp.php", {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`T1 fetch failed: ${response.status} - ${response.statusText}`);
        }

        // Check amount of digits. Various server configs may return either seconds, milliseconds or microseconds.
        const data = (await response.json()) as number;
        const t1ReqReceivedTime = convertUnixTimeFormatToMs(data);
        console.log(`generateNtpData() - t1ReqReceivedTime:`, t1ReqReceivedTime);

        let t2RespTransmitTime = t1ReqReceivedTime;
        // TODO: Header name should be an option.
        const t2RespDateMicroHeader = response.headers.get("Date-Micro");

        if (
            t2RespDateMicroHeader &&
            // For better accuracy, use t2RespTransmitTime if t2RespDateMicroHeader is in seconds.
            (t2RespDateMicroHeader.length === 13 || t2RespDateMicroHeader.length === 16)
        ) {
            console.log("generateNtpData(): Using custom HTTP header for better t2 accuracy.");

            t2RespTransmitTime = convertUnixTimeFormatToMs(t2RespTransmitTime);
        }

        console.log(`generateNtpData() - t2RespTransmitTime:`, t2RespTransmitTime);

        const t3RespReceivedTime = new Date().valueOf();
        console.log(`generateNtpData() - t3RespReceivedTime:`, t3RespReceivedTime);

        if (
            [t0ReqTransmitTime, t1ReqReceivedTime, t2RespTransmitTime, t3RespReceivedTime].some(
                (time) => Number.isNaN(time),
            )
        ) {
            throw new Error("Some of the NTP time values aren't of type 'number'.");
        }

        const roundTripDelay =
            t3RespReceivedTime - t0ReqTransmitTime - (t2RespTransmitTime - t1ReqReceivedTime);
        const clientOffset =
            (t1ReqReceivedTime - t0ReqTransmitTime + (t2RespTransmitTime - t3RespReceivedTime)) / 2; // client > server
        console.log(`generateNtpData(): RTL / CO:`, [roundTripDelay, clientOffset]);

        return { roundTripDelay, clientOffset };
    } catch (error) {
        throw error instanceof Error
            ? error
            : new Error("NTP data generation failed due to an unknown error!");
    }
}

async function ntpSync(attempts: number, requiredOkAttempts: number): Promise<NtpData> {
    // console.log("ntpSync(): Running...");

    try {
        if (attempts < 1) {
            throw new Error("At least 1 sync attempt is required.");
        }

        const data = [];
        let lastError: Error | undefined = undefined;

        for (let runCount = 0, okRunCount = 0; runCount < attempts; runCount++) {
            // console.log(`ntpSync() - fetch loop run: ${runCount}`);

            try {
                if (runCount > requiredOkAttempts) {
                    await wait(1000);
                }

                const ntpData = await generateNtpData();
                data.push(ntpData);

                okRunCount++;

                if (okRunCount > requiredOkAttempts) break;
            } catch (error) {
                console.error(error);

                console.log(`ntpSync(): Loop run ${runCount} / ${attempts} failed!`);

                lastError =
                    error instanceof Error
                        ? error
                        : new Error("Sync attempt failed due to an unknown error!");
            }
        }

        console.log(`ntpSync() - data:`, data);

        if (data.length < requiredOkAttempts) {
            throw new Error(
                `Not enough successful sync attempts (${requiredOkAttempts} / ${attempts}).`,
                { cause: lastError },
            );
        }

        const syncedData = {
            roundTripDelay: getAverage(
                filterOutliers(data.map((item) => item.roundTripDelay)),
                "floor",
            ),
            clientOffset: getAverage(
                filterOutliers(data.map((item) => item.clientOffset)),
                "floor",
            ),
        };

        return syncedData;
    } catch (error) {
        throw error instanceof Error
            ? error
            : new Error("NTP sync failed due to an unknown error!");
    }
}

type NtpSyncData = NtpData & { correctedDate: number };

interface SmartNtpSync {
    attemptsOnFullSync?: number;
    requiredSuccessesOnFullSync?: number;
    offsetTreshold?: number;
    prevNtpSyncData?: NtpData | NtpSyncData;
}

async function smartNtpSync({
    attemptsOnFullSync = 6,
    requiredSuccessesOnFullSync = 4,
    offsetTreshold = 250,
    prevNtpSyncData,
}: SmartNtpSync): Promise<NtpSyncData> {
    try {
        if (prevNtpSyncData) {
            const ntpData = await generateNtpData();
            const correctedDate = new Date().valueOf() - prevNtpSyncData.clientOffset;

            if (
                prevNtpSyncData.clientOffset - ntpData.clientOffset > -1 * offsetTreshold &&
                prevNtpSyncData.clientOffset - ntpData.clientOffset < offsetTreshold
            ) {
                return {
                    ...prevNtpSyncData,
                    correctedDate,
                };
            }

            console.log(
                "smartNtpSync(): Client offset discrepancy too large. Starting full sync...",
            );
        }

        const ntpData = await ntpSync(attemptsOnFullSync, requiredSuccessesOnFullSync);
        const correctedDate = new Date().valueOf() - ntpData.clientOffset;

        return {
            ...ntpData,
            correctedDate,
        };
    } catch (error) {
        throw error instanceof Error
            ? error
            : new Error("NTP quick sync failed due to an unknown error!");
    }
}

export { type NtpData, type NtpSyncData, generateNtpData, ntpSync, smartNtpSync };
