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
            const wpcf7FormEl = wpcf7El.querySelector(".wpcf7-form");

            wpcf7.mc.init(wpcf7FormEl);

            wpcf7.input.init(wpcf7FormEl);

            wpcf7.form.cleanHtml(wpcf7FormEl);

            wpcf7.form.enable(wpcf7FormEl);

            wpcf7El.addEventListener("wpcf7invalid", function(e) {
                //
                // TODO:
                // Behouden of verwijderen?
                // Indien behouden:
                //  Veroorzaakt scrolling bug op de x-as van de website bij een erroreous form submit.
                //  Pagina scrollt naar rechts de overflow in.
                //
                // wpcf7.input.scrollToInvalid(e);
            });

            // const submitButton = wpcf7FormEl.querySelector("[type='submit']");
                //   submitButtonText = submitButton.querySelector(".btn__text");

            wpcf7El.addEventListener("wpcf7beforesubmit", function(e) {
                console.log(e);

                // if (!submitButton.hasAttribute("data-string-send")) {
                //     submitButton.setAttribute(
                //         "data-string-send",
                //         submitButtonText.textContent
                //     );
                // }

                // submitButton.setAttribute("disabled", true);
                // submitButton.classList.add("is-submitting");

                // submitButtonText.textContent =
                //     submitButton.getAttribute("data-string-sending");
            });

            wpcf7El.addEventListener("wpcf7submit", function(e) {
                console.log(e);

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

                // submitButton.removeAttribute("disabled");
                // submitButton.classList.remove("is-submitting");

                // submitButtonText.textContent =
                //     submitButton.getAttribute("data-string-send");
            });

            wpcf7El.addEventListener("wpcf7beforesubmit", function(e) {
                wpcf7.submit.prepare(wpcf7FormEl);
            });

            wpcf7El.addEventListener("wpcf7submit", function(e) {
                wpcf7.submit.finish(wpcf7FormEl);
            });


            // // Its <input>s
            // const inputs = wpcf7FormEl.querySelectorAll(".wpcf7-form-control");

            // //
            // // TODO: split deze functie af
            // //
            // inputs.forEach((input) => {
            //     //
            //     // TODO: check element properties (minlength, maxlength, pattern)
            //     //
            //     if (
            //         input.classList.contains("wpcf7-validates-as-required") &&
            //         // input.value isn't necessarily always empty on form initialization,
            //         // Firefox for example retains <input> values when a page is refreshed.
            //         input.value === ""
            //     ) {
            //         wpcf7.input.setState.invalid(input);
            //     }

            //     input.addEventListener("input", function() {
            //         // Noty.closeAll();

            //         wpcf7.input.validate(input);
            //     });
            // });
        });
    };

    wpcf7.els = document.querySelectorAll(".wpcf7");

    wpcf7.mc = {
        init: function(wpcf7FormEl) {
            console.log("In wpcf7.mc.init().");

            if (!wpcf7FormEl.classList.contains("has-wpcf7mc")) {
                console.log("Exiting function - wpcf7mc has not been added to this form!");

                return;
            }

            wpcf7.mc.id = randIntUnder(1000);

            wpcf7.mc.generate(wpcf7FormEl);

            wpcf7FormEl.addEventListener("submit", function(e) {
                wpcf7.submit.do(e);
            }, true);
        },

        id: null,

        els: {
            nodes: {
                field: null,
                label: null,
                inputWrapper: null,
                input: null,
                loader: null
            },

            objArr: function() {
                const array = [
                    {
                        el: "div",
                        role: "field",
                        attrs: {
                            id: "wpcf7mc-field",
                            class: "field field--inline"
                        }
                    },
                    {
                        el: "label",
                        role: "label",
                        attrs: {
                            id: "wpcf7mc-label",
                            for: "wpcf7mc-input"
                        }
                    },
                    {
                        el: "span",
                        role: "inputWrapper",
                        attrs: {
                            class: "wpcf7-form-control-wrap wpcf7mc_answer"
                        }
                    },
                    {
                        el: "input",
                        role: "input",
                        attrs: {
                            id: "wpcf7mc-input",
                            type: "text",
                            name: "wpcf7mc-input",
                            class: "wpcf7-form-control",
                            inputmode: "numeric",
                            ariaRequired: "true"
                        }
                    },
                    {
                        el: "span",
                        role: "loader",
                        attrs: {
                            id: "wpcf7mc-loader",
                            class: "spinner",
                            ariaBusy: "true",
                            ariaLive: "polite"
                        }
                    }
                ];

                return array;
            },

            generate: function(wpcf7FormEl) {
                console.log("In wpcf7.mc.els.generate().");

                wpcf7.mc.els.remove();

                wpcf7.submit.els.assignVars(wpcf7FormEl);

                const elObjArr = wpcf7.mc.els.objArr();

                elObjArr.forEach((elObj) => {
                    const el = createEl(elObj.el, elObj.attrs);

                    wpcf7.mc.els.nodes[elObj.role] = el;

                    if (elObj.role === "field") {
                        const sbFieldsetEl = wpcf7.submit.els.nodes.fieldset,
                              sbFieldEl    = wpcf7.submit.els.nodes.field;

                        sbFieldsetEl.insertBefore(el, sbFieldEl);
                    } else {
                        if (elObj.role === "input") {
                            wpcf7.mc.els.nodes.inputWrapper.append(el);

                            el.addEventListener("input", () => {
                                wpcf7.mc.validate();
                            });
                        } else {
                            wpcf7.mc.els.nodes.field.append(el);
                        }
                    }
                });

                wpcf7.mc.els.observe.do(wpcf7FormEl);
            },

            remove: function() {
                console.log("In wpcf7.mc.els.remove().");

                for (const [role, el] of Object.entries(wpcf7.mc.els.nodes)) {
                    if (role === "wrapper")
                        continue;

                    if (el) {
                        el.remove();
                    }
                }
            },

            observe: {
                id: null,

                do: function(wpcf7FormEl) {
                    console.log("In wpcf7.mc.els.observe.do().");

                    const fieldsetEl     = wpcf7.submit.els.nodes.fieldset,
                          fieldEl        = wpcf7.mc.els.nodes.field,
                          inputWrapperEl = wpcf7.mc.els.nodes.inputWrapper,
                          inputEl        = wpcf7.mc.els.nodes.input;

                    const callback = function(mutationRecords) {
                        mutationRecords.forEach((record) => {
                            if (
                                record.removedNodes.length > 0 &&
                                (record.removedNodes[0] === fieldEl ||
                                 record.removedNodes[0] === inputWrapperEl ||
                                 record.removedNodes[0] === inputEl)
                            ) {
                                console.log("CAPTCHA .field or <input> has been removed!");

                                wpcf7.mc.regenerate(wpcf7FormEl);
                            }
                        });
                    };

                    const options = {
                        subtree: true,
                        childList: true
                    };

                    wpcf7.mc.els.observe.id = new MutationObserver(callback);

                    wpcf7.mc.els.observe.id.observe(fieldsetEl, options);
                }
            }
        },

        problem: {
            id: null,

            digits: null,

            generate: function() {
                console.log("In wpcf7.mc.problem.generate().");

                const digit1 = randIntUnder(10),
                      digit2 = randIntUnder(10);

                wpcf7.mc.problem.digits = [digit1, digit2];
            },

            insert: function(wpcf7FormEl, i) {
                console.log("In wpcf7.mc.problem.insert().");

                if (i === 0) {
                    wpcf7.mc.els.nodes.field.setAttribute("data-wpcf7mc-generating", "");
                }

                const digit1 = wpcf7.mc.problem.digits[0],
                      digit2 = wpcf7.mc.problem.digits[1];

                wpcf7.mc.els.nodes.label.textContent = `${digit1} + ${digit2} =`;

                wpcf7.mc.validate();

                wpcf7.mc.problem.scheduleNext(wpcf7FormEl, i);
            },

            scheduleNext: function(wpcf7FormEl, i) {
                console.log("In wpcf7.mc.problem.scheduleNext().");

                const problemCutoff = 17;
                let timeout;

                if (i < problemCutoff) {
                    timeout = 167;
                } else {
                    if (i === problemCutoff) {
                        wpcf7.mc.els.nodes.field.removeAttribute("data-wpcf7mc-generating");

                        wpcf7.mc.els.nodes.loader.remove();
                    }

                    timeout = debugMode.isSet ? 3000 : 15000;
                }

                i++;

                wpcf7.mc.problem.id = setTimeout(() => {
                    wpcf7.mc.generate(wpcf7FormEl, i);
                }, timeout);
            }
        },

        generate: function(wpcf7FormEl, i) {
            console.log("In wpcf7.mc.generate().");

            if (typeof i === "undefined") {
                i = 0;
            }

            console.log(i);

            wpcf7.mc.problem.generate();

            if (i === 0) {
                wpcf7.mc.els.generate(wpcf7FormEl);
            }

            wpcf7.mc.problem.insert(wpcf7FormEl, i);
        },

        regenerate: function(wpcf7FormEl) {
            console.log("In wpcf7.mc.regenerate().");

            clearTimeout(wpcf7.mc.problem.id);

            wpcf7.mc.els.observe.id.disconnect();

            wpcf7.mc.generate(wpcf7FormEl);
        },

        validate: function() {
            console.log("In wpcf7.mc.validate().");

            const userInput = Number(wpcf7.mc.els.nodes.input.value);
            const answer = wpcf7.mc.problem.digits[0] + wpcf7.mc.problem.digits[1];

            const answerValid = userInput === answer;
            console.log(`User's answer is valid: ${answerValid}`);

            if (answerValid) {
                wpcf7.input.setState.valid(wpcf7.mc.els.nodes.input);
            } else {
                wpcf7.input.setState.invalid(wpcf7.mc.els.nodes.input);
            }

            return answerValid;
        }
    };

    wpcf7.form = {
        cleanHtml: function(wpcf7FormEl) {
            console.log("In wpcf7.form.cleanHtml().");

            const fields = wpcf7FormEl.querySelectorAll(".field");

            fields.forEach((field) => {
                const controlWrap = field.querySelector(".wpcf7-form-control-wrap");

                if (controlWrap) {
                    const input = controlWrap.querySelector(".wpcf7-form-control");
                    const attr  = input.tagName === "TEXTAREA" ? "cols" : "size";

                    input.removeAttribute(attr);
                }
            });
        },

        enable: function(wpcf7FormEl) {
            console.log("In wpcf7.form.enable().");

            const disabledFieldsets = wpcf7FormEl.querySelectorAll("fieldset[disabled]");

            disabledFieldsets.forEach((fieldset) => {
                fieldset.removeAttribute("disabled");
            });
        }
    };

    wpcf7.input = {
        init: function(wpcf7FormEl) {
            const inputEls = wpcf7FormEl.querySelectorAll("[type='email'], [type='text'], textarea");

            inputEls.forEach((inputEl) => {
                wpcf7.input.validate(inputEl);

                inputEl.addEventListener("input", function() {
                    wpcf7.input.setState.entered(inputEl);
                }, { once: true });

                inputEl.addEventListener("input", function() {
                    wpcf7.input.validate(inputEl);
                });
            });
        },

        setState: {
            entered: function(inputEl) {
                console.log("In wpcf7.input.setState.entered().");

                if (!inputEl.hasAttribute("data-had-input")) {
                    inputEl.setAttribute("data-had-input", true);
                }
            },

            invalid: function(inputEl) {
                console.log("In wpcf7.input.setState.invalid().");

                inputEl.setAttribute("aria-invalid", true);
            },

            valid: function(inputEl) {
                console.log("In wpcf7.input.setState.valid().");

                inputEl.setAttribute("aria-invalid", false);

                if (!inputEl.hasAttribute("data-input-was-valid")) {
                    if (inputEl.hasAttribute("data-had-input")) {
                        inputEl.setAttribute("data-input-was-valid", true);
                    }
                }
            }
        },

        scrollToInvalid: function(e) {
            console.log("In wpcf7.input.scrollToInvalid().");

            const invalidInputs     = e.detail.apiResponse.invalid_fields,
                  firstInvalidInput = document.getElementById(invalidInputs[0].idref);

            if (firstInvalidInput) {
                firstInvalidInput.scrollIntoView({
                    behavior: motionAllowed() ? "smooth" : "auto",
                    block: "start",
                    inline: "start"
                });
            }
        },

        validate: function(inputEl) {
            console.log("In wpcf7.input.validate().");
            console.log(inputEl.value);

            if (inputEl.id === "wpcf7mc-input") {
                console.log("Exiting function - this <input> belongs to the maths CAPTCHA, so I'm not running the regular validation function.");

                return;
            }

            const typeAttr = inputEl.getAttribute("type");

            if (typeAttr === "email" && !isValidEmail(inputEl.value)) {
                wpcf7.input.setState.invalid(inputEl);

                return;
            }

            const minAttr = inputEl.getAttribute("minlength"),
                  maxAttr = inputEl.getAttribute("maxlength");
            const min = Number(minAttr),
                  max = Number(maxAttr);

            if (
                minAttr !== null && inputEl.value.length < min ||
                maxAttr !== null && inputEl.value.length > max
            ) {
                wpcf7.input.setState.invalid(inputEl);
            } else {
                wpcf7.input.setState.valid(inputEl);
            }
        }
    };

    wpcf7.submit = {
        els: {
            nodes: {
                fieldset: null,
                field: null,
                button: null
            },

            assignVars: function(wpcf7FormEl) {
                console.log("In wpcf7.submit.els.assignVars().");

                const buttonEl = wpcf7FormEl.querySelector(".wpcf7-submit");

                if (!buttonEl) {
                    console.log("Exiting function - no submit button found within this form!");

                    return;
                }

                // Werk met .closest?
                const fieldEl    = buttonEl.parentElement,
                      fieldsetEl = fieldEl.parentElement;

                if (fieldsetEl.tagName !== "FIELDSET") {
                    console.log("Exiting function - submit button's field must be wrapped in a <fieldset>.");

                    return;
                }

                wpcf7.submit.els.nodes.button   = buttonEl;
                wpcf7.submit.els.nodes.field    = fieldEl;
                wpcf7.submit.els.nodes.fieldset = fieldsetEl;
            }
        },

        do: function(e) {
            console.log("In wpcf7.submit.do().");
            console.log(e);

            e.preventDefault();
            e.stopImmediatePropagation();

            if (wpcf7.mc.id !== null && !wpcf7.mc.validate()) {
                console.log("Preventing form submission - answer is invalid!");

                return;
            }

            window.wpcf7.submit(e.target);
        },

        finish: function(wpcf7FormEl) {
            console.log("In wpcf7.submit.finish().");

            const inputEls = wpcf7FormEl.querySelectorAll("[type='email'], [type='text'], textarea");

            setTimeout(() => {
                inputEls.forEach((inputEl) => {
                    inputEl.removeAttribute("data-input-was-valid");
                    inputEl.removeAttribute("data-had-input");

                    wpcf7.input.validate(inputEl);

                    inputEl.removeAttribute("disabled");
                });

                wpcf7.submit.els.nodes.button.removeAttribute("disabled");
            }, 2000);
        },

        prepare: function(wpcf7FormEl) {
            console.log("In wpcf7.submit.prepare().");

            wpcf7.submit.els.nodes.button.setAttribute("disabled", "");

            const inputEls = wpcf7FormEl.querySelectorAll("[type='email'], [type='text'], textarea");

            inputEls.forEach((inputEl) => {
                inputEl.setAttribute("disabled", "");
            });
        }
    };
}());
