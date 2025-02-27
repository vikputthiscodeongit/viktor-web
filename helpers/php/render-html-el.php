<?php
require ROOT_DIR . '/vendor/autoload.php';

function renderHtmlEl(string $tag, array|string $attributes = null, array|string $content = null): string
{
    return \Spatie\HtmlElement\HtmlElement::render($tag, $attributes, $content);
}

function renderHtmlFromArray(array $data): string
{
    $html = '';

    if (isset($data['el'])) {
        $attributes = $data['attrs'] ?? [];
        $content = $data['children'] ?? $data['text_content'] ?? '';

        if (is_array($content)) {
            $children_html = '';

            foreach ($content as $child_data) {
                $children_html .= renderHtmlFromArray($child_data);
            }

            $content = $children_html;
        }

        $html = renderHtmlEl($data['el'], $attributes, $content);
    }

    return $html;
}
