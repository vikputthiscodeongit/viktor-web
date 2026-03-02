// TODO: Implement item navigation swipe actions.

import { createEl, fetchWithTimeout } from "@codebundlesbyvik/js-helpers";

interface PostData {
    shortcode: string;
    date: number;
    caption: string | null;
    media: string[];
    media_thumbnails: string[];
}

interface PostsEndpointData {
    fetch_time: number;
    revalidation_time: number;
    posts: PostData[];
}

export default class MediaDialog {
    postsData: PostsEndpointData["posts"];
    currentPostAttrs: { shortcode: string; bigMediaIndex: number };
    dialogEl: HTMLDialogElement;
    dialogInnerEl: HTMLDivElement;
    sectionEl: HTMLDivElement;
    asideEl: HTMLDivElement;
    bigMediaContainerEl: HTMLDivElement;
    bigMediaEl: HTMLDivElement;
    pageIndicatorsContainerEl: HTMLDivElement;
    pageButtonsContainerEl: HTMLDivElement;
    prevPageButtonEl: HTMLDivElement;
    nextPageButtonEl: HTMLDivElement;
    captionContainerEl: HTMLDivElement;
    gearContainerEl: HTMLDivElement;
    hashtagsContainerEl: HTMLDivElement;
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
        this.dialogInnerEl = createEl("div");
        this.sectionEl = createEl("section");
        this.asideEl = createEl("aside");
        this.closeButtonEl = createEl("div", {
            id: "#media-gallery-dialog-close-button",
            textContent: "X",
            ariaLabel: "Back to overview",
        });
        this.bigMediaContainerEl = createEl("div", {
            id: "#media-gallery-dialog-big-media-container",
        });
        this.bigMediaEl = createEl("img", { id: "#media-gallery-dialog-big-media" });
        this.pageIndicatorsContainerEl = createEl("div", {
            id: "#media-gallery-dialog-page-indicators",
        });
        this.pageButtonsContainerEl = createEl("div", { id: "#media-gallery-dialog-page-buttons" });
        this.prevPageButtonEl = createEl("div", {
            id: "#media-gallery-dialog-prev-page-button",
            textContent: "<",
            ariaLabel: "Previous item",
        });
        this.nextPageButtonEl = createEl("div", {
            id: "#media-gallery-dialog-next-page-button",
            textContent: ">",
            artiaLabel: "Next item",
        });
        this.captionContainerEl = createEl("div", { id: "#media-gallery-dialog-caption" });
        this.gearContainerEl = createEl("div", { id: "#media-gallery-dialog-gear" });
        this.hashtagsContainerEl = createEl("div", { id: "#media-gallery-dialog-hashtags" });

        this.bigMediaContainerEl.append(this.bigMediaEl);
        this.sectionEl.append(this.closeButtonEl, this.bigMediaContainerEl);
        this.dialogInnerEl.append(this.sectionEl);
        this.dialogEl.append(this.dialogInnerEl);

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

    setBigMedia(postData: PostData, i: number) {
        const oldBigMediaIndex = this.currentPostAttrs.bigMediaIndex;
        this.currentPostAttrs.bigMediaIndex = i;

        const src =
            MediaDialog.IG_DATA_DIR + "/media/" + postData.shortcode + "/" + postData.media[i];
        const postDateFormatted = new Intl.DateTimeFormat("en-US", {
            dateStyle: "full",
            timeZone: "UTC",
        }).format(new Date(postData.date * 1000));
        const attrs = [
            ["src", src],
            ["alt", `Item ${i + 1} of gallery posted on ${postDateFormatted}`],
        ];
        attrs.forEach((pair) => this.bigMediaEl.setAttribute(pair[0], pair[1]));

        const indicatorEls = this.pageIndicatorsContainerEl.children;
        indicatorEls.item(oldBigMediaIndex)?.classList.remove("dot--highlighted");
        indicatorEls.item(i)?.classList.add("dot--highlighted");
    }

