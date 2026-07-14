"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  return (
    <div className="sticky top-24 hidden lg:block h-[calc(100vh-8rem)] overflow-y-auto w-full max-w-[250px]">
      <div className="mb-4 text-xs font-bold uppercase tracking-widest text-muted">
        Contents
      </div>
      <nav className="flex flex-col space-y-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById(item.id);
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className={cn(
              "text-sm font-medium transition-colors hover:text-foreground",
              activeId === item.id
                ? "text-accent"
                : "text-muted"
            )}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </div>
  );
}
