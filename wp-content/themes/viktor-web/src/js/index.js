import debounce from "lodash/debounce";

// import Noty from "noty";
import TypeIt from "typeit";

import stylesheet from "../scss/style.scss";

(function() {
    // Helpers
    // Check if stylesheet has been loaded
    // function cssLoaded() {
    //     return cssValue(body, "display") === "flex";
    // }

    // Get a CSS element property value
    function cssValue(el, prop) {
        const elStyles = window.getComputedStyle(el);

        return elStyles.getPropertyValue(prop);
    }

    // Convert CSS unit to a number
    // function cssUnitToNo(unit) {
    //     let sliceEnd = -2;

    //     if (unit.indexOf("rem") > -1) {
    //         sliceEnd = -3;
    //     }

    //     return Number(unit.slice(0, sliceEnd));
    // }

    // Check if viewport is above given breakpoint
    // function aboveBreakpoint(bpName) {
    //     if (!bpName || bpName === "0")
    //         return true;

    //     if (bpName === "wide") {
    //         bpName = "lg";
    //     }

    //     const bp = stylesheet[`${bpName}Breakpoint`];

    //     if (typeof bp === "undefined") {
    //         console.error("The given breakpoint either doesn't exist or hasn't been exported to JavaScript.");
    //     }

    //     return window.matchMedia(`(min-width: ${bp})`).matches;
    // }

    // Check if prefers-reduced-motion is set
    function motionAllowed() {
        return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    // Valide an email address
    // Validation is done against the standard defined in the RFC 5322 specification.
    // See also https://stackoverflow.com/a/201378/6396604 & https://emailregex.com/.
    function isValidEmail(address) {
        const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;

        return regEx.test(address);
    }


    // Define globally used constants
    const html = document.documentElement,
          body = document.body;


    // Event handlers
    document.addEventListener("DOMContentLoaded", function() {
        html.classList.replace("no-js", "js");

        inputDeviceDetector();

        main.init();

        typeItAbout.init();

        wpcf7.init();
    });


    // Input devices
    function inputDeviceDetector() {
        console.log("In inputDeviceDetector().");

        body.addEventListener("mousedown", function() {
            body.classList.add("using-mouse");
        });

        body.addEventListener("keydown", function() {
            body.classList.remove("using-mouse");
        });
    }


    // Set development mode indicator
    let debugMode = {};

    debugMode.init = function() {
        if (!debugMode.isSet)
            return;

        debugMode.setIndicator();
    };

    debugMode.isSet = process.env.NODE_ENV === "production" ? false : true;

    debugMode.setIndicator = function() {
        const width = "0.125rem",
              style = "solid",
              color = "red";

        body.style.borderLeft = `${width} ${style} ${color}`;
        body.style.borderRight = body.style.borderLeft;
    };


    // Main
    let main = {};

    main.init = function() {
        console.log("In main.init().");

        // if (!cssLoaded()) {
        //     const timeout = 1000;

        //     console.log(`CSS hasn't been loaded yet - running function in ${timeout} ms!`);

        //     setTimeout(main.init, timeout);

        //     return;
        // }

        main.heightFixer();

        window.addEventListener("resize", debounce(function() {
            main.heightFixer();
        }, 25));
    };

    main.el = document.querySelector("main");

    main.heightFixer = function() {
        console.log("In main.heightFixer().");

        let vh = html.clientHeight;

        const vhMin = 480,
              vhMax = 1080;

        if (vh < vhMin) {
            vh = vhMin;
        }

        if (vh > vhMax) {
            vh = vhMax;
        }

        main.el.style.setProperty("--vh", `${vh}px`);
    };


    // TypeIt
    let typeItAbout = {};

    typeItAbout.init = function() {
        console.log("In typeItAbout.init().");

        if (!typeItAbout.el) {
            console.log("Returning from function - TypeIt element not found!");

            return;
        }

        typeItAbout.type();
    };

    typeItAbout.el = document.querySelector(".viktor-about--typeit > span");

    typeItAbout.type = function() {
        new TypeIt(typeItAbout.el, {
            speed: 75,
            deleteSpeed: 40,
            loop: true
        })
            // 1
            .type("Homo sapiens", {delay: 1450})
            .delete(null, {delay: 900})
            // 2
            .type("Autoliefhebber", {delay: 1800})
            .delete(null, {delay: 1000})
            // 3
            .type("Hobbu-", {delay: 500})
            .delete(2, {delay: 550})
            .type("yfotograaf", {delay: 2000})
            .delete(null, {delay: 900})
            // 4
            .type("Webdevlo", {delay: 500})
            .move(-2, {speed: 150, delay: 350})
            .type("e", {delay: 500})
            .move(2, {speed: 100, delay: 400})
            .type("per", {delay: 1850})
            .delete(null, {delay: 1000})
            // 5
            .type("Part", {delay: 650})
            .type("-", {delay: 500})
            .type("tue", {delay: 550})
            .delete(2, {delay: 450})
            .type("ime", {delay: 550})
            .type(" ", {delay: 400})
            .type("superman", {delay: 1800})
            .delete(null, {delay: 850})
            .go();
    };


    // Contact Form 7
    let wpcf7 = {};

    wpcf7.init = function() {
        console.log("In wpcf7.init().");

        if (wpcf7.els.length === 0) {
            console.log("Exiting function - no WPCF7 elements found on this page!");

            return;
        }

        wpcf7.els.forEach((wpcf7El) => {
            // The form itself
            wpcf7.captcha(wpcf7El);

            wpcf7.formTransformer(wpcf7El);

            wpcf7El.addEventListener("wpcf7invalid", function(e) {
                wpcf7.invalidInputScroller(e);
            });

            const wpcf7Form        = wpcf7El.querySelector(".wpcf7-form"),
                  submitButton     = wpcf7Form.querySelector("[type='submit']"),
                  submitButtonText = submitButton.querySelector(".btn__text");

            wpcf7El.addEventListener("wpcf7beforesubmit", function(e) {
                if (!submitButton.hasAttribute("data-string-send")) {
                    submitButton.setAttribute(
                        "data-string-send",
                        submitButtonText.textContent
                    );
                }
                submitButton.setAttribute("disabled", true);
                submitButton.classList.add("is-submitting");

                submitButtonText.textContent =
                    submitButton.getAttribute("data-string-sending");
            });

            wpcf7El.addEventListener("wpcf7submit", function(e) {
                // const formStatus = e.detail.status;

                // const alertType       = formStatus !== "mail_sent" ?
                //                             "warning" : "success",
                //       alertText       = e.detail.apiResponse.message,
                //       alertTimeoutDur = debugMode.isSet ? false : 4000;

                // new Noty({
                //     type:    alertType,
                //     layout:  "topCenter",
                //     theme:   "bootstrap-v4",
                //     text:    alertText,
                //     timeout: alertTimeoutDur,
                //     killer:  true
                // }).show();

                submitButton.removeAttribute("disabled");
                submitButton.classList.remove("is-submitting");

                submitButtonText.textContent =
                    submitButton.getAttribute("data-string-send");
            });

            // Its <input>s
            const inputs = wpcf7Form.querySelectorAll(".form__input");

            inputs.forEach((input) => {
                if (
                    input.classList.contains("wpcf7-validates-as-required") &&
                    // input.value isn't necessarily always empty on form initialization,
                    // Firefox for example retains <input> values when a page is refreshed.
                    input.value === ""
                ) {
                    wpcf7.setStateInvalid(input);
                }

                input.addEventListener("input", function() {
                    // Noty.closeAll();

                    wpcf7.inputValidator(input);
                });
            });
        });
    };

    wpcf7.els = document.querySelectorAll(".wpcf7");

    wpcf7.captcha = function(wpcf7El) {
        console.log("In wpcf7.captcha().");

        const wpcf7Form    = wpcf7El.querySelector(".wpcf7-form"),
              problem      = wpcf7Form.querySelector("label[for='wpcf7-mc-answer']"),
              hiddenFields = wpcf7Form.querySelectorAll(".wpcf7-mc-hf"),
              digitInputs  = wpcf7Form.querySelectorAll(
                  "input[name^='wpcf7-mc-d'], input[name='city']"
              );

        hiddenFields.forEach(function(field) {
            field.style.display = "none";
        });

        const digits = problem.textContent.match(/[0-9]+/g);

        digitInputs.forEach(function(input, i) {
            const targetDigit = digits[i];

            // 3 seconds timeout because spambots fill in forms real fast and have most likely already left the page by the time the value gets inserted in the DOM.
            setTimeout(function() {
                if (!input.value) {
                    input.value = targetDigit;
                }
            }, 3000);
        });
    };

    wpcf7.formTransformer = function(wpcf7El) {
        console.log("In wpcf7.formTransformer().");

        const wpcf7Form = wpcf7El.querySelector(".wpcf7-form"),
              fields    = wpcf7Form.querySelectorAll(".field");

        fields.forEach(function(field) {
            const br = field.querySelector("br");

            if (br) {
                br.parentNode.removeChild(br);
            }

            const controlWrap = field.querySelector(".wpcf7-form-control-wrap");

            if (controlWrap) {
                const input = controlWrap.querySelector(".wpcf7-form-control");

                controlWrap.parentNode.insertBefore(input, controlWrap);
                controlWrap.parentNode.removeChild(controlWrap);

                input.tagName === "TEXTAREA" ?
                    input.removeAttribute("cols") :
                    input.removeAttribute("size");
            }

            const ajaxLoader = field.querySelector(".ajax-loader");

            if (ajaxLoader) {
                ajaxLoader.parentNode.removeChild(ajaxLoader);

                const spinner = document.createElement("span");
                spinner.className += ("btn__spinner spinner spinner--light");

                const submitButton = wpcf7Form.querySelector("[type='submit']");

                submitButton.appendChild(spinner);
            }
        });

        const responses = [
            wpcf7El.querySelector(".screen-reader-response"),
            wpcf7Form.querySelector(".wpcf7-response-output")
        ];

        responses.forEach(function(response) {
            response.parentElement.removeChild(response);
        });
    };

    wpcf7.inputValidator = function(input) {
        console.log("In wpcf7.inputValidator().");

        const type = input.getAttribute("type");

        if (
            (type === "email" && isValidEmail(input.value)) ||
            (type !== "email" && input.value !== "")
        ) {
            wpcf7.setStateValid(input);
        } else {
            wpcf7.setStateInvalid(input);
        }
    };

    wpcf7.invalidInputScroller = function(e) {
        console.log("In wpcf7.invalidInputScroller().");

        const invalidInputs     = e.detail.apiResponse.invalid_fields,
              firstInvalidInput = document.getElementById(invalidInputs[0].idref);

        if (firstInvalidInput) {
            firstInvalidInput.scrollIntoView({
                behavior: motionAllowed() ? "smooth" : "auto",
                block: "start",
                inline: "start"
            });
        }
    };

    wpcf7.setStateValid = function(input) {
        console.log("In wpcf7.setStateValid().");

        input.setAttribute("aria-invalid", false);
        input.parentElement.classList.remove("is-invalid");

        input.parentElement.classList.add("is-valid");
    };

    wpcf7.setStateInvalid = function(input) {
        console.log("In wpcf7.setStateInvalid().");

        input.parentElement.classList.remove("is-valid");

        input.setAttribute("aria-invalid", true);
        input.parentElement.classList.add("is-invalid");
    };
}());
