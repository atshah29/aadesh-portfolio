import type { APIRoute } from "astro";
import { projects } from "../lib/projects";
export const GET: APIRoute = ({ site }) => {
  const paths = [
    "/",
    ...projects.map((p) => `/projects/${p.frontmatter.slug}/`),
  ];
  const escape = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const urls = site
    ? paths
        .map(
          (path) => `<url><loc>${escape(new URL(path, site).href)}</loc></url>`,
        )
        .join("")
    : "";
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
};
