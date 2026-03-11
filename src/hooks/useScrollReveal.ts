import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    // Observe all children with the class
    const children = el.querySelectorAll(".reveal-on-scroll");
    children.forEach((child) => observer.observe(child));

    // Also observe the element itself if it has the class
    if (el.classList.contains("reveal-on-scroll")) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}
