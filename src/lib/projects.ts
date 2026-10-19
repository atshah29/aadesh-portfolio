import type { MarkdownInstance } from "astro";
export interface Project {
  slug: string;
  order: number;
  title: string;
  cardTitle: string;
  category: string;
  summary: string;
  description: string;
  role: string;
  context: string;
  technology: string;
  tags: string[];
  result: string;
  visual: string;
  image: string;
  imageAlt: string;
  benchmarkNote?: string;
  links: { label: string; href: string }[];
}
const modules = import.meta.glob<MarkdownInstance<Project>>(
  "../content/projects/*.md",
  { eager: true },
);
export const projects = Object.values(modules).sort(
  (a, b) => a.frontmatter.order - b.frontmatter.order,
);
