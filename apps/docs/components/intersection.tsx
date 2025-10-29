"use client";

import React, { useEffect } from "react";
import { useTableOfContents } from "@/hooks/use-toc";

interface IntersectionProps {
  children: React.ReactNode;
  headings: Array<{ level: number; text: string }>;
}

export function Intersection({ children, headings }: IntersectionProps) {
  const setVisibleSections = useTableOfContents(
    (state) => state.setVisibleSections
  );
  const setAllHeadings = useTableOfContents((state) => state.setAllHeadings);

  useEffect(() => {
    setAllHeadings(headings.filter(({ level }) => level === 2 || level === 3));
  }, [headings, setAllHeadings]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const headingElements = document.querySelectorAll("h1, h2, h3");

    const callback = (entries: IntersectionObserverEntry[]): void => {
      const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => entry.target.id);

      if (visibleSections.length === 0) {
        return;
      }

      setVisibleSections(visibleSections);
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: "-100px 0px -66%",
      threshold: 1,
    });

    headingElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      headingElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [setVisibleSections]);

  return children;
}
