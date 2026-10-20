import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import SplitType from "split-type";
import { Activity, Disc, Sparkles } from "lucide-react";
import ParticleTypography from "./ParticleTypography";
import VinylVisualizer3D from "./VinylVisualizer3D";
import { getParticlePrimaryColor } from "../data/particleColors";

/**
 * Komponen satu baris lirik individual.
 * Memisahkan lifecycle tiap baris agar SplitType dan GSAP terisolasi dan mudah di-cleanup.
 */
const LyricLine = ({ lyric, particleTheme = "pearl", customColor = "#00f0ff", onOpenParticleColorPicker, compact = false }) => {
  const textRef = useRef(null);
  const subtextRef = useRef(null);
  const splitRef = useRef(null);
  const activeParticleColor = getParticlePrimaryColor(particleTheme, customColor);

  useEffect(() => {
    if (!lyric || lyric.effect === "atomic-particles" || !textRef.current) return;

    const effect = lyric.effect;
    let ctx = gsap.context(() => {
      // 1. APPLE-BLUR dikelola khusus melalui Framer Motion di wrapper
      if (effect === "apple-blur") {
        if (subtextRef.current) {
          gsap.fromTo(
            subtextRef.current,
            { opacity: 0, y: 15, filter: "blur(6px)" },
            { opacity: 0.9, y: 0, filter: "blur(0px)", duration: 0.8, delay: 0.25, ease: "power2.out" }
          );
        }
        return;
      }

      // Inisialisasi SplitType untuk efek berbasis chars/words
      const split = new SplitType(textRef.current, {
        types: "chars,words",
        tagName: "span",
      });
      splitRef.current = split;

      // 2. WAVE-CHARS (GSAP 3D Spasial + SplitType chars)
      if (effect === "wave-chars") {
        gsap.set(textRef.current, { perspective: 1200, transformStyle: "preserve-3d" });
        gsap.fromTo(
          split.chars,
          {
            y: 90,
            opacity: 0,
            rotateX: -90,
            transformOrigin: "50% 50% -40px",
          },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            stagger: 0.03,
            duration: 0.9,
            ease: "back.out(2)",
          }
        );
      }

      // 3. EXPLOSIVE-WORDS (GSAP zoom burst)
      else if (effect === "explosive-words") {
        gsap.fromTo(
          split.words,
          {
            scale: 2.2,
            opacity: 0,
            filter: "blur(12px)",
            transformOrigin: "center center",
          },
          {
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.12,
            duration: 0.85,
            ease: "expo.out",
          }
        );
      }

      // 4. GLITCH-SHAKE (GSAP split vibration)
      else if (effect === "glitch-shake") {
        const target = textRef.current;
        const tl = gsap.timeline();

        target.classList.add("glitch-shadow");

        tl.fromTo(
          target,
          { opacity: 0, scale: 1.15 },
          { opacity: 1, scale: 1, duration: 0.12 }
        );

        for (let i = 0; i < 9; i++) {
          tl.to(target, {
            x: gsap.utils.random(-8, 8),
            y: gsap.utils.random(-6, 6),
            skewX: gsap.utils.random(-4, 4),
            duration: 0.045,
            ease: "none",
          });
        }

        tl.to(target, {
          x: 0,
          y: 0,
          skewX: 0,
          duration: 0.25,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(target, {
              textShadow: "0 0 25px rgba(255, 255, 255, 0.25)",
              duration: 0.5,
            });
          },
        });
      }

      // 5. CINEMATIC-LETTERBOX (GSAP letter spacing)
      else if (effect === "cinematic-letterbox") {
        gsap.fromTo(
          textRef.current,
          {
            letterSpacing: "-0.04em",
            opacity: 0,
            filter: "blur(8px)",
          },
          {
            letterSpacing: "0.20em",
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.5,
            ease: "power2.out",
          }
        );

        if (split.chars && split.chars.length > 0) {
          gsap.fromTo(
            split.chars,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.035,
              duration: 1.1,
              ease: "power2.out",
            }
          );
        }
      }

      // 6. FALLING-SCATTER (GSAP gravity scatter)
      else if (effect === "falling-scatter") {
        gsap.set(textRef.current, { perspective: 1000 });
        gsap.fromTo(
          split.chars,
          {
            y: -120,
            opacity: 0,
            rotateZ: () => gsap.utils.random(-40, 40),
            scale: 1.8,
            filter: "blur(8px)",
          },
          {
            y: 0,
            opacity: 1,
            rotateZ: 0,
            scale: 1,
            filter: "blur(0px)",
            stagger: {
              each: 0.03,
              from: "random",
            },
            duration: 1.1,
            ease: "bounce.out",
          }
        );
      }
    }, textRef);

    return () => {
      ctx.revert();
      if (splitRef.current) {
        splitRef.current.revert();
      }
    };
  }, [lyric]);

  // Efek Partikel Atom
  if (lyric.effect === "atomic-particles") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
        transition={{ duration: 0.26, ease: "easeOut" }}
        className="w-full flex flex-col items-center justify-center text-center select-none"
      >
        <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-slate-300">
          <span className="text-cyan-300 font-medium">Partikel Atom</span>
          <span className="text-slate-600">:</span>
          <span className="text-slate-400">{lyric.time}s</span>
        </div>

        <ParticleTypography
          text={lyric.text}
          subtext={lyric.subtext}
          fontStyle={lyric.fontStyle}
          particleTheme={particleTheme}
          customColor={customColor}
        />
      </motion.div>
    );
  }

  const isAppleBlur = lyric.effect === "apple-blur";
  const appleVariants = {
    initial: { opacity: 0, y: 30, filter: "blur(12px)" },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      opacity: 0,
      y: -20,
      filter: "blur(10px)",
      transition: { duration: 0.24, ease: "easeOut" },
    },
  };

  const defaultVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      opacity: 0,
      y: -20,
      filter: "blur(8px)",
      scale: 0.98,
      transition: { duration: 0.24, ease: "easeOut" },
    },
  };

  const headingSizeClass = compact
    ? "text-2xl sm:text-4xl md:text-5xl"
    : "text-3xl sm:text-5xl md:text-6xl lg:text-7xl";

  return (
    <motion.div
      key={`lyric-node-${lyric.id}`}
      variants={isAppleBlur ? appleVariants : defaultVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-3 flex flex-col items-center justify-center text-center select-none"
      style={{ perspective: 1200, transformStyle: "preserve-3d" }}
    >
      <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-slate-400">
        <span className="text-indigo-300 font-semibold uppercase tracking-wider">{lyric.effect}</span>
        <span className="text-slate-600">:</span>
        <span className="text-slate-400">{lyric.time}s</span>
      </div>

      <div className="w-full overflow-visible py-2">
        <h1
          ref={textRef}
          className={`${headingSizeClass} leading-tight tracking-tight font-extrabold transition-all duration-300 drop-shadow-2xl ${
            lyric.fontStyle || "font-sans text-white"
          }`}
          style={{ wordBreak: "break-word" }}
        >
          {lyric.text}
        </h1>
      </div>

      {lyric.subtext && (
        <p
          ref={subtextRef}
          className="mt-3 sm:mt-5 text-sm sm:text-base md:text-lg font-sans font-light tracking-wide text-slate-300 max-w-2xl"
        >
          {lyric.subtext}
        </p>
      )}
    </motion.div>
  );
};

