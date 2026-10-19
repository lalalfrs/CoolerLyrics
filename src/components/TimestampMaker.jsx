import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Copy,
  Check,
  Clock,
  Sparkles,
  Download,
  Play,
  RotateCcw,
  Sliders,
  Send,
} from "lucide-react";
import { effectPresets } from "../data/lyricsData";

const gradientOptions = [
  { label: "Indigo Midnight", value: "from-indigo-950 via-slate-950 to-black" },
  { label: "Cyan Electric", value: "from-cyan-950 via-slate-900 to-black" },
  { label: "Neon Rose", value: "from-rose-950 via-purple-950 to-black" },
  { label: "Glitch Violet", value: "from-violet-950 via-fuchsia-950 to-black" },
  { label: "Amber Cinematic", value: "from-amber-950 via-stone-950 to-black" },
  { label: "Cosmic Sky", value: "from-blue-950 via-indigo-950 to-black" },
  { label: "Velvet Emerald", value: "from-emerald-950 via-teal-950 to-black" },
  { label: "Fire Orange", value: "from-red-950 via-orange-950 to-black" },
  { label: "Deep Twilight", value: "from-purple-950 via-slate-900 to-black" },
];

const fontStyleOptions = [
  { label: "Modern Sans (Inter)", value: "font-sans font-extrabold text-white" },
  { label: "Brutalist Display (Syne)", value: "font-display font-black uppercase text-rose-300" },
  { label: "Cinematic Serif (Cinzel)", value: "font-serif italic font-normal text-amber-100" },
  { label: "Cyber Monospace (JetBrains)", value: "font-mono font-semibold text-fuchsia-200" },
  { label: "Space Grotesk", value: "font-space font-extrabold text-sky-200" },
];

export default function TimestampMaker({
  isOpen,
  onClose,
  currentTime,
  isPlaying,
  onPlayPause,
  onSeek,
  currentLyrics,
  onApplyCustomLyrics,
}) {
  const [recordedList, setRecordedList] = useState([]);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  // Load active lyrics when modal opens if recorded list is empty
  useEffect(() => {
    if (isOpen && recordedList.length === 0 && currentLyrics) {
      setRecordedList(currentLyrics);
    }
  }, [isOpen, currentLyrics]);

  // Handle Spacebar to mark timestamp when modal is open and focused
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Jika user sedang mengetik di input/textarea, jangan intersep Space
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "SELECT"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        markCurrentTime();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentTime]);

  const markCurrentTime = () => {
    const roundedTime = Math.round(currentTime * 10) / 10;
    const newEntry = {
      id: Date.now(),
      time: roundedTime,
      text: `Lyric at ${roundedTime}s`,
      subtext: "",
      effect: effectPresets[recordedList.length % effectPresets.length].id,
      bgGradient: gradientOptions[recordedList.length % gradientOptions.length].value,
      fontStyle: fontStyleOptions[recordedList.length % fontStyleOptions.length].value,
    };
    // Urutkan berdasarkan waktu
    const updated = [...recordedList, newEntry].sort((a, b) => a.time - b.time);
    setRecordedList(updated);
  };

  const handleUpdateItem = (id, field, value) => {
    setRecordedList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleDeleteItem = (id) => {
    setRecordedList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAdjustTime = (id, delta) => {
    setRecordedList((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, time: Math.max(0, Math.round((item.time + delta) * 10) / 10) }
            : item
        )
        .sort((a, b) => a.time - b.time)
    );
  };

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(recordedList, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToPlayer = () => {
    if (onApplyCustomLyrics && recordedList.length > 0) {
      onApplyCustomLyrics(recordedList);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    }
  };

  const handleDownloadJs = () => {
    const code = `export const customLyrics = ${JSON.stringify(recordedList, null, 2)};\n`;
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customLyrics.js";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl glass-panel border border-white/15 bg-slate-950/90 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Timestamp Maker & Sync Tool
              </h2>
              <p className="text-xs text-slate-400">
                Putar lagu dan tekan <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Space</kbd> atau tombol Mark Time untuk menandai lirik.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Marking Action Bar */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-900/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPlayPause}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-slate-200 transition-all active:scale-95 shadow-md"
            >
              {isPlaying ? <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Pause</span> : <Play className="w-3.5 h-3.5 fill-black" />}
            </button>

            <div className="font-mono text-sm bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 text-indigo-300 font-bold">
              ⏱ {currentTime.toFixed(1)}s
            </div>
          </div>

          {/* Giant Mark Time Button */}
          <button
            type="button"
            onClick={markCurrentTime}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Mark Time ({currentTime.toFixed(1)}s)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyToPlayer}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                applied
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                  : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20"
              }`}
            >
              {applied ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              <span>{applied ? "Terapkan!" : "Terapkan ke Player"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyJson}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                copied
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                  : "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10"
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Tersalin!" : "Copy JSON"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJs}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300"
              title="Download customLyrics.js"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {recordedList.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-40 animate-bounce" />
              <p className="text-base font-medium">Belum ada baris lirik yang ditandai.</p>
              <p className="text-xs text-slate-500 mt-1">
                Tekan tombol "Mark Time" di atas saat pemutaran berjalan.
              </p>
            </div>
          ) : (
            recordedList.map((item, index) => (
              <div
                key={item.id}
                className="p-3 sm:p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all flex flex-col md:flex-row md:items-center gap-3"
              >
                {/* Index & Timestamp Adjuster */}
                <div className="flex items-center gap-2">
                  <span className="w-6 text-xs font-mono text-slate-500">#{index + 1}</span>
                  <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/10">
                    <span className="font-mono text-xs font-bold text-indigo-300 w-12 text-center">
                      {item.time}s
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustTime(item.id, 0.5)}
                        className="px-1 text-[9px] hover:text-indigo-300 text-slate-400"
                        title="+0.5s"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustTime(item.id, -0.5)}
                        className="px-1 text-[9px] hover:text-indigo-300 text-slate-400"
                        title="-0.5s"
                      >
                        ▼
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSeek(item.time)}
                    className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px]"
                    title="Lompat ke detik ini di player"
                  >
                    <Play className="w-3 h-3 fill-indigo-300" />
                  </button>
                </div>

                {/* Lyric Text & Subtext Inputs */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => handleUpdateItem(item.id, "text", e.target.value)}
                    placeholder="Teks lirik utama..."
                    className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-white text-xs sm:text-sm focus:border-indigo-500 outline-none"
                  />
                  <input
                    type="text"
                    value={item.subtext || ""}
                    onChange={(e) => handleUpdateItem(item.id, "subtext", e.target.value)}
                    placeholder="Terjemahan / backing vocal (opsional)..."
                    className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-slate-300 text-xs sm:text-sm focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Preset Effect Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={item.effect}
                    onChange={(e) => handleUpdateItem(item.id, "effect", e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-indigo-300 text-xs font-mono outline-none"
                  >
                    {effectPresets.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name}
                      </option>
                    ))}
                  </select>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 rounded-xl hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                    title="Hapus baris ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40 text-center text-xs text-slate-400">
          💡 Tips: Anda dapat langsung menyunting lirik di atas, klik <span className="text-indigo-300 font-semibold">Terapkan ke Player</span>, dan nikmati hasilnya secara instan tanpa reload!
        </div>
      </div>
    </div>
  );
}
