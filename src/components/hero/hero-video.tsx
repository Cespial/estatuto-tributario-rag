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
  const [nextReady, setNextReady] = useState(false);

  const getActiveVideo = useCallback(() => {
    return activeSlot === "A" ? videoARef.current : videoBRef.current;
  }, [activeSlot]);

  const getInactiveVideo = useCallback(() => {
    return activeSlot === "A" ? videoBRef.current : videoARef.current;
  }, [activeSlot]);

  // Preload next scene into inactive video
  const preloadNext = useCallback(
    (nextIndex: number) => {
      const inactive = getInactiveVideo();
      if (inactive) {
        setNextReady(false);
        inactive.src = SCENES[nextIndex];
        inactive.load();
      }
    },
    [getInactiveVideo]
  );

  // Handle canplaythrough on inactive video — marks it as ready
  const handleCanPlayThrough = useCallback(
    (slot: "A" | "B") => {
      // Only mark ready if this slot is the inactive one
      if (slot !== activeSlot) {
        setNextReady(true);
      }
    },
    [activeSlot]
  );

  // Transition to next scene
  const transitionToNext = useCallback(() => {
    // Don't transition if the next video isn't buffered yet
    if (!nextReady) return;

    const nextIndex = (currentScene + 1) % SCENES.length;
    const inactiveVideo = getInactiveVideo();

    // Ensure the inactive video is playing BEFORE starting the visual transition
    if (inactiveVideo) {
      inactiveVideo.currentTime = 0;
      const playPromise = inactiveVideo.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
    }

    setIsTransitioning(true);

    // After fade completes, swap slots
    setTimeout(() => {
      // Use functional updates to avoid stale closure issues
      setActiveSlot((prev) => (prev === "A" ? "B" : "A"));
      setCurrentScene(nextIndex);
      setIsTransitioning(false);
      setNextReady(false);

      // Preload the next scene after a short delay
      const nextNext = (nextIndex + 1) % SCENES.length;
      setTimeout(() => preloadNext(nextNext), 500);
    }, FADE_DURATION);
  }, [currentScene, nextReady, getInactiveVideo, preloadNext]);

  // Handle video ended — loop by resetting currentTime
  const handleVideoEnded = useCallback((videoRef: React.RefObject<HTMLVideoElement | null>) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, []);

  // Initialize first video
  useEffect(() => {
    const videoA = videoARef.current;
    if (videoA) {
      videoA.src = SCENES[0];
      videoA.load();
      videoA.play().catch(() => {});
    }

    // Preload second scene aggressively — start immediately after first loads
    const preloadTimer = setTimeout(() => {
      const videoB = videoBRef.current;
      if (videoB) {
        videoB.src = SCENES[1];
        videoB.load();
      }
    }, 500);

    return () => clearTimeout(preloadTimer);
  }, []);

  // Scene rotation timer
  useEffect(() => {
    const timer = setInterval(transitionToNext, SCENE_DURATION);
    return () => clearInterval(timer);
  }, [transitionToNext]);

  // Preload next video as soon as current scene changes
  useEffect(() => {
    const activeVideo = getActiveVideo();
    if (activeVideo) {
      const handlePlaying = () => {
        const nextIndex = (currentScene + 1) % SCENES.length;
        const inactive = getInactiveVideo();
        if (inactive && inactive.src !== window.location.origin + SCENES[nextIndex]) {
          preloadNext(nextIndex);
        }
      };
      activeVideo.addEventListener("playing", handlePlaying);
      return () => activeVideo.removeEventListener("playing", handlePlaying);
    }
  }, [currentScene, getActiveVideo, getInactiveVideo, preloadNext]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Video A */}
      <video
        ref={videoARef}
        muted
        playsInline
        loop
        preload="auto"
        onCanPlayThrough={() => handleCanPlayThrough("A")}
        onEnded={() => handleVideoEnded(videoARef)}
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
        preload="auto"
        onCanPlayThrough={() => handleCanPlayThrough("B")}
        onEnded={() => handleVideoEnded(videoBRef)}
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
