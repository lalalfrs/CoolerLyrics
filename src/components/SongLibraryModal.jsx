import React, { useState, useRef } from "react";
import {
  X,
  Music,
  Plus,
  Play,
  Upload,
  FileText,
  Sparkles,
  Check,
  Trash2,
  Disc3,
  Clock,
  Layers,
  ExternalLink,
  Loader2,
  Link2,
  Radio,
} from "lucide-react";
import { parseLRC } from "../utils/lrcParser";
import { effectPresets } from "../data/lyricsData";
import {
  extractSpotifyTrackId,
  fetchSpotifyMetadata,
  buildSpotifyEmbedUrl,
  buildSpotifyTrackUrl,
} from "../utils/spotifyHelper";

export default function SongLibraryModal({
  isOpen,
  onClose,
  playlist,
  currentSongId,
  onSelectSong,
  onAddNewSong,
  onDeleteSong,
  onOpenTextboard,
}) {
  const [activeTab, setActiveTab] = useState("library"); // 'library' | 'add' | 'spotify'

  // Standard File/Manual Add Form State
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [lrcContent, setLrcContent] = useState("");
  const [defaultEffect, setDefaultEffect] = useState("atomic-particles");
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState("");

  // Spotify Embed Importer Form State
  const [spotifyInput, setSpotifyInput] = useState("");
  const [spotifyMeta, setSpotifyMeta] = useState(null);
  const [isFetchingSpotify, setIsFetchingSpotify] = useState(false);
  const [spotifyTitle, setSpotifyTitle] = useState("");
  const [spotifyArtist, setSpotifyArtist] = useState("");
  const [spotifyLrcContent, setSpotifyLrcContent] = useState("");
  const [spotifyDefaultEffect, setSpotifyDefaultEffect] = useState("atomic-particles");
  const [spotifyAudioFile, setSpotifyAudioFile] = useState(null);
  const [spotifyAudioFileName, setSpotifyAudioFileName] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const spotifyFileInputRef = useRef(null);

  if (!isOpen) return null;

  // Audio Upload Handlers
  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioFileName(file.name);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSpotifyAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSpotifyAudioFile(file);
      setSpotifyAudioFileName(file.name);
    }
  };

  // Helper Sample LRC
  const handlePasteSampleLRC = () => {
    setLrcContent(
`[00:01.50] Di keheningan malam yang sunyi
[00:06.00] Melangkah menembus bayangan semesta
[00:12.00] Menatap bintang yang tak lagi berpendar
[00:18.50] Dan kita tersadar di ujung perjalanan
[00:25.00] NYALAKAN KEMBALI API HARAPAN!
[00:32.00] Dan waktu kan mengalir abadi...`
    );
  };

  // 1. Simpan Lagu Manual / File Audio Permanen ke SQLite
  const handleSaveSong = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!title.trim()) {
      setErrorMsg("Mohon isi judul lagu.");
      return;
    }

    if (!lrcContent.trim()) {
      setErrorMsg("Mohon masukkan lirik atau format LRC.");
      return;
    }

    const parsedLyrics = parseLRC(lrcContent, defaultEffect);
    if (parsedLyrics.length === 0) {
      setErrorMsg("Gagal mem-parsing lirik. Pastikan ada teks lirik.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddNewSong({
        title: title.trim(),
        artist: artist.trim() || "Artis Pilihan",
        album: album.trim() || "Single",
        duration: Math.ceil(parsedLyrics[parsedLyrics.length - 1].time + 6),
        coverArt: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
        audioFile: audioFile,
        audioSrc: audioFile ? undefined : "/audio/Manusia(Sumarah).mp3",
        lyrics: parsedLyrics,
        rawLrc: lrcContent,
        isCustom: true,
      });

      setSuccessMsg("Lagu berhasil disimpan ke database SQLite dan dimuat!");

      setTimeout(() => {
        setActiveTab("library");
        setTitle("");
        setArtist("");
        setAlbum("");
        setLrcContent("");
        setAudioFile(null);
        setAudioFileName("");
        setSuccessMsg("");
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan lagu ke database SQLite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Deteksi Metadata Spotify via oEmbed
  const handleFetchSpotify = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!spotifyInput.trim()) {
      setErrorMsg("Mohon masukkan kode embed iframe atau link lagu Spotify terlebih dahulu.");
      return;
    }

    setIsFetchingSpotify(true);
    try {
      const meta = await fetchSpotifyMetadata(spotifyInput);
      setSpotifyMeta(meta);
      setSpotifyTitle(meta.title);
      setSpotifyArtist(meta.artist);

      if (!spotifyLrcContent) {
        setSpotifyLrcContent(
`[00:01.00] ${meta.title}
[00:07.00] Lagu Spotify siap diputar
[00:14.00] Tempel lirik LRC lengkap di menu Textboard LRC`
        );
      }
      setSuccessMsg(`Berhasil mendeteksi lagu: "${meta.title}" oleh ${meta.artist}!`);
    } catch (err) {
      setErrorMsg(err.message || "Gagal mendeteksi lagu Spotify. Periksa format kode embed Anda.");
    } finally {
      setIsFetchingSpotify(false);
    }
  };

  const handlePasteSpotifySample = (type) => {
    if (type === "manusia") {
      setSpotifyInput(
        `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/5MtVEg8pDiR6jJHmyKYSKY?utm_source=generator&si=a7a72be2b4694fb6" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`
      );
    } else {
      setSpotifyInput(
        `https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp`
      );
    }
  };

  // 3. Simpan Lagu dari Spotify Embed ke SQLite
  const handleSaveSpotifySong = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const trackId = spotifyMeta?.trackId || extractSpotifyTrackId(spotifyInput);
    if (!trackId) {
      setErrorMsg("Harap masukkan kode embed atau link Spotify yang valid.");
      return;
    }

    const finalTitle = spotifyTitle.trim() || spotifyMeta?.title || "Spotify Track";
    const finalArtist = spotifyArtist.trim() || spotifyMeta?.artist || "Spotify Artist";
    const finalCover = spotifyMeta?.coverArt || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300";
    const finalEmbedUrl = spotifyMeta?.embedUrl || buildSpotifyEmbedUrl(trackId);

    const lrcToParse = spotifyLrcContent.trim() || `[00:01.00] ${finalTitle} : ${finalArtist}`;
    const parsedLyrics = parseLRC(lrcToParse, spotifyDefaultEffect);

    setIsSubmitting(true);
    try {
      await onAddNewSong({
        title: finalTitle,
        artist: finalArtist,
        album: "Spotify Embed",
        duration: Math.ceil(parsedLyrics[parsedLyrics.length - 1].time + 10) || 216,
        coverArt: finalCover,
        spotifyTrackId: trackId,
        spotifyEmbedUrl: finalEmbedUrl,
        audioFile: spotifyAudioFile,
        audioSrc: spotifyAudioFile ? undefined : "/audio/Manusia(Sumarah).mp3",
        lyrics: parsedLyrics,
        rawLrc: spotifyLrcContent,
        isSpotify: true,
        isCustom: true,
      });

      setSuccessMsg(`Lagu Spotify "${finalTitle}" berhasil disimpan ke database SQLite!`);

      setTimeout(() => {
        setActiveTab("library");
        setSpotifyInput("");
        setSpotifyMeta(null);
        setSpotifyTitle("");
        setSpotifyArtist("");
        setSpotifyLrcContent("");
        setSpotifyAudioFile(null);
        setSpotifyAudioFileName("");
        setSuccessMsg("");
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan lagu Spotify ke database SQLite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl glass-panel border border-white/15 bg-slate-950/95 shadow-2xl overflow-hidden">
        
        {/* Header with Navigation Tabs */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Disc3 className="w-5 h-5 animate-spin" style={{ animationDuration: "10s" }} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Daftar Lagu & Tambah Musik
              </h2>
              <p className="text-xs text-slate-400">
                Pilih lagu, impor dari kode embed Spotify, atau unggah audio MP3 & lirik LRC Anda.
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

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center border-b border-white/10 bg-black/30 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab("library")}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === "library"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Koleksi Lagu ({playlist.length})</span>
          </button>

          {/* Spotify Embed Importer Tab */}
          <button
            onClick={() => setActiveTab("spotify")}
            className={`flex items-center gap-1.5 py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === "spotify"
                ? "border-[#1DB954] text-[#1DB954]"
                : "border-transparent text-slate-400 hover:text-emerald-300"
            }`}
          >
            <svg className="w-4 h-4 fill-current text-[#1DB954]" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.495 17.299c-.216.353-.674.464-1.026.249-2.812-1.718-6.352-2.107-10.522-1.155-.403.092-.806-.157-.898-.559-.092-.403.158-.806.56-.898 4.567-1.043 8.487-.604 11.637 1.337.352.215.464.673.249 1.026zm1.468-3.262c-.272.441-.853.582-1.294.31-3.218-1.979-8.125-2.55-11.93-1.395-.499.151-1.031-.132-1.182-.631-.151-.499.132-1.031.631-1.182 4.352-1.321 9.771-.683 13.465 1.587.441.272.582.853.31 1.311zm.126-3.413c-3.858-2.291-10.222-2.502-13.887-1.39-.593.18-1.226-.154-1.406-.747-.18-.593.154-1.226.747-1.406 4.215-1.28 11.238-1.036 15.653 1.586.533.316.708 1.009.392 1.542-.316.533-1.009.708-1.542.392z" />
            </svg>
            <span className="font-bold">Embed Spotify</span>
          </button>

          {/* Standard File Upload Tab */}
          <button
            onClick={() => setActiveTab("add")}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === "add"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Unggah File MP3</span>
          </button>

          {/* Jump to LRC Textboard */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenTextboard) onOpenTextboard();
            }}
            className="flex items-center gap-1.5 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-indigo-400 hover:text-indigo-300 ml-auto transition-all"
            title="Buka Textboard Importer LRC"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Textboard LRC &rarr;</span>
          </button>
        </div>

        {/* ===================== TAB 1: LIBRARY LIST ===================== */}
        {activeTab === "library" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {playlist.map((song) => {
              const isCurrent = currentSongId === song.id;
              return (
                <div
                  key={song.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? "bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                      : "bg-white/[0.03] hover:bg-white/[0.06] border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={song.coverArt || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150"}
                      alt={song.title}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-md flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm sm:text-base font-bold truncate ${isCurrent ? "text-indigo-200" : "text-white"}`}>
                          {song.title}
                        </h3>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-indigo-500 text-white font-bold">
                            Sedang Diputar
                          </span>
                        )}
                        {song.spotifyTrackId && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30 flex items-center gap-1">
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.495 17.299c-.216.353-.674.464-1.026.249-2.812-1.718-6.352-2.107-10.522-1.155-.403.092-.806-.157-.898-.559-.092-.403.158-.806.56-.898 4.567-1.043 8.487-.604 11.637 1.337.352.215.464.673.249 1.026zm1.468-3.262c-.272.441-.853.582-1.294.31-3.218-1.979-8.125-2.55-11.93-1.395-.499.151-1.031-.132-1.182-.631-.151-.499.132-1.031.631-1.182 4.352-1.321 9.771-.683 13.465 1.587.441.272.582.853.31 1.311zm.126-3.413c-3.858-2.291-10.222-2.502-13.887-1.39-.593.18-1.226-.154-1.406-.747-.18-.593.154-1.226.747-1.406 4.215-1.28 11.238-1.036 15.653 1.586.533.316.708 1.009.392 1.542-.316.533-1.009.708-1.542.392z" />
                            </svg>
                            <span>Spotify</span>
                          </span>
                        )}
                        {song.audioSrc?.startsWith("/uploads/") && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <span>MP3 SQLite</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {song.artist} • <span className="text-slate-500">{song.album}</span>
                      </p>
                      <p className="text-[11px] font-mono text-indigo-300/80 mt-0.5">
                        {song.lyrics?.length || 0} baris lirik kinetik
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSong(song);
                        onClose();
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all ${
                        isCurrent
                          ? "bg-indigo-600 text-white"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">Putar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenTextboard) onOpenTextboard(song.id);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs transition-colors"
                      title="Buka Textboard LRC untuk lagu ini"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="hidden sm:inline">LRC</span>
                    </button>

                    {song.isCustom && (
                      <button
                        type="button"
                        onClick={() => onDeleteSong && onDeleteSong(song.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                        title="Hapus lagu ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===================== TAB 2: IMPOR SPOTIFY EMBED ===================== */}
        {activeTab === "spotify" && (
          <form onSubmit={handleSaveSpotifySong} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <span>✓</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* Spotify Input Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1DB954]" />
                  Tempel Kode Embed atau Link Spotify:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePasteSpotifySample("manusia")}
                    className="text-[11px] text-[#1DB954] hover:underline"
                  >
                    Contoh Embed Manusia
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => handlePasteSpotifySample("other")}
                    className="text-[11px] text-slate-400 hover:text-white hover:underline"
                  >
                    Contoh Link Track
                  </button>
                </div>
              </div>

              <textarea
                value={spotifyInput}
                onChange={(e) => setSpotifyInput(e.target.value)}
                placeholder="Tempel tag <iframe> Spotify atau link lagu di sini, contoh:&#10;<iframe src='https://open.spotify.com/embed/track/5MtVEg8pDiR6jJHmyKYSKY?utm_source=generator' width='100%' height='352' frameBorder='0' allowfullscreen='' ...></iframe>&#10;Atau link: https://open.spotify.com/track/5MtVEg8pDiR6jJHmyKYSKY"
                rows={3}
                required
                className="w-full p-3 rounded-2xl bg-black/50 border border-white/15 text-white font-mono text-xs focus:border-[#1DB954] outline-none leading-relaxed resize-none"
              />

              {/* Detect Button */}
              <button
                type="button"
                onClick={handleFetchSpotify}
                disabled={isFetchingSpotify || !spotifyInput.trim()}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                  isFetchingSpotify || !spotifyInput.trim()
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-[#1DB954]/20 hover:bg-[#1DB954]/30 border border-[#1DB954]/50 text-[#1DB954] shadow-md shadow-[#1DB954]/10 active:scale-[0.99]"
                }`}
              >
                {isFetchingSpotify ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#1DB954]" />
                    <span>Mendeteksi Data Lagu via Spotify oEmbed...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#1DB954]" />
                    <span>Deteksi Otomatis & Ambil Info Lagu dari Spotify</span>
                  </>
                )}
              </button>
            </div>

            {/* Detected Song Card & Live Preview */}
            {spotifyMeta && (
              <div className="p-4 rounded-2xl bg-[#1DB954]/10 border border-[#1DB954]/30 space-y-3 animate-fade-in">
                <div className="flex items-center gap-3.5">
                  <img
                    src={spotifyMeta.coverArt}
                    alt={spotifyMeta.title}
                    className="w-16 h-16 rounded-xl object-cover border border-white/20 shadow-lg flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#1DB954] font-bold">
                      Spotify Track Terdeteksi
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {spotifyMeta.title}
                    </h3>
                    <p className="text-xs text-slate-300 truncate">
                      {spotifyMeta.artist}
                    </p>
                    <a
                      href={spotifyMeta.trackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#1DB954] hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>Buka di Spotify</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Live Spotify Iframe Embed preview */}
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
                  <iframe
                    src={spotifyMeta.embedUrl}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allowFullScreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title={spotifyMeta.title}
                  />
                </div>
              </div>
            )}

            {/* Editable Fields for Song Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Judul Lagu <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={spotifyTitle}
                  onChange={(e) => setSpotifyTitle(e.target.value)}
                  placeholder="Judul lagu Spotify"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm focus:border-[#1DB954] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Artis / Musisi
                </label>
                <input
                  type="text"
                  value={spotifyArtist}
                  onChange={(e) => setSpotifyArtist(e.target.value)}
                  placeholder="Nama artis/band"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm focus:border-[#1DB954] outline-none"
                />
              </div>
            </div>

            {/* Effect and Optional Audio File */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Gaya Efek Partikel
                </label>
                <select
                  value={spotifyDefaultEffect}
                  onChange={(e) => setSpotifyDefaultEffect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-indigo-300 text-xs outline-none focus:border-[#1DB954]"
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

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  File Audio Lokal (Opsional)
                </label>
                <input
                  type="file"
                  ref={spotifyFileInputRef}
                  accept="audio/*"
                  onChange={handleSpotifyAudioUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => spotifyFileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-xs text-slate-300 flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-[#1DB954]" />
                  <span className="truncate">
                    {spotifyAudioFileName ? spotifyAudioFileName : "Gunakan Audio Lokal atau Spotify"}
                  </span>
                </button>
              </div>
            </div>

            {/* LRC Lyrics Input Area */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  Lirik Lagu / Format LRC
                </label>
                <span className="text-[11px] text-slate-400">
                  Dapat diedit atau ditempel full lirik LRC
                </span>
              </div>
              <textarea
                value={spotifyLrcContent}
                onChange={(e) => setSpotifyLrcContent(e.target.value)}
                placeholder="[00:01.34] Lirik pertama...&#10;[00:07.57] Lirik kedua...&#10;(Bisa ditempel nanti di menu Textboard LRC)"
                rows={4}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-xs focus:border-[#1DB954] outline-none leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl bg-gradient-to-r from-[#1DB954] via-emerald-500 to-teal-500 hover:from-[#1ed760] hover:to-teal-400 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-[#1DB954]/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Menyimpan ke SQLite Database...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>Simpan Lagu Spotify & Putar Sekarang</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ===================== TAB 3: UNGGAH MANUAL FILE MP3 ===================== */}
        {activeTab === "add" && (
          <form onSubmit={handleSaveSong} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs">
                ✓ {successMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Judul Lagu <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Merayakan Fana"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Artis / Penyanyi
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Contoh: Barasuara"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Audio File Input & Default Effect */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  File Audio (MP3/WAV)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-xs text-slate-300 flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate">
                    {audioFileName ? audioFileName : "Pilih File Audio dari Komputer"}
                  </span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Gaya Efek Default
                </label>
                <select
                  value={defaultEffect}
                  onChange={(e) => setDefaultEffect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-indigo-300 text-xs outline-none"
                >
                  <option value="atomic-particles">Atomic Particles (Font Partikel Halus)</option>
                  <option value="apple-blur">Apple Blur (Blur Halus)</option>
                  <option value="wave-chars">Wave Chars (Gelombang 3D Huruf)</option>
                  <option value="explosive-words">Explosive Words (Hentakan Zoom)</option>
                  <option value="glitch-shake">Glitch Shake (Getaran RGB)</option>
                  <option value="cinematic-letterbox">Cinematic Letterbox (Pelebaran Huruf)</option>
                  <option value="falling-scatter">Falling Scatter (Huruf Jatuh)</option>
                  <option value="random">Variasi Acak (Berganti-ganti Efek)</option>
                </select>
              </div>
            </div>

            {/* LRC / Lyrics Text Area */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  Lirik Lagu / Format LRC <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handlePasteSampleLRC}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                >
                  Isi Contoh Format LRC
                </button>
              </div>
              <textarea
                value={lrcContent}
                onChange={(e) => setLrcContent(e.target.value)}
                placeholder="[00:01.34] Lirik baris pertama&#10;[00:07.57] Lirik baris kedua&#10;(Bisa juga teks biasa tanpa timestamp, aplikasi akan otomatis membaginya)"
                rows={5}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-xs focus:border-indigo-500 outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Mengunggah & Menyimpan ke SQLite...</span>
                </>
              ) : (
                <span>Simpan & Putar Lagu Ini Sekarang</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
