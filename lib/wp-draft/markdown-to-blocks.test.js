import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  inlineMarkdownToHtml,
  markdownBodyToCoreBlocks,
} from "./markdown-to-blocks.js";

describe("inlineMarkdownToHtml", () => {
  it("converts links and bold", () => {
    const html = inlineMarkdownToHtml(
      "Siehe [KI-SEO](/leistungen/ki-seo/) mit **Fokus**"
    );
    assert.match(html, /<a href="\/leistungen\/ki-seo\/">KI-SEO<\/a>/);
    assert.match(html, /<strong>Fokus<\/strong>/);
  });
});

describe("markdownBodyToCoreBlocks", () => {
  it("drops duplicate H1 and renders headings and lists", () => {
    const body = `# Same Title

Intro line.

## Section

- one
- two
`;
    const blocks = markdownBodyToCoreBlocks(body, { title: "Same Title" });
    assert.doesNotMatch(blocks, /<h1/);
    assert.match(blocks, /wp:paragraph/);
    assert.match(blocks, /wp:heading/);
    assert.match(blocks, /wp:list/);
    assert.match(blocks, /<li>one<\/li>/);
  });

  it("strips HTML comments", () => {
    const blocks = markdownBodyToCoreBlocks(
      "<!-- secret -->\n\nHello",
      {}
    );
    assert.doesNotMatch(blocks, /secret/);
    assert.match(blocks, /Hello/);
  });
});