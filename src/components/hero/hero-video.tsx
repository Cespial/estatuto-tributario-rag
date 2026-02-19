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
  const [nextScene, setNextScene] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videosRef = useRef<(HTMLVideoElement | null)[]>([null, null, null]);
  const callbackRef = useRef<() => void>(() => {});
  const transitioningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Ref-stable transition callback — avoids stale closures entirely
  useEffect(() => {
    callbackRef.current = () => {
      if (transitioningRef.current) return;

      const next = (currentScene + 1) % SCENES.length;
      const nextVideo = videosRef.current[next];

      if (!nextVideo) return;

      // Start playing the next video before crossfade
      nextVideo.currentTime = 0;
      nextVideo.play().catch(() => {});

      setNextScene(next);
      setIsTransitioning(true);
      transitioningRef.current = true;

      // After crossfade completes, finalize and schedule next
      setTimeout(() => {
        const oldVideo = videosRef.current[currentScene];
        if (oldVideo) {
          oldVideo.pause();
          oldVideo.currentTime = 0;
        }

        setCurrentScene(next);
        setNextScene(null);
        setIsTransitioning(false);
        transitioningRef.current = false;

        // Schedule next transition — each scene gets full SCENE_DURATION of solo time
        timerRef.current = setTimeout(() => callbackRef.current(), SCENE_DURATION);
      }, FADE_DURATION);
    };
  }, [currentScene]);

  // Kick off the first transition after SCENE_DURATION
  useEffect(() => {
    timerRef.current = setTimeout(() => callbackRef.current(), SCENE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, []);

  // Initialize: play first video, preload all others
  useEffect(() => {
    const videos = videosRef.current;
    videos.forEach((video, i) => {
      if (!video) return;
      if (i === 0) {
        video.play().catch(() => {});
      }
    });
  }, []);

  // Handle video ended — seamless loop without `loop` attribute
  const handleEnded = useCallback((index: number) => {
    const video = videosRef.current[index];
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {SCENES.map((src, i) => (
        <video
          key={src}
          ref={(el) => { videosRef.current[i] = el; }}
          src={src}
          muted
          playsInline
          preload="auto"
          onEnded={() => handleEnded(i)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out"
          style={{
            willChange: "opacity",
            transitionDuration: `${FADE_DURATION}ms`,
            opacity:
              i === currentScene
                ? 1
                : i === nextScene && isTransitioning
                  ? 1
                  : 0,
          }}
        />
      ))}

      {/* Dark overlay gradient — left side readable, right side shows video */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />

      {/* Bottom vignette for text legibility at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
    </div>
  );
}
