import { createEl, fetchWithTimeout } from "@codebundlesbyvik/js-helpers";

interface PostData {
    shortcode: string;
    date: number;
    caption: string | null;
    media: {
        file_name: string;
        width: number | null;
        height: number | null;
    }[];
    media_thumbnails: {
        file_name: string;
        width: number;
        height: number;
    }[];
}

interface PostsEndpointData {
    fetch_time: number;
    revalidation_time: number;
    posts: PostData[];
}

export default class MediaDialog {
    postsData: PostsEndpointData["posts"];
    currentPostAttrs: {
        shortcode: string;
        bigMediaIndex: number;
    };
    dialogEl: HTMLDialogElement;
    dialogInnerEl: HTMLDivElement;
    sectionEl: HTMLDivElement;
    asideEl: HTMLDivElement;
    bigMediaContainerEl: HTMLDivElement;
    bigMediaLoadingEl: HTMLDivElement;
    bigMediaEl: HTMLDivElement;
    pageIndicatorsContainerEl: HTMLDivElement;
    pageButtonsContainerEl: HTMLDivElement;
    prevPageButtonEl: HTMLDivElement;
    nextPageButtonEl: HTMLDivElement;
    captionContainerEl: HTMLDivElement;
    gearContainerEl: HTMLDivElement;
    postDateContainerEl: HTMLDivElement;
    origPostRefContainerEl: HTMLDivElement;
    closeButtonEl: HTMLDivElement;
    navAbortController: AbortController;

    static IG_DATA_DIR = "/public/instagram";

    constructor(dialogEl: HTMLDialogElement, triggerEls: NodeListOf<Element>) {
        this.postsData = [];

        const fn = async () => await this.fetchData();
        fn().catch((error) => console.error(error));

        this.currentPostAttrs = {
            shortcode: "",
            bigMediaIndex: 0,
        };

        this.dialogEl = dialogEl;
        this.dialogInnerEl = createEl("div", { class: "media-dialog__inner" });
        this.sectionEl = createEl("section", { class: "media-dialog__section" });
        this.asideEl = createEl("aside", { class: "media-dialog__aside" });
        this.closeButtonEl = createEl("button", {
            class: "media-dialog__close-button btn btn--sm-below-sm",
            type: "button",
            textContent: "Back to overview",
        });
        this.bigMediaContainerEl = createEl("div", { class: "media-dialog__big-media-container" });
        this.bigMediaLoadingEl = createEl("div", {
            class: "spinner spinner--lg spinner--light",
            role: "presentation",
        });
        this.bigMediaEl = createEl("img", { class: "media-dialog__big-media" });
        this.pageIndicatorsContainerEl = createEl("ul", {
            class: "media-dialog__page-indicators",
        });
        this.pageButtonsContainerEl = createEl("div", { class: "media-dialog__page-buttons" });
        this.prevPageButtonEl = createEl("button", {
            class: "media-dialog__page-button media-dialog__page-button--prev",
            type: "button",
            ariaLabel: "Previous item",
        });
        this.prevPageButtonEl.append(
            createEl("span", {
                textContent: "<",
                ariaHidden: true,
            }),
        );
        this.nextPageButtonEl = createEl("button", {
            class: "media-dialog__page-button media-dialog__page-button--next",
            type: "button",
            ariaLabel: "Next item",
        });
        this.nextPageButtonEl.append(
            createEl("span", {
                textContent: ">",
                ariaHidden: true,
            }),
        );
        this.captionContainerEl = createEl("div", { class: "media-dialog__caption" });
        this.gearContainerEl = createEl("div", { class: "media-dialog__gear" });
        this.postDateContainerEl = createEl("div", { class: "media-dialog__post-date" });
        this.origPostRefContainerEl = createEl("div", {
            class: "media-dialog__original-post-reference",
        });

        this.bigMediaContainerEl.append(this.bigMediaEl);
        this.sectionEl.append(this.bigMediaContainerEl);
        this.dialogInnerEl.append(this.sectionEl);
        this.dialogEl.append(this.closeButtonEl, this.dialogInnerEl);

        this.navAbortController = new AbortController();

        document.body.addEventListener("keydown", (e) => {
            if (!this.dialogEl.open || e.key !== "Escape") return;

            this.closeDialog();
        });
        this.dialogEl.addEventListener("mousedown", (e) => {
            if (e.target !== e.currentTarget) return;

            this.closeDialog();
        });
        this.closeButtonEl.addEventListener("click", () => {
            this.closeDialog();
        });

        triggerEls.forEach((el) => {
            el.setAttribute("href", "#");
            el.removeAttribute("target");
            el.removeAttribute("rel");

            el.setAttribute("role", "button");
            el.addEventListener("click", (e) => {
                e.preventDefault();
                this.openDialog(el);
            });
        });

        this.bigMediaEl.addEventListener("error", () => {
            this.bigMediaLoadingEl.remove();
            this.bigMediaContainerEl.classList.remove("overlay", "overlay--light");
        });
        this.bigMediaEl.addEventListener("load", () => {
            this.bigMediaLoadingEl.remove();
            this.bigMediaContainerEl.classList.remove("overlay", "overlay--light");
        });
    }

