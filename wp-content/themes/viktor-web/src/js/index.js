import debounce from "lodash/debounce";

// import Noty from "noty";
import TypeIt from "typeit";

import stylesheet from "../scss/style.scss";

(function() {
    // Helpers
    // Convert camelCase to kebab-case
    function camelToKebab(string) {
        return string.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    }

    // Get a random integer
    function randIntUnder(max) {
        return Math.floor(Math.random() * max);
    }

    // Create a DOM element
    function createEl(tag, attrs) {
        const el = document.createElement(tag);

        for (const [key, val] of Object.entries(attrs)) {
            el.setAttribute(camelToKebab(key), val);
        }

        return el;
    }

    // Get a CSS element property value
    // function cssValue(el, prop) {
    //     const elStyles = window.getComputedStyle(el);

    //     return elStyles.getPropertyValue(prop);
    // }

    // Convert CSS unit to a number
    // function cssUnitToNo(unit) {
    //     let sliceEnd = -2;

    //     if (unit.indexOf("rem") > -1) {
    //         sliceEnd = -3;
    //     }

    //     return Number(unit.slice(0, sliceEnd));
    // }

    // Check if stylesheet has been loaded
    // function cssLoaded() {
    //     return cssValue(body, "display") === "flex";
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

        debugMode.init();

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
        console.log("In debugMode.init().");

        if (!debugMode.isSet) {
            console.log("Exiting function - site is not in development mode!");

            return;
        }

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

        main.setVhProp();

        window.addEventListener("resize", debounce(function() {
            main.setVhProp();
        }, 25));
    };

    main.el = document.querySelector("main");

    main.setVhProp = function() {
        console.log("In main.setVhProp().");

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
            console.log("Exiting function - TypeIt element not found!");

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

        wpcf7.els.forEach((wpcf7El) => {
            const wpcf7Form = wpcf7El.querySelector(".wpcf7-form");

            wpcf7.captcha.init(wpcf7Form);

            wpcf7.cleanHtml(wpcf7Form);

            wpcf7.enableForm(wpcf7Form);

            wpcf7El.addEventListener("wpcf7invalid", function(e) {
                //
                // TODO:
                // Behouden of verwijderen?
                // Indien behouden:
                //  Veroorzaakt scrolling bug op de x-as van de website bij een erroreous form submit.
                //  Pagina scrollt naar rechts de overflow in.
                //
                // wpcf7.invalidInputScroller(e);
            });

            const submitButton = wpcf7Form.querySelector("[type='submit']");
                //   submitButtonText = submitButton.querySelector(".btn__text");

            wpcf7El.addEventListener("wpcf7beforesubmit", function(e) {
                // if (!submitButton.hasAttribute("data-string-send")) {
                //     submitButton.setAttribute(
                //         "data-string-send",
                //         submitButtonText.textContent
                //     );
                // }
                submitButton.setAttribute("disabled", true);
                submitButton.classList.add("is-submitting");

                // submitButtonText.textContent =
                //     submitButton.getAttribute("data-string-sending");
            });

            wpcf7El.addEventListener("wpcf7submit", function(e) {
                // const formStatus = e.detail.status;
                // console.log(formStatus);

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

                // submitButtonText.textContent =
                //     submitButton.getAttribute("data-string-send");
            });

            // Its <input>s
            const inputs = wpcf7Form.querySelectorAll(".wpcf7-form-control");

            //
            // TODO: split deze functie af
            //
            inputs.forEach((input) => {
                //
                // TODO: check element properties (minlength, maxlength, pattern)
                //
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

    wpcf7.captcha = {
        uid: null,

        els: {
            wrapper: null,
            field: null,
            label: null,
            input: null
        },

        problem: null,

        problemMakerId: null,

        init: function(wpcf7Form) {
            console.log("In wpcf7.captcha.init().");

            const submitButton = wpcf7Form.querySelector(".wpcf7-submit");

            if (!submitButton) {
                console.log("Exiting function - no WPCF7 submit button found!");

                return;
            }

            wpcf7.captcha.makeEls(wpcf7Form);
        },

        elObjArr: function() {
            const array = [
                {
                    el: "div",
                    role: "field",
                    attrs: {
                        id: `field-maths-captcha-${wpcf7.captcha.uid}`,
                        class: `field field--inline`
                    }
                },
                {
                    el: "label",
                    role: "label",
                    attrs: {
                        id: `label-maths-captcha-${wpcf7.captcha.uid}`,
                        for: `input-maths-captcha-${wpcf7.captcha.uid}`
                    }
                },
                {
                    el: "input",
                    role: "input",
                    attrs: {
                        id: `input-maths-captcha-${wpcf7.captcha.uid}`,
                        type: "text",
                        name: `input-maths-captcha-${wpcf7.captcha.uid}`,
                        inputmode: "numeric",
                        ariaRequired: "true"
                    }
                }
            ];

            return array;
        },

        makeUid: function() {
            wpcf7.captcha.uid = randIntUnder(1000);
        },

        makeEls: function(wpcf7Form) {
            console.log("In wpcf7.captcha.makeEls().");

            for (const [role, el] of Object.entries(wpcf7.captcha.els)) {
                if (role === "wrapper")
                    continue;

                if (el) {
                    el.remove();
                }
            }

            wpcf7.captcha.makeUid();

            const elObjArr = wpcf7.captcha.elObjArr();

            const submitButton  = wpcf7Form.querySelector(".wpcf7-submit"),
                  submitWrapper = submitButton.parentElement,
                  fieldset      = submitWrapper.parentElement;

            elObjArr.forEach((elObj) => {
                const el = createEl(elObj.el, elObj.attrs);

                wpcf7.captcha.els[elObj.role] = el;

                if (elObj.role === "field") {
                    fieldset.insertBefore(el, submitWrapper);
                } else {
                    if (elObj.role === "input") {
                        el.addEventListener("input", () => {
                            wpcf7.captcha.validateAnswer(wpcf7Form);
                        });
                    }

                    wpcf7.captcha.els.field.append(el);
                }
            });

            wpcf7.captcha.els.wrapper = wpcf7.captcha.els.field.parentElement;

            wpcf7.captcha.observeEl(wpcf7Form, fieldset);

            wpcf7.captcha.makeProblem(wpcf7Form);
        },

        makeProblem: function(wpcf7Form, i) {
            console.log("In wpcf7.captcha.makeProblem().");

            console.log(i);

            if (typeof i === "undefined") {
                i = 0;
            }

            console.log(i);

            if (i === 0) {
                console.log("i is 0!");

                // Show spinner
                //  > position: absolute over over problem
                //  > aria-label="Loading..."

                // const spinnerEl = createEl("span", {
                //     id: `spinner-maths-captcha-${wpcf7.captcha.uid}`,
                //     class: "spinner"
                // });

                // wpcf7.captcha.els.field.append(spinnerEl);
            }

            const labelEl = wpcf7Form.querySelector(`#label-maths-captcha-${wpcf7.captcha.uid}`);

            const digit1 = randIntUnder(10),
                  digit2 = randIntUnder(10);

            wpcf7.captcha.problem = [digit1, digit2];

            labelEl.textContent = `${digit1} + ${digit2} =`;

            wpcf7.captcha.validateAnswer(wpcf7Form);

            const iterationCutoff = 30;
            let timeout;

            if (i < iterationCutoff) {
                timeout = 100;
            } else {
                if (i === iterationCutoff) {
                    // Hide spinner
                }

                timeout = debugMode.isSet ? 2500 : 15000;
            }

            i++;

            wpcf7.captcha.problemMakerId = setTimeout(() => {
                wpcf7.captcha.makeProblem(wpcf7Form, i);
            }, timeout);
        },

        observeEl: function(wpcf7Form, el) {
            console.log("In wpcf7.captcha.observeEl().");

            const moCallback = function(mutationRecords) {
                const record = mutationRecords[0];

                const targetIsCaptcha = record.target === wpcf7.captcha.els.wrapper,
                      targetIsField   = record.target === wpcf7.captcha.els.field,
                      targetIsLabel   = record.target === wpcf7.captcha.els.label,
                      targetIsInput   = record.target === wpcf7.captcha.els.input;

                if (
                    targetIsCaptcha && record.removedNodes.length > 0 && record.removedNodes[0] === wpcf7.captcha.els.field ||
                    targetIsField ||
                    targetIsLabel && record.type !== "childList" ||
                    targetIsInput
                ) {
                    console.log("CAPTCHA has been tampered with!");

                    wpcf7.captcha.regenerate(wpcf7Form, mo);
                } else if (targetIsLabel) {
                    console.log("CAPTCHA <label> has been mutated.");

                    return;
                }
            };

            const mo = new MutationObserver(moCallback);

            const moOptions = {
                subtree: true,
                childList: true,
                attributes: true
            };

            mo.observe(el, moOptions);
        },

        regenerate: function(wpcf7Form, captchaMo) {
            const submitButton = wpcf7Form.querySelector(".wpcf7-submit");

            wpcf7.disableSubmitButton(submitButton);

            clearTimeout(wpcf7.captcha.problemMakerId);

            captchaMo.disconnect();

            wpcf7.captcha.makeEls(wpcf7Form);
        },

        validateAnswer: function(wpcf7Form) {
            console.log("In wpcf7.captcha.validateAnswer().");

            const userAnswer = Number(wpcf7.captcha.els.input.value);
            const problemAnswer = wpcf7.captcha.problem[0] + wpcf7.captcha.problem[1];

            const validAnswer = userAnswer === problemAnswer;
            console.log(`User's answer is valid: ${validAnswer}`);

            const submitButton = wpcf7Form.querySelector(".wpcf7-submit");

            if (validAnswer) {
                wpcf7.enableSubmitButton(submitButton);
            } else {
                wpcf7.disableSubmitButton(submitButton);
            }
        }
    };

    wpcf7.cleanHtml = function(wpcf7Form) {
        console.log("In wpcf7.cleanHtml().");

        // Disable form send via PHP.
        wpcf7Form.removeAttribute("action");

        const fields = wpcf7Form.querySelectorAll(".field");

        fields.forEach((field) => {
            const br = field.querySelector("br");

            if (br) {
                br.parentNode.removeChild(br);
            }

            const controlWrap = field.querySelector(".wpcf7-form-control-wrap");

            if (controlWrap) {
                const input = controlWrap.querySelector(".wpcf7-form-control");
                const attr  = input.tagName === "TEXTAREA" ? "cols" : "size";

                input.removeAttribute(attr);
            }
        });
    };

    wpcf7.enableForm = function(wpcf7Form) {
        console.log("In wpcf7.enableForm().");

        const disabledFieldsets = wpcf7Form.querySelectorAll("fieldset[disabled]");

        disabledFieldsets.forEach((fieldset) => {
            fieldset.removeAttribute("disabled");
        });

        if (wpcf7.captcha.uid === null) {
            const submitButton = wpcf7Form.querySelector(".wpcf7-submit");

            wpcf7.enableSubmitButton(submitButton);
        }
    };

    wpcf7.disableSubmitButton = function(submitButton) {
        console.log("In wpcf7.disableSubmitButton()");

        submitButton.setAttribute("disabled", "");
        submitButton.setAttribute("type", "button");
    };

    wpcf7.enableSubmitButton = function(submitButton) {
        console.log("In wpcf7.enableSubmitButton()");

        submitButton.setAttribute("type", "submit");
        submitButton.removeAttribute("disabled");
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
