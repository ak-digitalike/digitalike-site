import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveRestBase } from "./rest-base.js";

describe("resolveRestBase", () => {
  it("maps leistung and schulung templates to leistungen", () => {
    assert.equal(resolveRestBase({ template: "leistung" }), "leistungen");
    assert.equal(resolveRestBase({ template: "schulung" }), "leistungen");
  });

  it("uses wp_rest_base override when set", () => {
    assert.equal(
      resolveRestBase({ template: "leistung", wp_rest_base: "pages" }),
      "pages"
    );
  });

  it("defaults to pages for unknown templates", () => {
    assert.equal(resolveRestBase({ template: "blog" }), "pages");
    assert.equal(resolveRestBase({}), "pages");
  });
});