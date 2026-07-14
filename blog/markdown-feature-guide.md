# Markdown Feature Guide

This post demonstrates every Markdown feature currently supported by Cabin's blog renderer.

## Reading text

Paragraphs render with comfortable long-form spacing. You can use **bold text**, *italic text*, and `inline code` inside a sentence.

You can also add links, such as [Cabin's philosophy](../philosophy.html), and ordinary URLs like <https://writecabin.com>.

## Lists

Unordered lists:

- Begin with the manuscript.
- Add structure when needed.
- Keep work local.

Ordered lists:

1. Draft the scene.
2. Review the character note.
3. Return to the page.

## Blockquotes

> The software should disappear, leaving only the story.

## Code blocks

```js
const cabin = {
  mode: "local-first",
  principle: "writing comes first"
};

console.log(cabin.principle);
```

```css
.manuscript {
  max-width: 72ch;
  line-height: 1.8;
}
```

## Tables

| Feature | Supported | Notes |
| --- | --- | --- |
| Headings | Yes | `#`, `##`, `###` and more |
| Code blocks | Yes | Highlighted with highlight.js |
| Images | Yes | Click to open lightbox |
| HTML | Yes | Sanitized before render |

## Horizontal rule

---

## Images with Markdown

![Cabin mountain morning](../assets/cabin-mountain-morning.png)

## Images with HTML

<img src="../assets/cabin-writing-room.png" alt="Cabin writing room atmosphere">

## Raw HTML

<aside>
  <strong>Sanitized HTML block.</strong>
  <p>This is allowed after DOMPurify cleanup.</p>
</aside>
