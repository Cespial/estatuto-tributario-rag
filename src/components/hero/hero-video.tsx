"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const SCENES = [
  "/hero/scene1.mp4",
  "/hero/scene2.mp4",
  "/hero/scene3.mp4",
];

const SCENE_DURATION = 8000; // 8 seconds per scene
const FADE_DURATION = 1500; // 1.5s crossfade

export function HeroVideo() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const [activeSlot, setActiveSlot] = useState<"A" | "B">("A");

  const getInactiveVideo = useCallback(() => {
    return activeSlot === "A" ? videoBRef.current : videoARef.current;
  }, [activeSlot]);

  // Preload next scene into inactive video
  const preloadNext = useCallback(
    (nextIndex: number) => {
      const inactive = getInactiveVideo();
      if (inactive) {
        inactive.src = SCENES[nextIndex];
        inactive.load();
      }
    },
    [getInactiveVideo]
  );

  // Transition to next scene
  const transitionToNext = useCallback(() => {
    const nextIndex = (currentScene + 1) % SCENES.length;

    setIsTransitioning(true);

    // After fade completes, swap slots
    setTimeout(() => {
      setActiveSlot((prev) => (prev === "A" ? "B" : "A"));
      setCurrentScene(nextIndex);
      setIsTransitioning(false);

      // Start playing the now-active video
      const nowActive = activeSlot === "A" ? videoBRef.current : videoARef.current;
      nowActive?.play().catch(() => {});

      // Preload the next one
      const nextNext = (nextIndex + 1) % SCENES.length;
      setTimeout(() => preloadNext(nextNext), 1000);
    }, FADE_DURATION);
  }, [currentScene, activeSlot, preloadNext]);

  // Initialize first video
  useEffect(() => {
    const videoA = videoARef.current;
    if (videoA) {
      videoA.src = SCENES[0];
      videoA.load();
      videoA.play().catch(() => {});
    }

    // Preload second scene
    setTimeout(() => preloadNext(1), 2000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scene rotation timer
  useEffect(() => {
    const timer = setInterval(transitionToNext, SCENE_DURATION);
    return () => clearInterval(timer);
  }, [transitionToNext]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Video A */}
      <video
        ref={videoARef}
        muted
        playsInline
        loop
        className="absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out"
        style={{
          transitionDuration: `${FADE_DURATION}ms`,
          opacity: activeSlot === "A" ? (isTransitioning ? 0 : 1) : (isTransitioning ? 1 : 0),
        }}
      />

      {/* Video B */}
      <video
        ref={videoBRef}
        muted
        playsInline
        loop
        className="absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out"
        style={{
          transitionDuration: `${FADE_DURATION}ms`,
          opacity: activeSlot === "B" ? (isTransitioning ? 0 : 1) : (isTransitioning ? 1 : 0),
        }}
      />

      {/* Dark overlay gradient — left side readable, right side shows video */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />

      {/* Bottom vignette for text legibility at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
    </div>
  );
}
