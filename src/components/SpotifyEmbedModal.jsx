import React, { useState } from "react";
import {
  X,
  ExternalLink,
  Music,
  Volume2,
  Sparkles,
  Disc,
  Radio,
  Plus,
  Loader2,
  Play,
  Upload,
} from "lucide-react";
import {
  extractSpotifyTrackId,
  fetchSpotifyMetadata,
  buildSpotifyEmbedUrl,
  buildSpotifyTrackUrl,
} from "../utils/spotifyHelper";
import { parseLRC } from "../utils/lrcParser";

export default function SpotifyEmbedModal({
  isOpen,
  onClose,
  songInfo,
  embedUrl = "https://open.spotify.com/embed/track/5MtVEg8pDiR6jJHmyKYSKY?utm_source=generator&si=a7a72be2b4694fb6",
  trackUrl = "https://open.spotify.com/track/5MtVEg8pDiR6jJHmyKYSKY",
  onPlayPreview,
  isPreviewPlaying,
  onAddNewSong,
}) {
  const [activeTab, setActiveTab] = useState("player"); // 'player' | 'add'
  const [isDocked, setIsDocked] = useState(false);

  // Form State for Adding New Song via Embed
  const [spotifyInput, setSpotifyInput] = useState("");
  const [spotifyMeta, setSpotifyMeta] = useState(null);
  const [isFetchingSpotify, setIsFetchingSpotify] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const currentEmbedUrl = songInfo?.spotifyEmbedUrl || embedUrl;
  const currentTrackUrl = songInfo?.spotifyTrackId
    ? buildSpotifyTrackUrl(songInfo.spotifyTrackId)
    : trackUrl;

  const handleFetch = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!spotifyInput.trim()) {
      setErrorMsg("Mohon masukkan kode embed atau URL lagu Spotify.");
      return;
    }

    setIsFetchingSpotify(true);
    try {
      const meta = await fetchSpotifyMetadata(spotifyInput);
      setSpotifyMeta(meta);
      setSuccessMsg(`Terdeteksi: "${meta.title}" oleh ${meta.artist}`);
    } catch (err) {
      setErrorMsg(err.message || "Gagal mendeteksi lagu Spotify.");
    } finally {
      setIsFetchingSpotify(false);
    }
  };

  const handleSaveAndPlay = (e) => {
    e.preventDefault();
    if (!spotifyMeta && !extractSpotifyTrackId(spotifyInput)) {
      setErrorMsg("Harap masukkan kode embed yang valid.");
      return;
    }

    const trackId = spotifyMeta?.trackId || extractSpotifyTrackId(spotifyInput);
    const title = spotifyMeta?.title || "Spotify Track";
    const artist = spotifyMeta?.artist || "Spotify";
    const cover = spotifyMeta?.coverArt || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300";
    const finalEmbedUrl = spotifyMeta?.embedUrl || buildSpotifyEmbedUrl(trackId);

    const initialLyrics = parseLRC(
      `[00:01.00] ${title} — ${artist}\n[00:07.00] Memutar dari Spotify Embed\n[00:15.00] Buka menu Textboard LRC untuk menempelkan lirik lagu lengkap`
    );

    const newSong = {
      id: "spotify-" + trackId + "-" + Date.now(),
      title,
      artist,
      album: "Spotify Embed",
      duration: 216,
      coverArt: cover,
      spotifyTrackId: trackId,
      spotifyEmbedUrl: finalEmbedUrl,
      audioSrc: "/audio/Manusia(Sumarah).mp3",
      lyrics: initialLyrics,
      isSpotify: true,
      isCustom: true,
    };

    if (onAddNewSong) {
      onAddNewSong(newSong);
    }

    setSuccessMsg("Lagu berhasil ditambahkan ke playlist!");
    setTimeout(() => {
      setActiveTab("player");
      setSpotifyInput("");
      setSpotifyMeta(null);
      setSuccessMsg("");
    }, 700);
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isDocked
          ? "bottom-24 right-4 sm:right-6 w-80 sm:w-96 shadow-2xl animate-slide-up"
          : "inset-0 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      }`}
    >
      <div
        className={`relative w-full rounded-3xl glass-panel border border-[#1DB954]/30 bg-slate-950/95 shadow-2xl overflow-hidden flex flex-col ${
          isDocked ? "max-h-[480px]" : "max-w-lg"
        }`}
      >
        {/* Header with Spotify Brand Green */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/10 bg-gradient-to-r from-[#1DB954]/15 via-transparent to-transparent">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg shadow-[#1DB954]/30 flex-shrink-0">
              <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.495 17.299c-.216.353-.674.464-1.026.249-2.812-1.718-6.352-2.107-10.522-1.155-.403.092-.806-.157-.898-.559-.092-.403.158-.806.56-.898 4.567-1.043 8.487-.604 11.637 1.337.352.215.464.673.249 1.026zm1.468-3.262c-.272.441-.853.582-1.294.31-3.218-1.979-8.125-2.55-11.93-1.395-.499.151-1.031-.132-1.182-.631-.151-.499.132-1.031.631-1.182 4.352-1.321 9.771-.683 13.465 1.587.441.272.582.853.31 1.311zm.126-3.413c-3.858-2.291-10.222-2.502-13.887-1.39-.593.18-1.226-.154-1.406-.747-.18-.593.154-1.226.747-1.406 4.215-1.28 11.238-1.036 15.653 1.586.533.316.708 1.009.392 1.542-.316.533-1.009.708-1.542.392z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 truncate">
                Spotify Embed Player
              </h3>
              <p className="text-[11px] text-[#1DB954] font-mono truncate">
                {songInfo?.artist ? `${songInfo.artist} — ${songInfo.title}` : "Barasuara — Manusia (Sumarah)"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setIsDocked(!isDocked)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs transition-colors"
              title={isDocked ? "Perbesar Modal" : "Perkecil (Docking)"}
            >
              {isDocked ? "🗖" : "🗕"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector: Player vs Add Song */}
        <div className="flex border-b border-white/10 bg-black/40 px-4 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("player")}
            className={`py-2 px-3 font-semibold border-b-2 transition-all ${
              activeTab === "player"
                ? "border-[#1DB954] text-[#1DB954]"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Pemutar Lagu Aktif
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`py-2 px-3 font-semibold border-b-2 transition-all flex items-center gap-1 ${
              activeTab === "add"
                ? "border-[#1DB954] text-[#1DB954]"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Lagu via Embed</span>
          </button>
        </div>

        {/* Tab 1: Current Player */}
        {activeTab === "player" && (
          <>
            <div className="p-3 bg-black/40">
              <iframe
                data-testid="embed-iframe"
                style={{ borderRadius: "16px" }}
                src={currentEmbedUrl}
                width="100%"
                height={isDocked ? "232" : "352"}
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify Embed Player"
              />
            </div>

            <div className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onPlayPreview}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isPreviewPlaying
                    ? "bg-red-500/20 text-red-300 border border-red-500/40"
                    : "bg-[#1DB954]/20 text-[#1DB954] hover:bg-[#1DB954]/30 border border-[#1DB954]/40"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isPreviewPlaying ? "Stop Audio Lokal" : "Play Audio Sinkron"}</span>
              </button>

              <a
                href={currentTrackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                <span>Buka di Spotify</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </>
        )}

        {/* Tab 2: Add New Song via Spotify Embed */}
        {activeTab === "add" && (
          <form onSubmit={handleSaveAndPlay} className="p-4 space-y-3 overflow-y-auto max-h-[420px]">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs">
                ✓ {successMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tempel Kode Embed Iframe atau Link Lagu Spotify:
              </label>
              <textarea
                value={spotifyInput}
                onChange={(e) => setSpotifyInput(e.target.value)}
                placeholder="Contoh:&#10;<iframe src='https://open.spotify.com/embed/track/5MtVEg8pDiR6jJHmyKYSKY...' ...></iframe>&#10;Atau https://open.spotify.com/track/..."
                rows={3}
                required
                className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-[#1DB954] outline-none leading-relaxed resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleFetch}
              disabled={isFetchingSpotify || !spotifyInput.trim()}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              {isFetchingSpotify ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1DB954]" />
                  <span>Mengambil Data Spotify...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#1DB954]" />
                  <span>Ambil Data Otomatis</span>
                </>
              )}
            </button>

            {spotifyMeta && (
              <div className="p-3 rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/30 flex items-center gap-3">
                <img
                  src={spotifyMeta.coverArt}
                  alt={spotifyMeta.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">
                    {spotifyMeta.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 truncate">
                    {spotifyMeta.artist}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-xs shadow-lg shadow-[#1DB954]/25 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Simpan ke Playlist & Putar Sekarang</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
