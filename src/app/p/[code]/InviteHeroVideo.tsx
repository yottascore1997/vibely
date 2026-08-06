"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** "rec" = incoming invite loop · "acc" = accept celebration once */
  mode: "rec" | "acc";
  className?: string;
};

export default function InviteHeroVideo({ mode, className }: Props) {
  const src = mode === "acc" ? "/invite/accsmoke.mp4" : "/invite/recsmoke.mp4";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    let cancelled = false;
    el.volume = 1;

    const tryWithSound = async () => {
      el.muted = false;
      setMuted(false);
      try {
        await el.play();
        if (!cancelled) setNeedsTap(false);
      } catch {
        // Autoplay with sound blocked — play muted, ask user to tap
        el.muted = true;
        if (!cancelled) {
          setMuted(true);
          setNeedsTap(true);
        }
        try {
          await el.play();
        } catch {
          /* ignore */
        }
      }
    };

    void tryWithSound();
    return () => {
      cancelled = true;
    };
  }, [src]);

  const enableSound = async () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    el.volume = 1;
    setMuted(false);
    setNeedsTap(false);
    try {
      await el.play();
    } catch {
      try {
        el.currentTime = 0;
        await el.play();
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div
      className={
        className ||
        "relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black"
      }
      style={{ height: "min(58vh, 480px)", minHeight: 320 }}
    >
      <video
        key={src}
        ref={videoRef}
        src={src}
        className="absolute inset-0 h-full w-full object-contain bg-black"
        autoPlay
        playsInline
        loop={mode === "rec"}
        muted={muted}
        preload="auto"
      />
      <div
        className={
          mode === "acc"
            ? "absolute inset-0 bg-gradient-to-t from-[#161622]/90 via-transparent to-black/10 pointer-events-none"
            : "absolute inset-0 bg-gradient-to-t from-[#161622]/85 via-transparent to-black/10 pointer-events-none"
        }
      />

      {mode === "rec" ? (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold tracking-wide text-amber-300 border border-white/10">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          INVITE
        </div>
      ) : (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-black tracking-wide text-white">
          YOU&apos;RE IN 🎉
        </div>
      )}

      <button
        type="button"
        onClick={enableSound}
        className="absolute bottom-3 right-3 z-10 flex items-center gap-2 rounded-full bg-black/70 border border-white/15 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm active:scale-95 transition"
      >
        {muted || needsTap ? (
          <>
            <span aria-hidden>🔇</span> Tap for sound
          </>
        ) : (
          <>
            <span aria-hidden>🔊</span> Sound on
          </>
        )}
      </button>
    </div>
  );
}
