/**
 * Minimal WordPress REST client for draft posts.
 */

const DEFAULT_LANG = "de";

/**
 * @param {string} baseUrl
 * @param {{ user: string, password: string }} auth
 */
function authHeader(auth) {
  const token = Buffer.from(`${auth.user}:${auth.password}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

/**
 * @param {string} baseUrl
 */
function apiBase(baseUrl) {
  return baseUrl.replace(/\/$/, "") + "/wp-json/wp/v2";
}

/**
 * @param {string} baseUrl
 * @param {string} restBase
 * @param {string} slug
 * @param {string | undefined} lang
 * @param {{ user: string, password: string }} auth
 */
async function fetchCollectionBySlug(baseUrl, restBase, slug, lang, auth) {
  const url = new URL(`${apiBase(baseUrl)}/${restBase}`);
  url.searchParams.set("slug", slug);
  if (lang) {
    url.searchParams.set("lang", lang);
  }
  url.searchParams.set("per_page", "1");
  url.searchParams.set("context", "edit");

  const res = await fetch(url, {
    headers: {
      ...authHeader(auth),
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `WP lookup failed for ${restBase} slug=${slug}: ${res.status} ${text.slice(0, 200)}`
    );
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const page = data[0];
  return {
    id: page.id,
    slug: page.slug,
    status: page.status,
    link: page.link,
  };
}

/**
 * @param {string} baseUrl
 * @param {{ user: string, password: string }} auth
 * @param {string} slug
 * @param {string} [restBase]
 * @param {string} [lang]
 */
export async function fetchPageBySlug(
  baseUrl,
  auth,
  slug,
  restBase = "pages",
  lang = DEFAULT_LANG
) {
  const withLang = await fetchCollectionBySlug(
    baseUrl,
    restBase,
    slug,
    lang,
    auth
  );
  if (withLang) {
    return withLang;
  }

  return fetchCollectionBySlug(baseUrl, restBase, slug, undefined, auth);
}

/**
 * @param {string} baseUrl
 * @param {{ user: string, password: string }} auth
 * @param {Record<string, unknown>} payload
 * @param {string} [restBase]
 * @param {string} [lang]
 */
export async function createDraftPage(
  baseUrl,
  auth,
  payload,
  restBase = "pages",
  lang = DEFAULT_LANG
) {
  const url = new URL(`${apiBase(baseUrl)}/${restBase}`);
  url.searchParams.set("lang", lang);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...authHeader(auth),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WP create failed: ${res.status} ${text.slice(0, 400)}`);
  }

  return res.json();
}

/**
 * @param {string} baseUrl
 * @param {{ user: string, password: string }} auth
 * @param {number} id
 * @param {Record<string, unknown>} payload
 * @param {string} [restBase]
 * @param {string} [lang]
 */
export async function updateDraftPage(
  baseUrl,
  auth,
  id,
  payload,
  restBase = "pages",
  lang = DEFAULT_LANG
) {
  const url = new URL(`${apiBase(baseUrl)}/${restBase}/${id}`);
  url.searchParams.set("lang", lang);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...authHeader(auth),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WP update failed: ${res.status} ${text.slice(0, 400)}`);
  }

  return res.json();
}