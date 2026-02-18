// TODO: Dit verwerken.
// <?php
// if (!is_null($fetched_data_post_caption)) {
//     $split_caption = preg_split("/\n\n|\r\n\r\n/", $fetched_data_post_caption->edges[0]->node->text);

//     // Main media caption, i.e. just the first line.
//     $processed_caption = htmlspecialchars($split_caption[0]);
//     // Dedicated "Shot on" line of caption stipped of "Camera with flash" emoji & following spaces.
//     $gear = htmlspecialchars(
//         preg_replace("/\x{1F4F8}\x{0020}*/u", "", array_find($split_caption, function ($line) {
//             return preg_match("/^\x{1F4F8}/u", $line);
//         }))
//     );

//     // Hashtags from all dedicated hashtag lines.
//     $hashtags = [];
//     $hashtag_lines = array_filter($split_caption, function ($line) {
//         return str_starts_with($line, "#");
//     });
//     foreach ($hashtag_lines as $line) {
//         array_push($hashtags, ...explode(" ", $line));
//     }
// }

export default function initPhotoDialog(dialog: HTMLDialogElement, triggers: NodeListOf<Element>) {
    // TODO: Cancel enter = dialog close?
    const closeButtonEl = document.querySelector("#photo-dialog-close-button");
    closeButtonEl?.addEventListener("click", () => {
        dialog.close();
    });

    triggers.forEach((trigger) => {
        trigger.setAttribute("href", "#");
        trigger.removeAttribute("target");
        trigger.removeAttribute("rel");

        trigger.setAttribute("role", "button");
        trigger.addEventListener("click", (e) => {
            e.preventDefault();
            dialog.showModal();
        });
    });
}

function showDialog() {}
