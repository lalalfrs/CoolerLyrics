import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import SplitType from "split-type";
import { Sparkles, Activity, Atom, Palette } from "lucide-react";
import ParticleTypography from "./ParticleTypography";
import { getParticlePrimaryColor } from "../data/particleColors";

/**
 * Komponen satu baris lirik individual.
 * Memisahkan lifecycle tiap baris agar SplitType dan GSAP terisolasi dan mudah di-cleanup.
 */
const LyricLine = ({ lyric, particleTheme = "pearl", customColor = "#00f0ff", onOpenParticleColorPicker }) => {
  const textRef = useRef(null);
  const subtextRef = useRef(null);
  const splitRef = useRef(null);
  const activeParticleColor = getParticlePrimaryColor(particleTheme, customColor);

  useEffect(() => {
    if (!lyric || lyric.effect === "atomic-particles" || !textRef.current) return;

    const effect = lyric.effect;
    let ctx = gsap.context(() => {
      // 1. APPLE-BLUR dikelola khusus melalui Framer Motion di wrapper,
      // tetapi kita tetap bisa memberikan sentuhan halus pada subtext.
      if (effect === "apple-blur") {
        if (subtextRef.current) {
          gsap.fromTo(
            subtextRef.current,
            { opacity: 0, y: 15, filter: "blur(6px)" },
            { opacity: 0.8, y: 0, filter: "blur(0px)", duration: 0.8, delay: 0.25, ease: "power2.out" }
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

      // 2. WAVE-CHARS (GSAP + SplitType chars)
      // Huruf muncul satu per satu dari bawah bergelombang
      if (effect === "wave-chars") {
        gsap.set(textRef.current, { perspective: 1000 });
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

      // 3. EXPLOSIVE-WORDS (GSAP + SplitType words)
      // Kata muncul dengan efek zoom-out menghentak dari ukuran besar
      else if (effect === "explosive-words") {
        gsap.fromTo(
          split.words,
          {
            scale: 2.5,
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

      // 4. GLITCH-SHAKE (GSAP + CSS)
      // Teks muncul dengan getaran cepat acak dan bayangan warna RGB split lalu stabil
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
            x: gsap.utils.random(-9, 9),
            y: gsap.utils.random(-7, 7),
            skewX: gsap.utils.random(-5, 5),
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

      // 5. CINEMATIC-LETTERBOX (GSAP + SplitType chars)
      // Teks muncul perlahan sambil jarak antar huruf melebar dramatis
      else if (effect === "cinematic-letterbox") {
        gsap.fromTo(
          textRef.current,
          {
            letterSpacing: "-0.05em",
            opacity: 0,
            filter: "blur(8px)",
          },
          {
            letterSpacing: "0.22em",
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.6,
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

      // 6. FALLING-SCATTER (GSAP + SplitType chars)
      // Huruf-huruf jatuh dari atas dengan rotasi acak lalu tersusun rapi
      else if (effect === "falling-scatter") {
        gsap.fromTo(
          split.chars,
          {
            y: -140,
            opacity: 0,
            rotation: () => gsap.utils.random(-35, 35),
            scale: 0.5,
            filter: "blur(6px)",
          },
          {
            y: 0,
            opacity: 1,
            rotation: 0,
            scale: 1,
            filter: "blur(0px)",
            stagger: {
              amount: 0.7,
              from: "random",
            },
            duration: 0.95,
            ease: "bounce.out",
          }
        );
      }

      // Subtext fade in untuk semua efek non-apple
      if (subtextRef.current) {
        gsap.fromTo(
          subtextRef.current,
          { opacity: 0, y: 15 },
          { opacity: 0.75, y: 0, duration: 0.6, delay: 0.35, ease: "power2.out" }
        );
      }
    });

    return () => {
      ctx.revert();
      if (splitRef.current) {
        splitRef.current.revert();
        splitRef.current = null;
      }
    };
  }, [lyric?.id, lyric?.effect]);

  if (!lyric) {
    return (
      <div className="text-center px-4">
        <p className="text-xl md:text-2xl text-slate-500 font-sans tracking-wide">
          Tekan tombol Play untuk memulai pertunjukan kinetic...
        </p>
      </div>
    );
  }

  // KHUSUS GAYA PARTIKEL ATOM (Canvas Morphing Animation dengan Transisi Vertikal Atas-Bawah)
  if (lyric.effect === "atomic-particles") {
    return (
      <motion.div
        key={`atomic-node-${lyric.id}`}
        initial={{ opacity: 0, y: 40, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -40, filter: "blur(5px)" }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mx-auto px-4 py-1 flex flex-col items-center justify-center text-center select-none -translate-y-2 sm:-translate-y-4"
      >
        {/* Badge Efek Atomic Particles dengan warna elegan & tombol ganti warna */}
        <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider glass-pill text-slate-300 border border-white/15 bg-white/[0.04] shadow-md">
          <Atom className="w-3.5 h-3.5 text-slate-300 animate-spin" style={{ animationDuration: "8s" }} />
          <span className="font-medium tracking-wide">Atomic Particles</span>
          <span className="text-white/30">•</span>
          
          <button
            type="button"
            onClick={onOpenParticleColorPicker}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-[11px] text-white border border-white/15 hover:scale-105 active:scale-95"
            title="Klik untuk mengubah warna partikel atom"
          >
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm"
              style={{ backgroundColor: activeParticleColor }}
            />
            <span className="text-[10px] text-slate-200 capitalize">
              {particleTheme === "custom" ? "Custom" : particleTheme.replace("-", " ")}
            </span>
          </button>
        </div>

        {/* Canvas Engine Teks Partikel Atom */}
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

  // Khusus efek apple-blur kita berikan variants Framer Motion
  const isAppleBlur = lyric.effect === "apple-blur";
  const appleVariants = {
    initial: { opacity: 0, y: 60, filter: "blur(18px)" },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      opacity: 0,
      y: -50,
      filter: "blur(18px)",
      transition: { duration: 0.45, ease: "easeInOut" },
    },
  };

  const defaultVariants = {
    initial: { opacity: 1 },
    exit: {
      opacity: 0,
      y: -30,
      filter: "blur(10px)",
      scale: 0.98,
      transition: { duration: 0.4, ease: "easeIn" },
    },
  };

  return (
    <motion.div
      key={`lyric-node-${lyric.id}`}
      variants={isAppleBlur ? appleVariants : defaultVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-5xl mx-auto px-6 py-4 flex flex-col items-center justify-center text-center perspective-container select-none -translate-y-2 sm:-translate-y-6"
    >
      {/* Efek Indicator Pill di atas lirik */}
      <div className="flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider glass-pill text-white/70">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: "8s" }} />
        <span>{lyric.effect}</span>
        <span className="text-white/30">•</span>
        <span className="text-indigo-300 font-medium">{lyric.time}s</span>
      </div>

      {/* Main Lyric Text Heading */}
      <div className="w-full overflow-visible py-3">
        <h1
          ref={textRef}
          className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight sm:leading-none tracking-tight font-extrabold transition-all duration-300 drop-shadow-2xl ${
            lyric.fontStyle || "font-sans text-white"
          }`}
          style={{ wordBreak: "break-word" }}
        >
          {lyric.text}
        </h1>
      </div>

      {/* Optional Subtext / Translation */}
      {lyric.subtext && (
        <p
          ref={subtextRef}
          className="mt-4 sm:mt-6 text-sm sm:text-base md:text-xl font-sans font-light tracking-wide text-slate-300/80 max-w-2xl"
        >
          {lyric.subtext}
        </p>
      )}
    </motion.div>
  );
};

/**
 * Panggung Utama Penampil Lirik
 */
export default function LyricStage({
  currentLyric,
  previousLyric,
  nextLyric,
  isPlaying,
  particleTheme = "pearl",
  customColor = "#00f0ff",
  onOpenParticleColorPicker,
}) {
  return (
    <div className="relative w-full min-h-[48vh] sm:min-h-[52vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient Radial Aura di belakang lirik */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-25 pointer-events-none transition-all duration-1000 -z-10"
        style={{
          background: isPlaying
            ? "radial-gradient(circle, rgba(0, 243, 255, 0.4) 0%, rgba(147, 51, 234, 0.3) 50%, transparent 70%)"
            : "radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
        }}
      />

      {/* Baris Lirik Sebelumnya (Faded Out Preview) */}
      <div className="hidden md:block absolute top-6 sm:top-8 w-full max-w-3xl text-center px-4 pointer-events-none transition-all duration-700 opacity-20">
        {previousLyric && (
          <p className="text-base sm:text-lg font-sans line-clamp-1 italic text-slate-400">
            {previousLyric.text}
          </p>
        )}
      </div>

      {/* Main Kinetic Typography Stage dengan AnimatePresence */}
      <div className="relative z-10 w-full flex items-center justify-center min-h-[220px]">
        <AnimatePresence mode="wait">
          {currentLyric ? (
            <LyricLine
              key={currentLyric.id}
              lyric={currentLyric}
              particleTheme={particleTheme}
              customColor={customColor}
              onOpenParticleColorPicker={onOpenParticleColorPicker}
            />
          ) : (
            <motion.div
              key="empty-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center px-6 max-w-md"
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

      {/* Baris Lirik Berikutnya (Up Next subtle preview) */}
      <div className="hidden md:block absolute bottom-6 sm:bottom-8 w-full max-w-3xl text-center px-4 pointer-events-none transition-all duration-700 opacity-25">
        {nextLyric && (
          <p className="text-sm sm:text-base font-sans line-clamp-1 text-slate-400">
            <span className="text-xs uppercase tracking-wider text-slate-500 mr-2">Berikutnya:</span>
            {nextLyric.text}
          </p>
        )}
      </div>
    </div>
  );
}
