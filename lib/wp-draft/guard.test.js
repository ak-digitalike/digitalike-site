import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DRAFT_PAYLOAD_STATUS, resolveDraftWrite } from "./guard.js";

describe("resolveDraftWrite", () => {
  it("routes to entwurf slug when canonical is published", () => {
    const plan = resolveDraftWrite({
      canonicalSlug: "ki-schulung",
      existingByCanonical: { id: 1, slug: "ki-schulung", status: "publish" },
      existingEntwurf: null,
    });
    assert.equal(plan.action, "create");
    assert.equal(plan.slug, "ki-schulung-entwurf");
    assert.equal(plan.reason, "canonical_is_public");
  });

  it("updates entwurf when canonical is published and entwurf exists", () => {
    const plan = resolveDraftWrite({
      canonicalSlug: "ki-automatisierung",
      existingByCanonical: {
        id: 2,
        slug: "ki-automatisierung",
        status: "publish",
      },
      existingEntwurf: { id: 99, slug: "ki-automatisierung-entwurf", status: "draft" },
    });
    assert.equal(plan.action, "update");
    assert.equal(plan.slug, "ki-automatisierung-entwurf");
    assert.equal(plan.postId, 99);
  });

  it("updates canonical when it is already a draft", () => {
    const plan = resolveDraftWrite({
      canonicalSlug: "ki-schulung",
      existingByCanonical: { id: 5, slug: "ki-schulung", status: "draft" },
      existingEntwurf: null,
    });
    assert.equal(plan.action, "update");
    assert.equal(plan.slug, "ki-schulung");
    assert.equal(plan.postId, 5);
  });

  it("creates at canonical slug when nothing exists", () => {
    const plan = resolveDraftWrite({
      canonicalSlug: "neu-seite",
      existingByCanonical: null,
      existingEntwurf: null,
    });
    assert.equal(plan.action, "create");
    assert.equal(plan.slug, "neu-seite");
    assert.equal(plan.reason, "not_found");
  });
});

describe("DRAFT_PAYLOAD_STATUS", () => {
  it("is always draft", () => {
    assert.equal(DRAFT_PAYLOAD_STATUS, "draft");
    assert.notEqual(DRAFT_PAYLOAD_STATUS, "publish");
  });
});