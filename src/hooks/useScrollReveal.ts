"use client";

import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Start hidden
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "none";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Small delay to ensure styles are applied before animation
          requestAnimationFrame(() => {
            el.style.transition = "";
            el.classList.add("reveal-on-scroll");
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
