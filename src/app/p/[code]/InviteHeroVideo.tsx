"use client";

type Props = {
  /** "rec" = incoming invite loop · "acc" = accept celebration once */
  mode: "rec" | "acc";
  className?: string;
};

export default function InviteHeroVideo({ mode, className }: Props) {
  const src = mode === "acc" ? "/invite/accsmoke.mp4" : "/invite/recsmoke.mp4";
  return (
    <div
      className={
        className ||
        "relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40"
      }
      style={{ aspectRatio: "16 / 10", maxHeight: 220 }}
    >
      <video
        key={src}
        src={src}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        loop={mode === "rec"}
        // Celebration plays once
        {...(mode === "acc" ? {} : {})}
      />
      <div
        className={
          mode === "acc"
            ? "absolute inset-0 bg-gradient-to-t from-[#161622] via-emerald-900/20 to-transparent"
            : "absolute inset-0 bg-gradient-to-t from-[#161622] via-transparent to-black/20"
        }
      />
      {mode === "rec" ? (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-amber-300 border border-white/10">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          INVITE
        </div>
      ) : (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-black tracking-wide text-white">
          YOU&apos;RE IN 🎉
        </div>
      )}
    </div>
  );
}
