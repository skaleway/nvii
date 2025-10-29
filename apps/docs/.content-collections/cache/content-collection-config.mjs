// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// shiki-rehyped.mjs
import { visit } from "unist-util-visit";
function rehypeParseCodeBlocks() {
  return (tree) => {
    visit(tree, "element", (node, _nodeIndex, parentNode) => {
      if (node.tagName === "code" && node.properties?.className) {
        const language = node.properties.className[0]?.replace(/^language-/, "") || "text";
        const metastring = node.data?.meta || "";
        let title = null;
        if (metastring) {
          const excludeMatch = metastring.match(/\s+\/([^/]+)\//);
          if (excludeMatch) {
            const cleanMetastring = metastring.replace(excludeMatch[0], "");
            const titleMatch = cleanMetastring.match(/^([^{]+)/);
            if (titleMatch) {
              title = titleMatch[1].trim();
            }
          } else {
            const titleMatch = metastring.match(/^([^{]+)/);
            if (titleMatch) {
              title = titleMatch[1].trim();
            }
          }
        }
        parentNode.properties = parentNode.properties || {};
        parentNode.properties.language = language;
        parentNode.properties.title = title;
        parentNode.properties.meta = metastring;
        const codeContent = node.children[0]?.value || "";
        parentNode.properties.code = [
          "```" + language + (metastring ? " " + metastring : ""),
          codeContent.trimEnd(),
          "```"
        ].join("\n");
      }
    });
  };
}

// lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function slugify(text) {
  return text.toString().toLowerCase().normalize(`NFD`).trim().replace(/\./g, ``).replace(/\s+/g, `-`).replace(/[^\w-]+/g, ``).replace(/--+/g, `-`);
}

// content-collections.ts
var docs = defineCollection({
  name: "docs",
  directory: "content/docs",
  include: ["**/*.md", "**/*.mdx"],
  schema: (z) => ({
    title: z.string(),
    summary: z.string()
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      rehypePlugins: [
        rehypeParseCodeBlocks,
        [
          rehypeAutolinkHeadings,
          {
            properties: {
              className: ["anchor"]
            }
          }
        ]
      ]
    });
    const regXHeader = /^(?:[\n\r]|)(#{1,6})\s+(.+)/gm;
    const headings = Array.from(document.content.matchAll(regXHeader)).map(
      (match) => {
        const flag = match[1];
        const content = match[2];
        return {
          level: flag?.length,
          text: content,
          slug: slugify(content ?? "#")
        };
      }
    );
    return {
      ...document,
      headings,
      mdx
    };
  }
});
var content_collections_default = defineConfig({
  collections: [docs]
});
export {
  content_collections_default as default
};
