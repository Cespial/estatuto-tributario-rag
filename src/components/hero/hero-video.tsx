"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SCENES = ["/hero/scene1.mp4", "/hero/scene2.mp4", "/hero/scene3.mp4"];
const SCENE_DURATION = 8000;
const FADE_DURATION = 1500;

export function HeroVideo() {
  const [enableVideo, setEnableVideo] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [nextScene, setNextScene] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const videosRef = useRef<(HTMLVideoElement | null)[]>([null, null, null]);
  const transitionCallbackRef = useRef<() => void>(() => {});
  const currentSceneRef = useRef(0);
  const transitioningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    currentSceneRef.current = currentScene;
  }, [currentScene]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (fadeRef.current) {
      clearTimeout(fadeRef.current);
      fadeRef.current = null;
    }
  }, []);

  const scheduleNextTransition = useCallback(() => {
    clearTimers();
    timerRef.current = setTimeout(() => {
      transitionCallbackRef.current();
    }, SCENE_DURATION);
  }, [clearTimers]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const update = () => setEnableVideo(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    transitionCallbackRef.current = () => {
      if (!enableVideo || document.hidden || transitioningRef.current) return;

      const currentIndex = currentSceneRef.current;
      const nextIndex = (currentIndex + 1) % SCENES.length;
      const nextVideo = videosRef.current[nextIndex];

      if (!nextVideo) return;

      nextVideo.currentTime = 0;
      nextVideo.play().catch(() => {});

      setNextScene(nextIndex);
      setIsTransitioning(true);
      transitioningRef.current = true;

      fadeRef.current = setTimeout(() => {
        const previousVideo = videosRef.current[currentIndex];
        if (previousVideo) {
          previousVideo.pause();
          previousVideo.currentTime = 0;
        }

        setCurrentScene(nextIndex);
        setNextScene(null);
        setIsTransitioning(false);
        transitioningRef.current = false;

        scheduleNextTransition();
      }, FADE_DURATION);
    };
  }, [enableVideo, scheduleNextTransition]);

  useEffect(() => {
    if (!enableVideo) {
      clearTimers();
      videosRef.current.forEach((video) => video?.pause());
      return;
    }

    const currentVideo = videosRef.current[currentSceneRef.current];
    currentVideo?.play().catch(() => {});
    scheduleNextTransition();

    return () => clearTimers();
  }, [enableVideo, clearTimers, scheduleNextTransition]);

  useEffect(() => {
    if (!enableVideo) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimers();
        videosRef.current.forEach((video) => video?.pause());
        return;
      }

      const currentVideo = videosRef.current[currentSceneRef.current];
      currentVideo?.play().catch(() => {});
      if (!transitioningRef.current) {
        scheduleNextTransition();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [enableVideo, clearTimers, scheduleNextTransition]);

  const handleEnded = useCallback((index: number) => {
    const video = videosRef.current[index];
    if (!video) return;

    video.currentTime = 0;
    video.play().catch(() => {});
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(100%_70%_at_20%_30%,#3a352d_0%,#171512_50%,#090908_100%)] md:hidden" />

      <div className="absolute inset-0 hidden md:block">
        {SCENES.map((src, index) => (
          <video
            key={src}
            ref={(element) => {
              videosRef.current[index] = element;
            }}
            src={src}
            muted
            playsInline
            preload={index === 0 ? "auto" : "metadata"}
            onEnded={() => handleEnded(index)}
            className="absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out"
            style={{
              willChange: "opacity",
              transitionDuration: `${FADE_DURATION}ms`,
              opacity:
                index === currentScene ||
                (index === nextScene && isTransitioning)
                  ? 1
                  : 0,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
    </div>
  );
}