    loadPost(postData: PostData) {
        this.currentPostAttrs = {
            shortcode: postData.shortcode,
            bigMediaIndex: 0,
        };

        if (postData.media.length > 1) {
            const pageIndicatorEls = postData.media.map((item, i) =>
                createEl("span", { class: "dot", textContent: i }),
            );
            this.pageIndicatorsContainerEl.append(...pageIndicatorEls);
            this.sectionEl.append(this.pageIndicatorsContainerEl);
        }

        this.setBigMedia(postData, 0);

        if (postData.media.length > 1) {
            document.body.addEventListener(
                "keydown",
                (e) => {
                    if (!this.dialogEl.open) return;

                    switch (e.key) {
                        case "ArrowLeft":
                            this.setBigMedia(
                                postData,
                                this.currentPostAttrs.bigMediaIndex > 0
                                    ? this.currentPostAttrs.bigMediaIndex - 1
                                    : postData.media.length - 1,
                            );
                            break;

                        case "ArrowRight":
                            this.setBigMedia(
                                postData,
                                this.currentPostAttrs.bigMediaIndex < postData.media.length - 1
                                    ? this.currentPostAttrs.bigMediaIndex + 1
                                    : 0,
                            );
                            break;
                    }
                },
                { signal: this.navAbortController.signal },
            );

            this.prevPageButtonEl.addEventListener(
                "click",
                () =>
                    this.setBigMedia(
                        postData,
                        this.currentPostAttrs.bigMediaIndex > 0
                            ? this.currentPostAttrs.bigMediaIndex - 1
                            : postData.media.length - 1,
                    ),
                { signal: this.navAbortController.signal },
            );
            this.nextPageButtonEl.addEventListener(
                "click",
                () =>
                    this.setBigMedia(
                        postData,
                        this.currentPostAttrs.bigMediaIndex < postData.media.length - 1
                            ? this.currentPostAttrs.bigMediaIndex + 1
                            : 0,
                    ),
                { signal: this.navAbortController.signal },
            );
            this.pageButtonsContainerEl.append(this.prevPageButtonEl, this.nextPageButtonEl);
            this.sectionEl.append(this.pageButtonsContainerEl);
        }

        if (postData.caption && postData.caption.length > 0) {
            const splitCaptionText = postData.caption.split(/\n\n|\r\n\r\n/);

            const mainCaptionEl = createEl("p", {
                textContent: splitCaptionText[0],
            });
            this.captionContainerEl.append(mainCaptionEl);

            this.asideEl.append(this.captionContainerEl);

            const captionGearLineRegEx = /\u{1F4F8}\u{0020}*/u;
            const captionGearLine = splitCaptionText.find((line) =>
                captionGearLineRegEx.exec(line),
            );

            if (captionGearLine) {
                const gearEl = createEl("p", {
                    textContent: captionGearLine.replace(captionGearLineRegEx, ""),
                });
                this.gearContainerEl.append(gearEl);
                this.asideEl.append(this.gearContainerEl);
            }

            const captionHashtagsLine = splitCaptionText.find((line) => line.startsWith("#"));

            if (captionHashtagsLine) {
                const hashtags = captionHashtagsLine.split(" ");
                const hashtagEls: (Node | string)[] = [];
                hashtags.forEach((hashtag, i) => {
                    hashtagEls.push(createEl("span", { textContent: hashtag }));

                    if (i === hashtags.length - 1) return;

                    hashtagEls.push(" ");
                });
                this.hashtagsContainerEl.append(...hashtagEls);
                this.asideEl.append(this.hashtagsContainerEl);
            }

            this.dialogInnerEl.append(this.asideEl);
        }
    }

    unloadPost() {
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

        this.hashtagsContainerEl.remove();
        this.hashtagsContainerEl.innerHTML = "";

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

        this.dialogEl.showModal();
    }

    closeDialog() {
        this.dialogEl.close();
    }
}
