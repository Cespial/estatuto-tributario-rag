"use client";

import { useEffect, useState } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const height = document.documentElement.clientHeight;
      const totalScroll = scrollHeight - height;
      const currentScroll = window.scrollY;
      
      if (totalScroll > 0) {
        setProgress((currentScroll / totalScroll) * 100);
      }
    };

    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 z-[60] h-0.5 w-full bg-transparent print:hidden">
      <div 
        className="h-full bg-foreground transition-all duration-150 ease-out" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
