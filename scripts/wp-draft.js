#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { resolveDraftWrite } from "../lib/wp-draft/guard.js";
import { buildDraftPayload, loadPageMarkdown } from "../lib/wp-draft/parse-page.js";
import { resolveRestBase } from "../lib/wp-draft/rest-base.js";
import {
  createDraftPage,
  fetchPageBySlug,
  updateDraftPage,
} from "../lib/wp-draft/wp-client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PAGES_DIR = path.join(ROOT, "content", "pages");

dotenv.config({ path: path.join(ROOT, ".env") });

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  let page;
  let apply = false;
  let all = false;
  let offline = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--apply") {
      apply = true;
    } else if (arg === "--all") {
      all = true;
    } else if (arg === "--offline") {
      offline = true;
    } else if (arg === "--page" && argv[i + 1]) {
      page = argv[++i];
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  if (apply && offline) {
    throw new Error("--apply cannot be combined with --offline");
  }

  return { page, apply, all, offline };
}

function printHelp() {
  console.log(`Usage:
  npm run wp:draft -- --page ki-schulung           dry-run (default)
  npm run wp:draft -- --page ki-schulung --apply  create/update WP draft
  npm run wp:draft -- --all                        dry-run all pages
  npm run wp:draft -- --all --apply

Options:
  --page <slug>   Frontmatter slug (file content/pages/<slug>.md)
  --all           Every *.md file in content/pages/
  --apply         Perform HTTP write (default is dry-run)
  --offline       Dry-run without WordPress API (assumes canonical slug is live)
`);
}

function loadEnv() {
  const baseUrl = process.env.WP_STAGING_URL;
  const user = process.env.WP_STAGING_USER;
  const password = process.env.WP_STAGING_APP_PASSWORD;

  if (!baseUrl || !user || !password) {
    throw new Error(
      "Missing WP_STAGING_URL, WP_STAGING_USER, or WP_STAGING_APP_PASSWORD in .env (see .env.example)"
    );
  }

  return { baseUrl, auth: { user, password } };
}

/**
 * @param {string} slug
 */
function pageFileForSlug(slug) {
  return path.join(PAGES_DIR, `${slug}.md`);
}

/**
 * @param {string} filePath
 * @param {{ baseUrl: string, auth: { user: string, password: string } }} env
 * @param {boolean} apply
 */
async function processPage(filePath, env, apply, offline) {
  const page = loadPageMarkdown(filePath);
  const restBase = resolveRestBase(page.frontmatter);
  const canonicalSlug = page.frontmatter.slug;
  const entwurfSlug = `${canonicalSlug}-entwurf`;

  /** @type {{ id: number, slug: string, status: string } | null} */
  let existingByCanonical = null;
  /** @type {{ id: number, slug: string, status: string } | null} */
  let existingEntwurf = null;

  if (offline) {
    existingByCanonical = {
      id: 0,
      slug: canonicalSlug,
      status: "publish",
    };
    console.log(
      "Offline mode: assuming canonical page is published; target slug will use -entwurf."
    );
  } else {
    existingByCanonical = await fetchPageBySlug(
      env.baseUrl,
      env.auth,
      canonicalSlug,
      restBase
    );
    existingEntwurf = await fetchPageBySlug(
      env.baseUrl,
      env.auth,
      entwurfSlug,
      restBase
    );
  }

  const write = resolveDraftWrite({
    canonicalSlug,
    existingByCanonical,
    existingEntwurf,
  });

  let parentId;
  const parentSlug = page.frontmatter.parent_slug;
  if (parentSlug && !offline) {
    const parent = await fetchPageBySlug(
      env.baseUrl,
      env.auth,
      parentSlug,
      restBase
    );
    if (parent) {
      parentId = parent.id;
    } else {
      console.warn(
        `Warning: parent slug "${parentSlug}" not found in WordPress; draft will have no parent.`
      );
    }
  } else if (parentSlug && offline) {
    console.log(`Offline mode: parent slug "${parentSlug}" (id not resolved).`);
  }

  const payload = buildDraftPayload(page, write, parentId);

  const summary = {
    file: path.relative(ROOT, filePath),
    restBase,
    canonicalSlug,
    writeSlug: write.slug,
    action: write.action,
    reason: write.reason,
    postId: write.postId,
    parentSlug: parentSlug || null,
    parentId: parentId || null,
    status: payload.status,
    title: payload.title,
    excerptLength: payload.excerpt?.length ?? 0,
    contentLength: payload.content.length,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (!apply) {
    console.log(
      "Dry-run only. Re-run with --apply to create or update the WordPress draft."
    );
    return;
  }

  let result;
  if (write.action === "update" && write.postId) {
    result = await updateDraftPage(
      env.baseUrl,
      env.auth,
      write.postId,
      payload,
      restBase
    );
  } else {
    result = await createDraftPage(env.baseUrl, env.auth, payload, restBase);
  }

  const editUrl = `${env.baseUrl.replace(/\/$/, "")}/wp-admin/post.php?post=${result.id}&action=edit`;
  console.log(`Draft saved: id=${result.id}`);
  console.log(`Edit: ${editUrl}`);
  if (result.link) {
    console.log(`Preview link (may require login): ${result.link}`);
  }
}

async function main() {
  const { page, apply, all, offline } = parseArgs(process.argv.slice(2));

  if (!page && !all) {
    printHelp();
    process.exit(1);
  }

  const env = offline ? null : loadEnv();

  /** @type {string[]} */
  const files = [];
  if (all) {
    for (const name of fs.readdirSync(PAGES_DIR)) {
      if (name.endsWith(".md")) {
        files.push(path.join(PAGES_DIR, name));
      }
    }
  } else if (page) {
    const filePath = pageFileForSlug(page);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Page file not found: ${filePath}`);
    }
    files.push(filePath);
  }

  for (const filePath of files) {
    await processPage(filePath, /** @type {any} */ (env), apply, offline);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});