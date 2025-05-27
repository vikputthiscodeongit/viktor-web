<?php
require_once ROOT_DIR . '/vendor/autoload.php';

function renderHtmlEl(string $tag, array|string|null $attributes, array|string|null $content): string
{
    return \Spatie\HtmlElement\HtmlElement::render($tag, $attributes, $content);
}

function renderHtmlFromArray(array $data): string
{
    $html = '';

    if (isset($data['el'])) {
        $attributes = $data['attrs'] ?? [];
        $content = $data['children'] ?? $data['text'] ?? '';

        if ($content !== "") {
            $attributes = array_filter($attributes, function ($attr) {
                return $attr !== "text";
            }, ARRAY_FILTER_USE_KEY);
        }

        if (is_array($content)) {
            $children_html = '';

            foreach ($content as $child_data) {
                $children_html .= renderHtmlFromArray($child_data);
            }

            $content = $children_html;
        }

        $html = renderHtmlEl($data['el'], $attributes ?? null, $content ?? null);
    }

    return $html;
}
