"use client";

import { useEffect, useState } from "react";

export interface TocHeading {
  id: string;
  level: 2 | 3;
  text: string;
}

export function PostToc({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id);

  useEffect(() => {
    const container = document.querySelector(".content");
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!container || elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { root: container, rootMargin: "-72px 0px -68% 0px", threshold: 0 },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  function jump(id: string) {
    const element = document.getElementById(id);
    const container = document.querySelector(".content");
    if (!element || !container) return;

    container.scrollTo({
      behavior: "smooth",
      top: element.offsetTop - 72,
    });
  }

  return (
    <aside className="read-toc">
      <div className="toc-label">Nesta página</div>
      <div className="toc-list">
        {headings.map((heading) => (
          <button
            className={`toc-link lvl-${heading.level}${activeId === heading.id ? " active" : ""}`}
            key={heading.id}
            onClick={() => jump(heading.id)}
            type="button"
          >
            {heading.text}
          </button>
        ))}
      </div>
    </aside>
  );
}
