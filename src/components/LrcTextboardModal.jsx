import React, { useState, useEffect } from "react";
import {
  X,
  FileCode,
  Sparkles,
  Check,
  Copy,
  Play,
  RotateCcw,
  Sliders,
  Send,
  Music,
  Trash2,
  FileText,
} from "lucide-react";
import { parseLRC } from "../utils/lrcParser";
import { effectPresets } from "../data/lyricsData";
import { hitamDanBiruLrcText } from "../data/playlistData";

export default function LrcTextboardModal({
  isOpen,
  onClose,
  currentSong,
  playlist,
  onApplyLyricsToSong,
  onSwitchSong,
}) {
  const [lrcInput, setLrcInput] = useState("");
  const [selectedEffect, setSelectedEffect] = useState("atomic-particles");
  const [targetSongId, setTargetSongId] = useState(currentSong?.id || "");
  const [previewLines, setPreviewLines] = useState([]);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  // Set target song dan isi lirik bawaan saat modal dibuka
  useEffect(() => {
    if (isOpen && currentSong) {
      setTargetSongId(currentSong.id);
      if (currentSong.rawLrc && !lrcInput) {
        setLrcInput(currentSong.rawLrc);
      }
    }
  }, [isOpen, currentSong]);

  const handleTargetSongChange = (newSongId) => {
    setTargetSongId(newSongId);
    const selected = playlist.find((s) => s.id === newSongId);
    if (selected && selected.rawLrc) {
      setLrcInput(selected.rawLrc);
    }
  };

  // Live parsing setiap kali isi textboard berubah
  useEffect(() => {
    if (!lrcInput.trim()) {
      setPreviewLines([]);
      return;
    }
    const parsed = parseLRC(lrcInput, selectedEffect);
    setPreviewLines(parsed);
  }, [lrcInput, selectedEffect]);

  const handlePasteHitamBiru = () => {
    setLrcInput(hitamDanBiruLrcText);
    const hitamBiruSong = playlist.find((s) => s.id === "barasuara-hitam-dan-biru");
    if (hitamBiruSong) {
      setTargetSongId(hitamBiruSong.id);
    }
  };

  const handlePasteManusiaSumarah = () => {
    setLrcInput(
`[00:01.34] (Kita berubah)
[00:07.57] (Di keadaan yang tak indah)
[00:13.47] (Meniti)
[00:17.70] (Pelan di kegelapan)
[00:25.38] Berhembus
[00:30.63] Siang menuju malam
[00:36.43] Menundukkan matahari dan bulan
[00:46.08] Kita, hidup di bawah tujuh langit dunia
[00:52.98] Kan berputar pada porosnya
[00:56.11] Kita semua
[01:01.30] Dituliskan takdirnya
[01:06.86] Langit, berhias gemintang bintang
[01:13.93] Bertukar pandangan
[01:17.56] Manusia
[01:21.13] Debu dalam semesta`
    );
    const manusiaSong = playlist.find((s) => s.id === "barasuara-manusia-sumarah");
    if (manusiaSong) {
      setTargetSongId(manusiaSong.id);
    }
  };

  const handleApply = () => {
    if (previewLines.length === 0) return;

    if (onApplyLyricsToSong) {
      onApplyLyricsToSong(targetSongId, previewLines, lrcInput);
      setApplied(true);
      setTimeout(() => {
        setApplied(false);
        onClose();
      }, 700);
    }
  };

  const handleCopyParsedJson = () => {
    navigator.clipboard.writeText(JSON.stringify(previewLines, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl glass-panel border border-white/15 bg-slate-950/95 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Textboard Importer LRC & Lirik
              </h2>
              <p className="text-xs text-slate-400">
                Tempel lirik berformat timestamp LRC <code className="text-indigo-300 font-mono">[MM:SS.xx]</code> atau teks biasa.
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

        {/* Configuration Bar: Target Song + Effect & Presets */}
        <div className="p-3.5 bg-black/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Target Song Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Terapkan ke Lagu:</span>
            <select
              value={targetSongId}
              onChange={(e) => handleTargetSongChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-white font-semibold outline-none focus:border-indigo-500"
            >
              {playlist.map((song) => (
                <option key={song.id} value={song.id}>
                  {song.title} — {song.artist} {song.spotifyTrackId ? "🟢 [Spotify]" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Preset Effect Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Gaya Efek:</span>
            <select
              value={selectedEffect}
              onChange={(e) => setSelectedEffect(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-indigo-300 font-mono outline-none focus:border-indigo-500"
            >
              <option value="atomic-particles">Atomic Particles (Font Partikel Halus)</option>
              <option value="apple-blur">Apple Blur (Blur Transisi)</option>
              <option value="wave-chars">Wave Chars (Gelombang 3D)</option>
              <option value="explosive-words">Explosive Words (Hentakan Zoom)</option>
              <option value="glitch-shake">Glitch Shake (Getaran RGB)</option>
              <option value="cinematic-letterbox">Cinematic Letterbox (Pelebaran Huruf)</option>
              <option value="falling-scatter">Falling Scatter (Huruf Jatuh)</option>
              <option value="random">Variasi Acak (Berganti-ganti Efek)</option>
            </select>
          </div>

          {/* Quick Paste Helpers */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePasteHitamBiru}
              className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 font-medium transition-colors"
              title="Isi contoh LRC lagu Hitam Dan Biru"
            >
              Contoh Hitam Dan Biru
            </button>
            <button
              type="button"
              onClick={handlePasteManusiaSumarah}
              className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-medium transition-colors"
              title="Isi contoh LRC lagu Manusia (Sumarah)"
            >
              Contoh Manusia
            </button>
            <button
              type="button"
              onClick={() => setLrcInput("")}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              title="Bersihkan Textboard"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Content: Split View between Textboard & Live Preview */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden min-h-0">
          
          {/* Left: Raw Textboard Input */}
          <div className="flex flex-col p-4 border-b md:border-b-0 md:border-r border-white/10 bg-black/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Papan Teks LRC:
              </span>
              <span className="text-[11px] font-mono text-indigo-400">
                {lrcInput.split("\n").filter((l) => l.trim()).length} baris teks
              </span>
            </div>

            <textarea
              value={lrcInput}
              onChange={(e) => setLrcInput(e.target.value)}
              placeholder="Paste lirik format LRC di sini, contoh:&#10;[00:23.10] Di batas petang aku akan datang&#10;[00:30.84] Bawa berita kurang menyenangkan&#10;[00:38.45] Tentang hidupku tentang hidupmu..."
              rows={14}
              className="flex-1 w-full p-3.5 rounded-2xl bg-black/50 border border-white/10 text-white font-mono text-xs sm:text-sm focus:border-indigo-500 outline-none leading-relaxed resize-none selection:bg-indigo-600"
            />
          </div>

          {/* Right: Live Parsed Preview */}
          <div className="flex flex-col p-4 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Hasil Parsing ({previewLines.length} baris sinkron):
              </span>
              <button
                type="button"
                onClick={handleCopyParsedJson}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                title="Salin hasil JSON"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Tersalin" : "Copy JSON"}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[360px] md:max-h-none">
              {previewLines.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <FileText className="w-10 h-10 mb-2 opacity-30 animate-pulse" />
                  <p className="text-xs">
                    Tempel lirik pada kolom di sebelah kiri untuk melihat hasil konversi waktu & efek secara langsung.
                  </p>
                </div>
              ) : (
                previewLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between gap-2 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[11px] text-indigo-300 font-bold bg-indigo-500/15 px-2 py-0.5 rounded flex-shrink-0">
                        {line.time}s
                      </span>
                      <span className="text-slate-200 font-medium truncate">
                        {line.text}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-1.5 py-0.5 rounded flex-shrink-0">
                      {line.effect}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 bg-white/5 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 hidden sm:block">
            💡 Sistem otomatis menghitung menit, detik, dan milidetik menjadi sinkronisasi presisi 60fps.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={previewLines.length === 0}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all active:scale-95 ${
                previewLines.length === 0
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : applied
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-indigo-600/30"
              }`}
            >
              {applied ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>{applied ? "Lirik Berhasil Diterapkan!" : "Terapkan ke Pemutar Sekarang"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
