import React, { useState, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Volume1,
  Layers,
  Library,
} from "lucide-react";

const formatTime = (seconds = 0) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export default function PlayerControls({
  songInfo,
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onRestart,
  onNextTrack,
  onPrevTrack,
  onSeek,
  volume = 1,
  onVolumeChange,
  isMuted = false,
  onToggleMute,
  onOpenLyricsList,
  onOpenSongLibrary,
  onOpenSpotifyEmbed,
}) {
  const [hoverTime, setHoverTime] = useState(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const progressRef = useRef(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressBarClick = (e) => {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percentage * duration);
  };

  const handleProgressBarMouseMove = (e) => {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, hoverX / rect.width));
    setHoverTime(percentage * duration);
  };

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-40 px-3 sm:px-8 pointer-events-none flex justify-center">
      <div className="pointer-events-auto w-full max-w-3xl glass-panel rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl backdrop-blur-2xl border border-white/10 transition-all duration-300">
        
        {/* Sleek Interactive Seekbar */}
        <div className="relative mb-2.5 sm:mb-3 group py-1">
          <div
            ref={progressRef}
            onClick={handleProgressBarClick}
            onMouseMove={handleProgressBarMouseMove}
            onMouseLeave={() => setHoverTime(null)}
            className="w-full h-2 sm:h-2.5 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer relative overflow-hidden transition-all duration-150"
            role="slider"
            aria-label="Progress bar lagu"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") onSeek(Math.min(duration, currentTime + 5));
              if (e.key === "ArrowLeft") onSeek(Math.max(0, currentTime - 5));
            }}
          >
            {/* Progress Fill with Smooth Ambient Glow */}
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500 rounded-full relative transition-all duration-75 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>

          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-7 transform -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-900 border border-white/20 text-[10px] font-mono text-white pointer-events-none shadow-lg z-20"
              style={{
                left: `${(hoverTime / duration) * 100}%`,
              }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Bottom Playback Row: Minimalist, Balanced, and Non-Crowded */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Time and Song Preview */}
          <div className="flex items-center gap-2 min-w-0 w-28 sm:w-44">
            <div className="font-mono text-xs sm:text-sm text-slate-300 flex items-center gap-1">
              <span className="text-white font-bold">{formatTime(currentTime)}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Center: Playback Controls (Prev, Big Play/Pause, Next) */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={onPrevTrack || onRestart}
              className="p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none"
              title="Putar Ulang atau Lagu Sebelumnya"
              aria-label="Lagu sebelumnya"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            {/* Central Big Play / Pause Button with Spring Bounce */}
            <button
              type="button"
              onClick={onPlayPause}
              className="p-3 sm:p-3.5 rounded-full bg-white text-black hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.35)] focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none"
              title={isPlaying ? "Jeda (Pause)" : "Mulai (Play Musik)"}
              aria-label={isPlaying ? "Jeda lagu" : "Putar lagu"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black" />
              ) : (
                <Play className="w-5 h-5 fill-black translate-x-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={onNextTrack || onRestart}
              className="p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none"
              title="Lagu Berikutnya"
              aria-label="Lagu berikutnya"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>
          </div>

          {/* Right: Volume and Quick Sheets */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 w-28 sm:w-44">
            {/* Volume Control */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                type="button"
                onClick={onToggleMute}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none"
                title={isMuted ? "Bunyikan (Unmute)" : "Senyapkan (Mute)"}
                aria-label={isMuted ? "Bunyikan" : "Senyapkan"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4 text-slate-300" />
                ) : (
                  <Volume2 className="w-4 h-4 text-slate-300" />
                )}
              </button>

              {/* Volume Slider Popover */}
              {showVolumeSlider && (
                <div className="absolute right-0 bottom-10 p-2.5 rounded-xl bg-slate-900 border border-white/20 shadow-xl flex items-center gap-2 z-30 animate-fade-in">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    aria-label="Volume suara"
                    className="w-20 accent-indigo-500 cursor-pointer h-1.5 rounded bg-white/20"
                  />
                  <span className="font-mono text-[10px] text-slate-300 w-6">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Quick Spotify Embed Player Toggle */}
            {songInfo?.spotifyTrackId && (
              <button
                type="button"
                onClick={onOpenSpotifyEmbed}
                className="p-2 rounded-xl text-[#1DB954] hover:bg-[#1DB954]/20 transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#1DB954] outline-none"
                title="Buka Pemutar Spotify Embed"
                aria-label="Buka widget Spotify"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.495 17.299c-.216.353-.674.464-1.026.249-2.812-1.718-6.352-2.107-10.522-1.155-.403.092-.806-.157-.898-.559-.092-.403.158-.806.56-.898 4.567-1.043 8.487-.604 11.637 1.337.352.215.464.673.249 1.026zm1.468-3.262c-.272.441-.853.582-1.294.31-3.218-1.979-8.125-2.55-11.93-1.395-.499.151-1.031-.132-1.182-.631-.151-.499.132-1.031.631-1.182 4.352-1.321 9.771-.683 13.465 1.587.441.272.582.853.31 1.311zm.126-3.413c-3.858-2.291-10.222-2.502-13.887-1.39-.593.18-1.226-.154-1.406-.747-.18-.593.154-1.226.747-1.406 4.215-1.28 11.238-1.036 15.653 1.586.533.316.708 1.009.392 1.542-.316.533-1.009.708-1.542.392z" />
                </svg>
              </button>
            )}

            {/* Quick Lyrics List Drawer Button */}
            <button
              type="button"
              onClick={onOpenLyricsList}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none"
              title="Lihat Daftar Lirik"
              aria-label="Lihat daftar lirik"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Quick Song Library / Playlist Button */}
            <button
              type="button"
              onClick={onOpenSongLibrary}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none"
              title="Koleksi Lagu dan Tambah Musik"
              aria-label="Buka koleksi lagu"
            >
              <Library className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
