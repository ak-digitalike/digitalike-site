/** @typedef {'publish' | 'private' | 'pending' | 'draft' | 'future'} WpPostStatus */

const PUBLIC_STATUSES = new Set(["publish", "private", "pending"]);

/**
 * @typedef {Object} WpPageRef
 * @property {number} id
 * @property {string} slug
 * @property {WpPostStatus} status
 */

/**
 * Decide which WP slug to write and whether to create or update.
 * Never targets a public page at the canonical slug.
 *
 * @param {Object} input
 * @param {string} input.canonicalSlug
 * @param {WpPageRef | null} input.existingByCanonical
 * @param {WpPageRef | null} input.existingEntwurf
 * @returns {{ action: 'create' | 'update', slug: string, postId?: number, reason: string }}
 */
export function resolveDraftWrite({
  canonicalSlug,
  existingByCanonical,
  existingEntwurf,
}) {
  const entwurfSlug = `${canonicalSlug}-entwurf`;

  if (
    existingByCanonical &&
    PUBLIC_STATUSES.has(existingByCanonical.status)
  ) {
    if (existingEntwurf) {
      return {
        action: "update",
        slug: entwurfSlug,
        postId: existingEntwurf.id,
        reason: "canonical_is_public",
      };
    }
    return {
      action: "create",
      slug: entwurfSlug,
      reason: "canonical_is_public",
    };
  }

  if (existingByCanonical?.status === "draft") {
    return {
      action: "update",
      slug: canonicalSlug,
      postId: existingByCanonical.id,
      reason: "canonical_is_draft",
    };
  }

  if (existingByCanonical?.status === "future") {
    return {
      action: "update",
      slug: canonicalSlug,
      postId: existingByCanonical.id,
      reason: "canonical_is_scheduled",
    };
  }

  return {
    action: "create",
    slug: canonicalSlug,
    reason: "not_found",
  };
}

/** WordPress REST payload status for automated writes (never publish). */
export const DRAFT_PAYLOAD_STATUS = "draft";