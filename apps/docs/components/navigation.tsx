"use client";
import { Section } from "@/lib/types";
import NumberFlow from "@number-flow/react";
import { motion, MotionConfig } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { useTableOfContents } from "@/hooks/use-toc";
import { slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { HTMLAttributes, useCallback, useEffect } from "react";

export const Timeline = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const visibleSections = useTableOfContents((state) => state.visibleSections);
  const allHeadings = useTableOfContents((state) => state.allHeadings);
  const setVisibleSections = useTableOfContents(
    (state) => state.setVisibleSections
  );

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const calculateScale = (index: number) => {
    if (hoveredIndex === null) return 0.4;
    const distance = Math.abs(index - hoveredIndex);
    return Math.max(1 - distance * 0.2, 0.4);
  };

  const handleClick = useCallback(
    (headingText: string) => {
      const slug = slugify(headingText);
      setVisibleSections([slug]);
      const element = document.getElementById(slug);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [setVisibleSections]
  );

  return (
    <div className="antialiased fixed right-0 top-0 bottom-0 items-center justify-center  bg-background  no-scrollbar py-20 w-20 border-l hidden h-screen md:flex">
      <div className="flex min-h-[500px]">
        <div className="flex flex-col justify-end">
          {allHeadings.map((heading, i) => {
            const isVisible = visibleSections.some(
              (section) => section === slugify(heading.text)
            );

            return (
              <Link
                key={i}
                href={`#${slugify(heading.text)}`}
                className="relative inline-flex items-end justify-center py-1"
                onMouseEnter={() => handleMouseEnter(i)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(heading.text)}
                onTouchStart={() => handleMouseEnter(i)}
                onTouchEnd={handleMouseLeave}
              >
                <motion.div
                  className={cn(
                    "rounded-full",
                    isVisible ? "bg-primary" : "bg-muted-foreground"
                  )}
                  animate={{
                    scale: calculateScale(i),
                    height: isVisible ? 8 : 4,
                    width: isVisible ? 50 : 40,
                  }}
                  initial={{ scale: 0.4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                {hoveredIndex === i ? (
                  <motion.span
                    className={cn(
                      "absolute top-0 bottom-0 my-auto right-[120%] text-[11px] whitespace-pre",
                      !isVisible && "text-muted-foreground"
                    )}
                    initial={{ opacity: 0, filter: `blur(4px)`, scale: 0.8 }}
                    animate={{ opacity: 1, filter: `blur(0px)`, scale: 1 }}
                    transition={{ duration: 0.15, delay: 0.1 }}
                  >
                    {heading.text}
                  </motion.span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

type TableOfContentsProps = HTMLAttributes<HTMLDivElement>;

export const TableOfContents = ({
  className,
  ...props
}: TableOfContentsProps) => {
  const visibleSections = useTableOfContents((state) => state.visibleSections);
  const allHeadings = useTableOfContents((state) => state.allHeadings);
  const setVisibleSections = useTableOfContents(
    (state) => state.setVisibleSections
  );

  useEffect(() => {
    if (!allHeadings[0]) return;

    if (allHeadings.length > 0 && visibleSections.length === 0) {
      const firstHeadingSlug = slugify(allHeadings[0].text);
      setVisibleSections([firstHeadingSlug]);
    }
  }, [allHeadings, visibleSections, setVisibleSections]);

  const handleClick = useCallback(
    (headingText: string) => {
      const slug = slugify(headingText);
      setVisibleSections([slug]);
    },
    [setVisibleSections]
  );

  return (
    <div className="antialiased fixed right-0 top-0 bottom-0 w-96 bg-background overflow-auto no-scrollbar py-20">
      <div className={cn("text-sm/7 relative", className)} {...props}>
        <p className="text-sm/7 font-semibold text-muted-light pl-4 ">
          On this page
        </p>
        <ul>
          {allHeadings.map((heading, i) => {
            const isVisible = visibleSections.some(
              (section) => section === slugify(heading.text)
            );

            return (
              <li key={i} className="leading-relaxed">
                <Link
                  href={`#${slugify(heading.text)}`}
                  onClick={() => handleClick(heading.text)}
                  className="relative flex"
                >
                  <div
                    className={cn(
                      "absolute left-4 w-0.5 top-0 h-full -translate-x-4 transition-colors",
                      isVisible ? "bg-primary" : "bg-transparent"
                    )}
                  />
                  <p
                    className={cn(
                      "text-muted-dark hover:text-muted-light transition pl-4 py-1",
                      {
                        "text-muted-light": isVisible,
                      }
                    )}
                    key={heading.text}
                  >
                    {heading.text}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export const Navigation = ({ sections }: { sections: Section[] }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");

  return (
    <MotionConfig transition={{ duration: 0.7, type: "spring", bounce: 0.25 }}>
      <div className="fixed right-0 left-0 bottom-0 mx-auto w-full max-w-3xl px-4 bg-linear-to-b from-transparent to-background via-background  border-x h-20 z-50 flex items-center justify-center">
        <div className="absolute  left-1/2  bottom-3 z-40 -translate-x-1/2">
          <motion.div
            layout
            initial={{
              height: 44,
              width: 240,
            }}
            animate={{
              height: open ? 500 : 44,
              width: 420,
              borderRadius: open ? 22 : 30,
            }}
            className="bg-background border relative cursor-pointer overflow-auto no-scrollbar shadow"
          >
            <header
              className="flex h-11 cursor-pointer items-center gap-2 px-4"
              onClick={() => setOpen(!open)}
            >
              <h1 className="grow font-bold">Table of Contents</h1>
              <ScrollPercentage />
            </header>
            <div className="mt-2 flex flex-col gap-2 px-4 pb-4">
              {sections.map((item, index) => (
                <Link
                  key={index + item.title}
                  className="whitespace-pre text-sm"
                  href={`#${item.slug}`}
                  onClick={() => {
                    setOpen(false);
                    setSelected(item.id.toString());
                  }}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
};

function ScrollPercentage() {
  return (
    <>
      <NumberFlow value={100} />
    </>
  );
}
