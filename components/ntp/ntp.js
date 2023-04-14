function ntp(t0, t1, t2, t3) {
    const roundTripDelaay = (t3 - t0) - (t2 - t1);
    const offset = ((t1 - t0) + (t2 - t3)) / 2;

    return { roundTripDelaay, offset };
}

let getNtpRetryCount = 0;

async function getNtp() {
    console.log("getMathsProblem() - running");

    try {
        const response = await fetch("./ntp.php", {
            method: "GET"
        });

        if (!response.ok) {
            console.warn("getMathsProblem() - Received erroreous response.");

            // Retry in 3 / 5 / 8 seconds
        }

        const serverRespondTime = await response.json();
        console.log(`serverRespondTime() / problem - ${serverRespondTime}`);

        return serverRespondTime;
    } catch (error) {
        console.error(error);

        if (makeProblemTryCount <= 3) {
            setTimeout(() => scheduleMakeProblem(mcLabel), retryTimeouts[makeProblemTryCount]);
        }

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
            var date = resp.getResponseHeader("Date-Micro");
            if (date) {
                t2 = (new Date(date)).valueOf();
            }

            var c = ntp(t0, t1, t2, t3);

            // log the calculated value rtt and time driff so we can manually verify if they make sense
            console.log("NTP delay:", c.roundtripdelay, "NTP offset:", c.offset, "corrected: ", (new Date(t3 + c.offset)));
        }
    });
}