    async fetchData() {
        const response = await fetchWithTimeout(MediaDialog.IG_DATA_DIR + "/posts.json");

        if (!response.ok) return;

        const data = (await response.json()) as unknown;
        const isValidData = (data: unknown): data is PostsEndpointData =>
            typeof data === "object" &&
            data !== null &&
            "posts" in data &&
            typeof data.posts === "object" &&
            data.posts !== null;

        if (!isValidData(data)) return;

        this.postsData = data.posts;
    }

    getPrevPostMedia(postData: PostData) {
        return this.currentPostAttrs.bigMediaIndex > 0
            ? this.currentPostAttrs.bigMediaIndex - 1
            : postData.media.length - 1;
    }

    getNextPostMedia(postData: PostData) {
        return this.currentPostAttrs.bigMediaIndex < postData.media.length - 1
            ? this.currentPostAttrs.bigMediaIndex + 1
            : 0;
    }

    setBigMedia(postData: PostData, i: number) {
        const oldBigMediaIndex = this.currentPostAttrs.bigMediaIndex;
        this.currentPostAttrs.bigMediaIndex = i;

        this.bigMediaContainerEl.setAttribute("ariaBusy", "true");
        this.bigMediaContainerEl.classList.add("overlay", "overlay--light");
        this.bigMediaContainerEl.append(this.bigMediaLoadingEl);

        for (const attr of Object.values(this.bigMediaEl.attributes)) {
            if (attr.name !== "width" && attr.name !== "height") continue;

            this.bigMediaEl.removeAttribute(attr.name);
        }

        const src =
            MediaDialog.IG_DATA_DIR +
            "/media/" +
            postData.shortcode +
            "/" +
            postData.media[i].file_name;
        const postDateFormatted = new Intl.DateTimeFormat("en-US", {
            dateStyle: "full",
        }).format(new Date(postData.date * 1000));
        const attrs = [
            ["src", src],
            ["alt", `Item ${i + 1} of gallery posted on ${postDateFormatted}`],
        ];
        if (postData.media[i].width !== null && postData.media[i].height !== null) {
            attrs.push(
                ["width", postData.media[i].width.toString()],
                ["height", postData.media[i].height.toString()],
            );
        }
        attrs.forEach((pair) => this.bigMediaEl.setAttribute(pair[0], pair[1]));

        const indicatorEls = this.pageIndicatorsContainerEl.children;
        indicatorEls.item(oldBigMediaIndex)?.children.item(0)?.removeAttribute("aria-current");
        indicatorEls.item(i)?.children.item(0)?.setAttribute("aria-current", "true");

        this.bigMediaContainerEl.removeAttribute("ariaBusy");
    }

    addPageIndicatorEls(postData: PostData) {
        const pageIndicatorEls = postData.media.map((item, i) => {
            const itemEl = createEl("li", { class: "media-dialog__page-indicator" });
            const itemLinkEl = createEl("button", {
                class: "media-dialog__page-indicator-button",
                type: "button",
                dataPostMediaIndex: i,
                ariaLabel: `Item ${i + 1}`,
            });
            itemLinkEl.addEventListener(
                "click",
                (e) => {
                    const targetPostIndex = (e.target as HTMLElement | null)?.getAttribute(
                        "data-post-media-index",
                    );
                    if (!targetPostIndex) return;
                    this.setBigMedia(postData, Number.parseInt(targetPostIndex));
                },
                {
                    signal: this.navAbortController.signal,
                },
            );
            itemEl.append(itemLinkEl);

            return itemEl;
        });
        this.pageIndicatorsContainerEl.append(...pageIndicatorEls);
        this.sectionEl.append(this.pageIndicatorsContainerEl);
    }

    addPageButtonEls(postData: PostData) {
        this.prevPageButtonEl.addEventListener(
            "click",
            () => this.setBigMedia(postData, this.getPrevPostMedia(postData)),
            { signal: this.navAbortController.signal },
        );
        this.nextPageButtonEl.addEventListener(
            "click",
            () => this.setBigMedia(postData, this.getNextPostMedia(postData)),
            { signal: this.navAbortController.signal },
        );
        this.pageButtonsContainerEl.append(this.prevPageButtonEl, this.nextPageButtonEl);
        this.bigMediaContainerEl.append(this.pageButtonsContainerEl);
    }

