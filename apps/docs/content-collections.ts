import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypeParseCodeBlocks } from "./shiki-rehyped.mjs";
import { slugify } from "@/lib/utils";

const docs = defineCollection({
  name: "docs",
  directory: "content/docs",
  include: ["**/*.md", "**/*.mdx"],
  schema: (z) => ({
    title: z.string(),
    summary: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      rehypePlugins: [
        rehypeParseCodeBlocks,
        [
          rehypeAutolinkHeadings,
          {
            properties: {
              className: ["anchor"],
            },
          },
        ],
      ],
    });

    const regXHeader = /^(?:[\n\r]|)(#{1,6})\s+(.+)/g;
    const headings = Array.from(document.content.matchAll(regXHeader)).map(
      (match) => {
        const flag = match[1];
        const content = match[2];
        return {
          level: flag?.length,
          text: content,
          slug: slugify(content ?? "#"),
        };
      }
    );

    return {
      ...document,
      headings,
      mdx,
    };
  },
});

export default defineConfig({
  collections: [docs],
}) as ReturnType<typeof defineConfig>;
