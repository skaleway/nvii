import { MDXContent as MDXContentComponent } from "@content-collections/mdx/react";
import Image from "next/image";
import { Code } from "./code";
import Link from "next/link";
import { DetailedHTMLProps, HTMLAttributes } from "react";
import { slugify } from "@/lib/utils";
import { Doc } from "content-collections";
import { Heading, Section } from "@/lib/types";

type CodeProps = DetailedHTMLProps<
  HTMLAttributes<HTMLPreElement>,
  HTMLPreElement
> & {
  language: string;
  code: string;
};

export const MDXContent = ({
  doc,
  sections,
}: {
  doc: Doc;
  sections: Section[];
}) => {
  return (
    <MDXContentComponent
      components={{
        Image: ({ src, alt, width, height }) => (
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={alt || ""}
              width={width ?? 800}
              height={height ?? 400}
              className="w-full h-full object-cover"
              quality={95}
            />
          </div>
        ),
        Frame: ({ children }) => (
          <div className="inline-block w-full h-full p-2 border border-border/40 rounded-lg bg-muted/50 lg:p-3 my-8">
            <div className="rounded-lg w-full h-full overflow-hidden">
              {children}
            </div>
          </div>
        ),
        p: ({ children }) => (
          <p className="text-muted-foreground text-base/7">{children}</p>
        ),
        pre: (props) => {
          return (
            <Code
              language={(props as CodeProps).language}
              title={(props as CodeProps).title}
              code={(props as CodeProps).code}
              resolvedTheme="light"
            />
          );
        },
        strong: ({ children, ...props }) => {
          return (
            <b className="text-muted-light font-semibold" {...props}>
              {children}
            </b>
          );
        },
        hr: () => (
          <div className="py-6">
            <hr className="border-none h-px bg-border/40" />
          </div>
        ),
        code: (props) => {
          return (
            <code className="px-1.5 py-0.5 rounded bg-sidebar/50 border font-mono!">
              {props.children}
            </code>
          );
        },
        a: ({ children, ...props }) => {
          return (
            <Link
              className="inline underline underline-offset-4 text-muted-light font-medium"
              href={props.href ?? "#"}
              target={props.href?.startsWith("/") ? undefined : "_blank"}
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </Link>
          );
        },
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-2 pl-8 text-muted-foreground">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal ml-8 space-y-2 text-muted-foreground">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-base/7 pl-1 space-y-6">{children}</li>
        ),
        h1: ({ children }) => {
          const element = sections.find(
            (entry) => entry.title === children?.toString()
          );

          if (!element) {
            return null;
          }

          const slug = slugify(element.title.toLowerCase());

          return (
            <h1
              id={slug}
              className="relative scroll-mt-44 lg:scroll-mt-32 text-muted-light text-4xl tracking-tight font-medium"
            >
              {children}
            </h1>
          );
        },
        h2: ({ children }) => {
          const element = sections.find(
            (entry) => entry.title === children?.toString()
          );

          if (!element) {
            return null;
          }

          const slug = slugify(element.title.toLowerCase());

          return (
            <h2
              id={slug}
              className="relative scroll-mt-44 lg:scroll-mt-32 text-muted-light text-3xl tracking-tight font-medium"
            >
              {children}
            </h2>
          );
        },
        h3: ({ children }) => {
          const element = sections.find(
            (entry) => entry.title === children?.toString()
          );

          if (!element) {
            return null;
          }

          const slug = slugify(element.title.toLowerCase());

          return (
            <h3
              id={slug}
              className="relative scroll-mt-44 lg:scroll-mt-32 text-muted-light text-xl tracking-tight font-medium"
            >
              {children}
            </h3>
          );
        },
      }}
      code={doc.mdx}
    />
  );
};
