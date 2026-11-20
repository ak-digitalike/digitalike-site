import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { markdownBodyToCoreBlocks } from "./markdown-to-blocks.js";
import { DRAFT_PAYLOAD_STATUS } from "./guard.js";

/**
 * @typedef {Object} PageFrontmatter
 * @property {string} slug
 * @property {string} title
 * @property {string} [parent_slug]
 * @property {string} meta_description
 * @property {string} [h1]
 * @property {string} [wp_rest_base]
 */

/**
 * @param {string} filePath
 */
export function loadPageMarkdown(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  if (!data.slug || !data.title) {
    throw new Error(
      `Missing required frontmatter (slug, title) in ${path.basename(filePath)}`
    );
  }

  const bodyBlocks = markdownBodyToCoreBlocks(content, {
    title: data.title,
    h1: data.h1,
  });

  return {
    filePath,
    frontmatter: /** @type {PageFrontmatter} */ (data),
    contentBlocks: bodyBlocks,
    excerpt: data.meta_description || "",
  };
}

/**
 * @param {ReturnType<typeof loadPageMarkdown>} page
 * @param {Object} write
 * @param {number} [write.parentId]
 */
export function buildDraftPayload(page, write, parentId) {
  const payload = {
    title: page.frontmatter.title,
    slug: write.slug,
    status: DRAFT_PAYLOAD_STATUS,
    content: page.contentBlocks,
    excerpt: page.excerpt,
  };

  if (parentId) {
    payload.parent = parentId;
  }

  return payload;
}