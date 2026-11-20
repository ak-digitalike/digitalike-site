/**
 * Convert a subset of Markdown to WordPress core block markup.
 */

/**
 * @param {string} text
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * @param {string} text
 */
export function inlineMarkdownToHtml(text) {
  const linkPlaceholders = [];
  let working = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label, href) => {
      const key = `@@LINK${linkPlaceholders.length}@@`;
      linkPlaceholders.push(
        `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`
      );
      return key;
    }
  );

  working = escapeHtml(working);
  working = working.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  working = working.replace(
    /@@LINK(\d+)@@/g,
    (_match, index) => linkPlaceholders[Number(index)]
  );

  return working;
}

/**
 * @param {string} body
 */
function stripHtmlComments(body) {
  return body.replace(/<!--[\s\S]*?-->/g, "").trim();
}

/**
 * @param {string} a
 * @param {string} b
 */
function titlesMatch(a, b) {
  const norm = (s) =>
    s
      .replace(/^#+\s*/, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  return norm(a) === norm(b);
}

/**
 * @param {string[]} lines
 */
function flushList(lines, ordered) {
  const tag = ordered ? "ol" : "ul";
  const items = lines
    .map((line) => `<li>${inlineMarkdownToHtml(line)}</li>`)
    .join("");
  return `<!-- wp:list -->
<${tag} class="wp-block-list">${items}</${tag}>
<!-- /wp:list -->`;
}

function paragraphBlock(html) {
  return `<!-- wp:paragraph -->
<p>${html}</p>
<!-- /wp:paragraph -->`;
}

function headingBlock(level, text) {
  return `<!-- wp:heading {"level":${level}} -->
<h${level} class="wp-block-heading">${inlineMarkdownToHtml(text)}</h${level}>
<!-- /wp:heading -->`;
}

/**
 * @param {string} markdownBody
 * @param {Object} options
 * @param {string} [options.title] frontmatter title for H1 dedupe
 * @param {string} [options.h1] optional h1 field
 */
export function markdownBodyToCoreBlocks(markdownBody, options = {}) {
  let body = stripHtmlComments(markdownBody);
  const lines = body.split(/\r?\n/);

  let start = 0;
  if (lines[start]?.match(/^#\s+/)) {
    const h1Text = lines[start].replace(/^#\s+/, "").trim();
    const dedupeTitle = options.h1 || options.title;
    if (dedupeTitle && titlesMatch(h1Text, dedupeTitle)) {
      start += 1;
      while (lines[start] === "") start += 1;
    }
  }

  /** @type {string[]} */
  const blocks = [];
  /** @type {string[]} */
  let listBuffer = [];
  let listOrdered = false;

  const flushListBuffer = () => {
    if (listBuffer.length === 0) return;
    blocks.push(flushList(listBuffer, listOrdered));
    listBuffer = [];
    listOrdered = false;
  };

  for (let i = start; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === "") {
      flushListBuffer();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushListBuffer();
      blocks.push(headingBlock(heading[1].length, heading[2].trim()));
      continue;
    }

    const ul = line.match(/^-\s+(.+)$/);
    if (ul) {
      if (listBuffer.length > 0 && listOrdered) flushListBuffer();
      listOrdered = false;
      listBuffer.push(ul[1].trim());
      continue;
    }

    const ol = line.match(/^\d+\.\s+(.+)$/);
    if (ol) {
      if (listBuffer.length > 0 && !listOrdered) flushListBuffer();
      listOrdered = true;
      listBuffer.push(ol[1].trim());
      continue;
    }

    flushListBuffer();
    blocks.push(paragraphBlock(inlineMarkdownToHtml(line.trim())));
  }

  flushListBuffer();

  return blocks.join("\n\n");
}