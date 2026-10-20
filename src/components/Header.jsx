import React, { useState } from "react";
import {
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Layers,
  HelpCircle,
  Music,
  Library,
  MoreVertical,
  ChevronDown,
  FileCode,
  Palette,
  Disc3,
  Sparkles,
} from "lucide-react";
import { effectPresets } from "../data/lyricsData";
import { getParticlePrimaryColor } from "../data/particleColors";

export default function Header({
  songInfo,
  isPlaying,
  currentLyric,
  onSelectPresetEffect,
  onOpenLyricsList,
  onOpenTimestampMaker,
  onOpenSpotifyEmbed,
  onOpenSongLibrary,
  onOpenTextboard,
  particleTheme = "pearl",
  customColor = "#00f0ff",
  onOpenParticleColorPicker,
  stageMode = "split",
  onSelectStageMode,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEffectsMenu, setShowEffectsMenu] = useState(false);

  const activeParticleColor = getParticlePrimaryColor(particleTheme, customColor);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <>
      <header className="relative z-30 w-full px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-xl">
        
        {/* Left: Song Meta and Quick Song Library Trigger */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Spinning Vinyl Album Art */}
          <button
            type="button"
            onClick={onOpenSongLibrary}
            className="group relative w-9 h-9 sm:w-11 sm:h-11 rounded-full p-0.5 bg-gradient-to-tr from-emerald-500 via-indigo-500 to-rose-500 shadow-lg flex-shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none"
            title="Klik untuk membuka daftar lagu"
            aria-label="Pilih lagu"
          >
            <div
              className={`w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center border border-white/20 transition-transform ${
                isPlaying ? "animate-spin" : ""
              }`}
              style={{ animationDuration: "8s" }}
            >
              <img
                src={songInfo?.coverArt || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150"}
                alt={songInfo?.title || "Album Art"}
                className="w-full h-full object-cover rounded-full opacity-90 group-hover:scale-110 transition-transform"
              />
            </div>
          </button>

          {/* Title & Artist with Song Switcher Dropdown */}
          <div
            onClick={onOpenSongLibrary}
            className="cursor-pointer group min-w-0 flex flex-col justify-center"
            title="Buka daftar lagu"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenSongLibrary();
              }
            }}
          >
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate group-hover:text-indigo-300 transition-colors">
                {songInfo?.title || "Manusia (Sumarah)"}
              </h1>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-300 transition-transform flex-shrink-0" />
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {songInfo?.artist || "Barasuara"}
            </p>
          </div>
        </div>

        {/* Center: Stage Presentation Mode Switcher (Dual 3D / Lirik / Piringan) */}
        <div className="hidden md:flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/10 text-xs shadow-inner">
          <button
            type="button"
            onClick={() => onSelectStageMode && onSelectStageMode("split")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              stageMode === "split"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            title="Tampilan Panggung Dual: Piringan Hitam 3D dan Lirik Kinetik"
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span>Dual 3D</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectStageMode && onSelectStageMode("lyrics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              stageMode === "lyrics"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            title="Tampilan Fokus Lirik 3D Spasial"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Lirik 3D</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectStageMode && onSelectStageMode("vinyl")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              stageMode === "vinyl"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            title="Tampilan Fokus Meja Putar Piringan Hitam 3D"
          >
            <Music className="w-3.5 h-3.5" />
            <span>Piringan 3D</span>
          </button>
        </div>

        {/* Right Tools: Minimalist and Purposeful Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Library / Songs Playlist Button */}
          <button
            type="button"
            onClick={onOpenSongLibrary}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none"
            title="Koleksi Lagu dan Tambah Musik"
          >
            <Library className="w-4 h-4 text-indigo-400" />
            <span className="hidden lg:inline font-medium text-xs">Lagu</span>
          </button>

          {/* Textboard LRC Button */}
          <button
            type="button"
            onClick={onOpenTextboard}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none"
            title="Buka Textboard LRC Importer"
          >
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Textboard LRC</span>
          </button>

          {/* Quick Style / Effect Picker Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEffectsMenu(!showEffectsMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none"
              title="Pilih Gaya Efek Tipografi"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="hidden xl:inline font-medium text-xs">
                {currentLyric?.effect ? currentLyric.effect.replace("-", " ") : "Efek"}
              </span>
            </button>

            {/* Effects Popover Menu */}
            {showEffectsMenu && (
              <div
                className="absolute right-0 top-10 w-56 rounded-2xl p-2 bg-slate-950/95 border border-white/15 shadow-2xl backdrop-blur-xl z-50 animate-fade-in"
                onMouseLeave={() => setShowEffectsMenu(false)}
              >
                <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1">
                  Pilih Preset Efek:
                </div>
                {effectPresets.map((preset) => {
                  const isActive = currentLyric?.effect === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onSelectPresetEffect(preset.id);
                        setShowEffectsMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                        isActive
                          ? "bg-indigo-600 text-white font-semibold shadow-md"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{preset.name}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Particle Color Picker Button */}
          <button
            type="button"
            onClick={onOpenParticleColorPicker}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none"
            title="Pilih Warna Partikel Atom"
          >
            <Palette className="w-4 h-4 text-pink-400" />
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm"
              style={{ backgroundColor: activeParticleColor }}
            />
            <span className="hidden lg:inline font-medium text-xs">Warna</span>
          </button>

          {/* Spotify Official Player Button */}
          <button
            type="button"
            onClick={onOpenSpotifyEmbed}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1DB954]/15 hover:bg-[#1DB954]/25 border border-[#1DB954]/40 text-[#1DB954] text-xs font-semibold transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-[#1DB954] outline-none"
            title="Buka Widget Spotify"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.495 17.299c-.216.353-.674.464-1.026.249-2.812-1.718-6.352-2.107-10.522-1.155-.403.092-.806-.157-.898-.559-.092-.403.158-.806.56-.898 4.567-1.043 8.487-.604 11.637 1.337.352.215.464.673.249 1.026zm1.468-3.262c-.272.441-.853.582-1.294.31-3.218-1.979-8.125-2.55-11.93-1.395-.499.151-1.031-.132-1.182-.631-.151-.499.132-1.031.631-1.182 4.352-1.321 9.771-.683 13.465 1.587.441.272.582.853.31 1.311zm.126-3.413c-3.858-2.291-10.222-2.502-13.887-1.39-.593.18-1.226-.154-1.406-.747-.18-.593.154-1.226.747-1.406 4.215-1.28 11.238-1.036 15.653 1.586.533.316.708 1.009.392 1.542-.316.533-1.009.708-1.542.392z" />
            </svg>
            <span className="hidden sm:inline">Spotify</span>
          </button>

          {/* More Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none"
              title="Menu Lainnya"
              aria-label="Buka menu pengaturan lainnya"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div
                className="absolute right-0 top-10 w-48 rounded-2xl p-1.5 bg-slate-950/95 border border-white/15 shadow-2xl backdrop-blur-xl z-50 animate-fade-in"
                onMouseLeave={() => setShowMoreMenu(false)}
              >
                {/* Mobile Stage Selector */}
                <div className="md:hidden border-b border-white/10 pb-1 mb-1">
                  <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Mode Tampilan:
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectStageMode) onSelectStageMode("split");
                      setShowMoreMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 ${
                      stageMode === "split" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <Disc3 className="w-3.5 h-3.5" />
                    <span>Dual 3D</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectStageMode) onSelectStageMode("lyrics");
                      setShowMoreMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 ${
                      stageMode === "lyrics" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Lirik 3D</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectStageMode) onSelectStageMode("vinyl");
                      setShowMoreMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 ${
                      stageMode === "vinyl" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Piringan 3D</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onOpenTextboard();
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-indigo-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                >
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold">Textboard LRC</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenParticleColorPicker();
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-pink-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                >
                  <Palette className="w-4 h-4 text-pink-400" />
                  <span className="font-semibold">Warna Partikel</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenLyricsList();
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Daftar Lirik</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenTimestampMaker();
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                  <span>Timestamp Tool</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleFullscreen();
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span>{isFullscreen ? "Keluar Fullscreen" : "Layar Penuh"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowInfo(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/10 hover:text-white flex items-center gap-2 border-t border-white/10 mt-1 pt-1.5"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Tentang Aplikasi</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Info Tech Stack Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl glass-panel p-6 border border-white/20 bg-slate-950/95 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Disc3 className="w-4 h-4 text-indigo-400" />
                Kinetic Lyrics Player 3D
              </h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Pemutar lirik berbasis waktu dengan animasi tipografi kinetik (Kinetic Typography) bergaya video musik sinematik dan piringan hitam 3D interaktif.
              </p>
              
              <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/10 text-xs">
                <div><strong className="text-white">Dukungan Lagu:</strong> Multi-lagu album <em>Jalaran Sadrah</em>, impor MP3 lokal ke database SQLite, dan sinkronisasi Spotify.</div>
                <div><strong className="text-white">Visualisasi 3D:</strong> Three.js turntable dengan pantulan cahaya alur alur piringan hitam, partikel spasial, dan arm jarum dinamis.</div>
                <div><strong className="text-white">Gaya Tipografi:</strong> Atomic Particles (Canvas), Apple Blur, Wave Chars 3D, Explosive Words, Glitch Shake, Cinematic Letterbox, dan Falling Scatter.</div>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