    addNavKeyboardEventHandlers(postData: PostData) {
        document.body.addEventListener(
            "keydown",
            (e) => {
                if (!this.dialogEl.open) return;

                switch (e.key) {
                    case "ArrowLeft":
                        this.prevPageButtonEl.focus();
                        this.setBigMedia(postData, this.getPrevPostMedia(postData));
                        break;

                    case "ArrowRight":
                        this.nextPageButtonEl.focus();
                        this.setBigMedia(postData, this.getNextPostMedia(postData));
                        break;
                }
            },
            { signal: this.navAbortController.signal },
        );
    }

    addCaptionEls(postData: PostData) {
        const postDataCaption = postData.caption;

        if (postDataCaption) {
            const splitCaptionText = postDataCaption.split(/\n\n|\r\n\r\n/);

            this.captionContainerEl.append(createEl("p", { textContent: splitCaptionText[0] }));
            this.asideEl.append(this.captionContainerEl);

            const captionGearLineRegEx = /\u{1F4F8}\u{0020}*/u;
            const captionGearLine = splitCaptionText.find((line) =>
                captionGearLineRegEx.exec(line),
            );

            if (captionGearLine) {
                this.gearContainerEl.append(
                    createEl("p", {
                        textContent:
                            "Shot on: " + captionGearLine.replace(captionGearLineRegEx, ""),
                    }),
                );
                this.asideEl.append(this.gearContainerEl);
            }
        }

        const timeEl = createEl("time", {
            textContent: new Intl.DateTimeFormat("en-US", {
                dateStyle: "full",
            }).format(new Date(postData.date * 1000)),
        });
        const postDateEl = createEl("p", { textContent: "Post date: " });
        postDateEl.append(timeEl);
        this.postDateContainerEl.append(postDateEl);

        this.origPostRefContainerEl.append(
            createEl("a", {
                href: `https://www.instagram.com/p/${postData.shortcode}/`,
                target: "_blank",
                rel: "noopener",
                textContent: "View on Instagram",
            }),
        );

        this.asideEl.append(this.postDateContainerEl, this.origPostRefContainerEl);
        this.dialogInnerEl.append(this.asideEl);
    }

    loadPost(postData: PostData) {
        this.currentPostAttrs = {
            shortcode: postData.shortcode,
            bigMediaIndex: 0,
        };

        if (postData.media.length > 1) {
            this.addPageIndicatorEls(postData);
            this.addPageButtonEls(postData);
            this.addNavKeyboardEventHandlers(postData);
        }

        this.addCaptionEls(postData);
        this.setBigMedia(postData, 0);
    }

    unloadPost() {
        // Scroll to top of media.

        this.bigMediaLoadingEl.remove();

        for (const attr of Object.values(this.bigMediaEl.attributes)) {
            if (attr.name === "class") continue;

            this.bigMediaEl.removeAttribute(attr.name);
        }

        this.pageIndicatorsContainerEl.remove();
        this.pageIndicatorsContainerEl.innerHTML = "";

        this.navAbortController.abort();
        this.navAbortController = new AbortController();
        this.pageButtonsContainerEl.remove();
        this.prevPageButtonEl.remove();
        this.nextPageButtonEl.remove();

        this.captionContainerEl.remove();
        this.captionContainerEl.innerHTML = "";

        this.gearContainerEl.remove();
        this.gearContainerEl.innerHTML = "";

        this.postDateContainerEl.remove();
        this.postDateContainerEl.innerHTML = "";

        this.origPostRefContainerEl.remove();
        this.origPostRefContainerEl.innerHTML = "";

        this.currentPostAttrs = {
            shortcode: "",
            bigMediaIndex: 0,
        };
    }

    openDialog(triggerEl: Element) {
        const shortcode = triggerEl.getAttribute("data-post-shortcode");

        if (!shortcode || shortcode.length < 11) return;

        const postData = this.postsData.filter((data) => data.shortcode === shortcode)[0];

        if (!postData) return;

        if (postData.shortcode !== this.currentPostAttrs.shortcode) {
            this.unloadPost();
            this.loadPost(postData);
        }

        document.body.classList.add("has-dialog");
        this.dialogEl.showModal();
    }

    closeDialog() {
        this.dialogEl.close();
        document.body.classList.remove("has-dialog");
    }
}
