// Namespace IDs in trusted, repository-authored Markdown when several case studies
// share the homepage. Standalone project pages retain their existing anchors.
export function scopeProjectHtml(html: string, slug: string): string {
  const ids = new Map<string, string>();
  for (const match of html.matchAll(/\sid="([^"]+)"/g)) {
    ids.set(match[1], `${slug}--${match[1]}`);
  }
  return html
    .replace(/(\sid=")([^"]+)(")/g, (_, before, id, after) => `${before}${ids.get(id)}${after}`)
    .replace(/(\shref="#)([^"]+)(")/g, (_, before, id, after) => `${before}${ids.get(id) ?? id}${after}`)
    .replace(/(\saria-(?:controls|labelledby|describedby)=")([^"]+)(")/g, (_, before, value, after) =>
      `${before}${value.split(/\s+/).map((id: string) => ids.get(id) ?? id).join(' ')}${after}`,
    );
}
