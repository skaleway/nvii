import { CopyButton } from "@/components/copy-button";
import { Icons } from "@/components/icons";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export async function Code({
  title,
  language,
  code,
  resolvedTheme,
}: {
  title?: string;
  language: string;
  code: string;
  resolvedTheme: string;
}) {
  const highlightedCode = await highlightCode(code, resolvedTheme as string);

  let newTitle = title;

  if (!title && language === "bash") {
    newTitle = "Terminal";
  }

  const Icon =
    language === "bash"
      ? Icons.terminal
      : language === "ts" || language === "tsx"
        ? Icons.typescript
        : () => null;

  return (
    <div className="border rounded-md">
      {newTitle ? (
        <div className="rounded-t-md flex items-center bg-sidebar/50 justify-between py-3 px-4 border-b">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className="grayscale size-4" />}
            <p className="text-sm font-mono">{newTitle}</p>
          </div>
          <CopyButton code={code} />
        </div>
      ) : null}
      <ScrollArea className="">
        <div
          className={cn(
            "relative py-4 bg-background dark:bg-black w-full  rounded-md antialiased ",
            {
              "rounded-t-none": Boolean(newTitle),
            }
          )}
        >
          {!newTitle && (
            <div className="absolute right-2 top-2">
              <CopyButton code={code} />
            </div>
          )}
          <section
            dangerouslySetInnerHTML={{
              __html: highlightedCode,
            }}
          />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

async function highlightCode(code: string, theme: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      theme: "vitesse-light",
    })
    .use(rehypeStringify)
    .process(code);

  return String(file);
}