/**
 * Panggung Utama Penampil Lirik dengan Dukungan 3D Spasial & Piringan Hitam
 */
export default function LyricStage({
  currentLyric,
  previousLyric,
  nextLyric,
  isPlaying,
  songInfo,
  onPlayPause,
  currentTime = 0,
  duration = 216,
  particleTheme = "pearl",
  customColor = "#00f0ff",
  onOpenParticleColorPicker,
  stageMode = "split", // "split" | "lyrics" | "vinyl"
}) {
  const activeColor = getParticlePrimaryColor(particleTheme, customColor);

  return (
    <div className="relative w-full min-h-[50vh] sm:min-h-[56vh] flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6">
      {/* Dynamic 3D Spatial Light Aura */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 pointer-events-none transition-all duration-1000 -z-10"
        style={{
          background: isPlaying
            ? `radial-gradient(circle, ${activeColor} 0%, rgba(99, 102, 241, 0.3) 50%, transparent 70%)`
            : "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
        }}
      />

      {/* ===================== MODE 1: SPLIT (3D VINYL + KINETIC LYRICS) ===================== */}
      {stageMode === "split" && (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center justify-items-center">
          {/* Kolom Kiri: 3D Vinyl Turntable Interaktif */}
          <div className="lg:col-span-5 w-full flex items-center justify-center">
            <VinylVisualizer3D
              songInfo={songInfo}
              isPlaying={isPlaying}
              onPlayPause={onPlayPause}
              currentTime={currentTime}
              duration={duration}
              themeColor={activeColor}
            />
          </div>

          {/* Kolom Kanan: Tipografi Kinetik 3D */}
          <div className="lg:col-span-7 w-full flex flex-col items-center justify-center relative min-h-[260px]">
            {/* Lirik Sebelumnya (Spatial Depth Tilt) */}
            {previousLyric && (
              <div
                className="hidden sm:block absolute -top-8 w-full text-center pointer-events-none opacity-25 transition-all duration-700"
                style={{
                  transform: "perspective(800px) rotateX(20deg) translateZ(-40px)",
                }}
              >
                <p className="text-sm font-sans line-clamp-1 italic text-slate-400">
                  {previousLyric.text}
                </p>
              </div>
            )}

            {/* Baris Lirik Aktif */}
            <div className="relative z-10 w-full grid grid-cols-1 grid-rows-1 items-center justify-items-center min-h-[160px] sm:min-h-[200px]">
              <AnimatePresence initial={false}>
                {currentLyric ? (
                  <div
                    key={currentLyric.effect === "atomic-particles" ? "atomic-canvas-stage-split" : `lyric-split-${currentLyric.id}`}
                    className="col-start-1 row-start-1 w-full flex items-center justify-center"
                  >
                    <LyricLine
                      lyric={currentLyric}
                      particleTheme={particleTheme}
                      customColor={customColor}
                      onOpenParticleColorPicker={onOpenParticleColorPicker}
                      compact={true}
                    />
                  </div>
                ) : (
                  <motion.div
                    key="empty-split"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-start-1 row-start-1 text-center px-4 max-w-sm"
                  >
                    <div className="inline-flex p-3 rounded-full bg-white/5 border border-white/10 mb-3 animate-pulse">
                      <Activity className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold font-sans text-white mb-1">
                      Panggung 3D Siap
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Klik piringan hitam atau tekan tombol putar untuk memulai visualisasi kinetik.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Lirik Berikutnya (Spatial Depth Tilt) */}
            {nextLyric && (
              <div
                className="hidden sm:block absolute -bottom-8 w-full text-center pointer-events-none opacity-30 transition-all duration-700"
                style={{
                  transform: "perspective(800px) rotateX(-20deg) translateZ(-40px)",
                }}
              >
                <p className="text-xs font-sans line-clamp-1 text-slate-400">
                  <span className="uppercase tracking-wider text-slate-500 mr-2 font-mono">Berikutnya:</span>
                  {nextLyric.text}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== MODE 2: LYRICS ONLY (KINETIC 3D SPATIAL) ===================== */}
      {stageMode === "lyrics" && (
        <div className="w-full max-w-5xl flex flex-col items-center justify-center relative min-h-[300px]">
          {/* Lirik Sebelumnya (Floating Back) */}
          {previousLyric && (
            <div
              className="hidden md:block absolute -top-10 w-full max-w-2xl text-center pointer-events-none opacity-25 transition-all duration-700"
              style={{
                transform: "perspective(1000px) rotateX(22deg) translateZ(-60px)",
              }}
            >
              <p className="text-base sm:text-lg font-sans line-clamp-1 italic text-slate-400">
                {previousLyric.text}
              </p>
            </div>
          )}

          {/* Baris Lirik Aktif */}
          <div className="relative z-10 w-full grid grid-cols-1 grid-rows-1 items-center justify-items-center min-h-[220px] sm:min-h-[280px]">
            <AnimatePresence initial={false}>
              {currentLyric ? (
                <div
                  key={currentLyric.effect === "atomic-particles" ? "atomic-canvas-stage-lyrics" : `lyric-full-${currentLyric.id}`}
                  className="col-start-1 row-start-1 w-full flex items-center justify-center"
                >
                  <LyricLine
                    lyric={currentLyric}
                    particleTheme={particleTheme}
                    customColor={customColor}
                    onOpenParticleColorPicker={onOpenParticleColorPicker}
                    compact={false}
                  />
                </div>
              ) : (
                <motion.div
                  key="empty-lyrics"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-start-1 row-start-1 text-center px-6 max-w-md"
                >
                  <div className="inline-flex p-4 rounded-full bg-white/5 border border-white/10 mb-4 animate-pulse">
                    <Activity className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-sans text-white mb-2">
                    Kinetic Stage Ready
                  </h3>
                  <p className="text-sm text-slate-400">
                    Tekan <span className="text-indigo-300 font-semibold">Play</span> untuk menyaksikan keajaiban animasi tipografi partikel atom dan transisi latar dinamis.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Lirik Berikutnya (Floating Forward) */}
          {nextLyric && (
            <div
              className="hidden md:block absolute -bottom-10 w-full max-w-2xl text-center pointer-events-none opacity-30 transition-all duration-700"
              style={{
                transform: "perspective(1000px) rotateX(-22deg) translateZ(-60px)",
              }}
            >
              <p className="text-sm sm:text-base font-sans line-clamp-1 text-slate-400">
                <span className="text-xs uppercase tracking-wider text-slate-500 mr-2 font-mono">Berikutnya:</span>
                {nextLyric.text}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===================== MODE 3: VINYL ONLY (TURNTABLE IMMERSIVE FOCUS) ===================== */}
      {stageMode === "vinyl" && (
        <div className="w-full flex flex-col items-center justify-center space-y-4">
          <VinylVisualizer3D
            songInfo={songInfo}
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            currentTime={currentTime}
            duration={duration}
            themeColor={activeColor}
            className="scale-105 sm:scale-110"
          />

          {/* Bottom Subtitle Lyric Ribbon for Turntable View */}
          <div className="w-full max-w-xl mx-auto px-4 py-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-center shadow-lg transition-all grid grid-cols-1 grid-rows-1 items-center justify-items-center min-h-[72px]">
            <AnimatePresence initial={false}>
              {currentLyric ? (
                <motion.div
                  key={`ribbon-${currentLyric.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="col-start-1 row-start-1 w-full"
                >
                  <p className="text-base sm:text-lg font-bold text-white tracking-wide">
                    {currentLyric.text}
                  </p>
                  {currentLyric.subtext && (
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      {currentLyric.subtext}
                    </p>
                  )}
                </motion.div>
              ) : (
                <p className="col-start-1 row-start-1 text-xs text-slate-400">Piringan hitam siap diputar</p>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
