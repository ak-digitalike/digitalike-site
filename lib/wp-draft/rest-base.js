/**
 * Map page frontmatter to the WordPress REST collection name.
 *
 * @param {{ template?: string, wp_rest_base?: string }} frontmatter
 * @returns {string}
 */
export function resolveRestBase(frontmatter) {
  if (frontmatter.wp_rest_base) {
    return frontmatter.wp_rest_base;
  }

  const template = frontmatter.template;
  if (template === "leistung" || template === "schulung") {
    return "leistungen";
  }

  return "pages";
}