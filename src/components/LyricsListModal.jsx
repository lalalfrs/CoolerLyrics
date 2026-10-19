import React from "react";
import { X, Play, Sparkles } from "lucide-react";

export default function LyricsListModal({
  isOpen,
  onClose,
  lyrics,
  currentLyricId,
  onSelectLyric,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl glass-panel border border-white/15 bg-slate-950/90 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-white/5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Daftar Baris Lirik & Presets
            </h2>
            <p className="text-xs text-slate-400">
              Klik pada baris lirik untuk melompat langsung ke detik tersebut.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lyrics List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {lyrics.map((item, index) => {
            const isActive = currentLyricId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectLyric(item.time);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 border ${
                  isActive
                    ? "bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                    : "bg-white/[0.02] hover:bg-white/[0.06] border-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-xs px-2 py-1 rounded-md ${
                      isActive
                        ? "bg-indigo-500 text-white font-bold"
                        : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {item.time}s
                  </span>
                  <div>
                    <p
                      className={`text-sm sm:text-base font-semibold ${
                        isActive ? "text-indigo-200" : "text-white"
                      }`}
                    >
                      {item.text}
                    </p>
                    {item.subtext && (
                      <p className="text-xs text-slate-400 font-light mt-0.5">
                        {item.subtext}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-indigo-300">
                    {item.effect}
                  </span>
                  <Play className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400 fill-indigo-400" : "text-slate-500"}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
