import fetchWithTimeout from "../../helpers/js/fetch-with-timeout";
import getNumberArrayAverage from "../../helpers/js/get-number-array-average";
import timeout from "../../helpers/js/set-timeout-promise";

// https://stackoverflow.com/a/22969338/6396604
//
// NTP
// t0 is the client's timestamp at the request packet transmission
// t1 is the server's timestamp at the request packet reception
// t2 is the server's timestamp at the response packet transmission
// t3 is the client's timestamp at the response packet reception
function makeNtpObj(t0: number, t1: number, t2: number, t3: number) {
    const roundTripDelay = (t3 - t0) - (t2 - t1);
    const clientOffset = ((t1 - t0) + (t2 - t3)) / 2; // client > server

    return { roundTripDelay, clientOffset };
}

async function getNtpValues() {
    console.log("getNtpValues(): Running...");

    try {
        const t0ReqTransmitTime = new Date().valueOf();

        const response = await fetchWithTimeout({
            resource: "./components/time-sync/ntp.php",
            fetchOptions: {
                method: "GET"
            }
        });

        if (!response.ok) {
            throw new Error(`getNtpValues() - fetch failed: ${response.status} ${response.statusText}`);
        }

        const t1ReqReceivedTime: number = await response.json();

        let t2RespTransmitTime = t1ReqReceivedTime;
        const t2RespDateMicroHeader = response.headers.get("Date-Micro");

        if (t2RespDateMicroHeader) {
            const t2RespTransmitTimeMicro = parseInt(t2RespDateMicroHeader.slice(-1 * (t2RespDateMicroHeader.length - 2)));
            const t2RespTransmitTimeMilli = Math.round(t2RespTransmitTimeMicro / 1000);
            t2RespTransmitTime = new Date(t2RespTransmitTimeMilli).valueOf()
        }

        const t3RespReceivedTime = new Date().valueOf();

        console.log(`getNtpValues() - NTP values:\n\nt0: ${t0ReqTransmitTime}\nt1: ${t1ReqReceivedTime}\nt1: ${t2RespTransmitTime}\nt3: ${t3RespReceivedTime}`);

        if ([t0ReqTransmitTime, t1ReqReceivedTime, t2RespTransmitTime, t3RespReceivedTime].some((time) => isNaN(time))) {
            throw new Error("getNtpValues(): Some of the required values aren't of type 'number'.");
        }

        const ntpCalculations = makeNtpObj(t0ReqTransmitTime, t1ReqReceivedTime, t2RespTransmitTime, t3RespReceivedTime);

        console.log(`getNtpValues():\n\nDelay:   ${ntpCalculations.roundTripDelay}\nOffset: ${ntpCalculations.clientOffset}`);

        return ntpCalculations;
    } catch (error) {
        throw error instanceof Error ? error : new Error("getNtpValues(): Unknown error!");
    }
}

function getAverageClientOffset(offsets: number[]) {
    let offsetsFiltered = offsets;

    if (offsets.length > 2) {
        const offsetsMin = Math.min(...offsets);
        const offsetsMax = Math.max(...offsets);
        offsetsFiltered = offsets.filter((offset) => offset !== offsetsMin && offset !== offsetsMax);
    }

    const averageClientOffset = getNumberArrayAverage(offsetsFiltered, "floor");
    console.log(`getAverageClientOffset() - averageClientOffset: ${averageClientOffset}`);

    return averageClientOffset;
}

async function getClientOffsetMs(syncAttempts: number, requiredSuccesses: number) {
    console.log("getClientOffsetMs(): Running...");

    try {
        if (syncAttempts < 1) {
            throw new Error("getClientOffsetMs(): syncAttempts cannot be smaller than 1!");
        }

        const offsets: number[] = [];

        for (let runIndex = 0, successfulRunIndex = 0; runIndex < syncAttempts; runIndex++) {
            console.log(`getClientOffsetMs() - fetch loop runIndex: ${runIndex}`);

            if (successfulRunIndex > requiredSuccesses - 1) break;

            try {
                if (runIndex > requiredSuccesses - 1) {
                    await timeout(1000);
                }

                const ntpValues = await getNtpValues();
                offsets[successfulRunIndex] = ntpValues.clientOffset;

                successfulRunIndex++;
            } catch (error) {
                console.warn(`getClientOffsetMs(): Fetch loop run with index ${runIndex} failed!`);

                // If this is the final attempt and the amount of required successful runs isn't met.
                if (
                    runIndex === syncAttempts - 1 && successfulRunIndex < requiredSuccesses - 1 &&
                    error instanceof Error && error.name === "AbortError"
                ) {
                    throw new Error(`getClientOffsetMs(): Final sync attempt failed due to a fetch() timeout!`, { cause: error });
                }
            }
        }

        console.log(`getClientOffsetMs() - offsets:`);
        console.log(offsets);

        if (offsets.length < requiredSuccesses) {
            throw new Error(`getClientOffsetMs(): Didn't meet the amount of ${requiredSuccesses} required successful calculations within the allowed amount of ${syncAttempts} syncAttempts!`);
        }

        return getAverageClientOffset(offsets);
    } catch (error) {
        throw error instanceof Error ? error : new Error("getClientOffsetMs(): Unknown error!");
    }
}

async function getDateSyncValues(
    prevClientOffset: number | null,
    syncAttempts: number,
    reqSuccessfulSyncAttempts: number
) {
    try {
        let newClientOffsetMs: number;

        if (prevClientOffset === null) {
            newClientOffsetMs = await getClientOffsetMs(syncAttempts, reqSuccessfulSyncAttempts);
        } else {
            newClientOffsetMs = await getClientOffsetMs(1, 1);

            if (
                prevClientOffset - newClientOffsetMs < -200 ||
                prevClientOffset - newClientOffsetMs > 200
            ) {
                console.warn("getDateSyncValues(): this.prevClientOffsetMs discrepancy too large!");

                newClientOffsetMs = await getClientOffsetMs(syncAttempts, reqSuccessfulSyncAttempts);
            }
        }

        const correctedDateMs = new Date().valueOf() - newClientOffsetMs;
        console.log(`getDateSyncValues() - correctedDateMs: ${correctedDateMs}`);

        return { clientOffsetMs: newClientOffsetMs, correctedDateMs };
    } catch (error) {
        throw error instanceof Error ? error : new Error("getDateSyncValues(): Unknown error!");
    }
}

export { getDateSyncValues as default };
