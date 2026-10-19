import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Header from "./components/Header";
import LyricStage from "./components/LyricStage";
import PlayerControls from "./components/PlayerControls";
import TimestampMaker from "./components/TimestampMaker";
import LyricsListModal from "./components/LyricsListModal";
import SpotifyEmbedModal from "./components/SpotifyEmbedModal";
import SongLibraryModal from "./components/SongLibraryModal";
import LrcTextboardModal from "./components/LrcTextboardModal";
import ParticleColorModal from "./components/ParticleColorModal";
import { initialPlaylist } from "./data/playlistData";
import { defaultLyrics, defaultSongInfo } from "./data/lyricsData";
import { synthEngine } from "./utils/audioEngine";

export default function App() {
  // Playlist State (disimpan di localStorage agar lagu baru yang ditambahkan user tidak hilang)
  const [playlist, setPlaylist] = useState(() => {
    try {
      const saved = localStorage.getItem("kinetic_lyrics_playlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Gagal memuat playlist dari localStorage:", e);
    }
    return initialPlaylist;
  });

  // Current Track & Playback State
  const [currentSongId, setCurrentSongId] = useState(initialPlaylist[0].id);
  const currentSong = useMemo(() => {
    return playlist.find((s) => s.id === currentSongId) || playlist[0] || initialPlaylist[0];
  }, [playlist, currentSongId]);

  const [lyrics, setLyrics] = useState(currentSong.lyrics || defaultLyrics);
  const [songInfo, setSongInfo] = useState(currentSong || defaultSongInfo);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Particle Color Customization State (disimpan di localStorage)
  const [particleTheme, setParticleTheme] = useState(() => {
    try {
      return localStorage.getItem("kinetic_particle_theme") || "pearl";
    } catch (e) {
      return "pearl";
    }
  });

  const [customParticleColor, setCustomParticleColor] = useState(() => {
    try {
      return localStorage.getItem("kinetic_particle_custom_color") || "#00f0ff";
    } catch (e) {
      return "#00f0ff";
    }
  });

  // Modals state
  const [isLyricsListOpen, setIsLyricsListOpen] = useState(false);
  const [isTimestampMakerOpen, setIsTimestampMakerOpen] = useState(false);
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [isSongLibraryOpen, setIsSongLibraryOpen] = useState(false);
  const [isTextboardOpen, setIsTextboardOpen] = useState(false);
  const [isParticleColorModalOpen, setIsParticleColorModalOpen] = useState(false);

  // Refs for high-precision time tracking
  const audioRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Hitung durasi aktual lagu
  const duration = useMemo(() => {
    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
      return audioRef.current.duration;
    }
    return songInfo.duration || 216;
  }, [songInfo.duration]);

  // Simpan playlist ke localStorage saat ada lagu baru
  useEffect(() => {
    try {
      localStorage.setItem("kinetic_lyrics_playlist", JSON.stringify(playlist));
    } catch (e) {
      console.warn("Gagal menyimpan ke localStorage:", e);
    }
  }, [playlist]);

  // Cari baris lirik aktif berdasarkan currentTime
  const { currentLyric, previousLyric, nextLyric, currentIndex } = useMemo(() => {
    if (!lyrics || lyrics.length === 0) {
      return { currentLyric: null, previousLyric: null, nextLyric: null, currentIndex: -1 };
    }

    const sorted = [...lyrics].sort((a, b) => a.time - b.time);

    let activeIndex = -1;
    for (let i = 0; i < sorted.length; i++) {
      if (currentTime >= sorted[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }

    if (activeIndex === -1) {
      return {
        currentLyric: null,
        previousLyric: null,
        nextLyric: sorted[0] || null,
        currentIndex: -1,
      };
    }

    return {
      currentLyric: sorted[activeIndex],
      previousLyric: activeIndex > 0 ? sorted[activeIndex - 1] : null,
      nextLyric: activeIndex < sorted.length - 1 ? sorted[activeIndex + 1] : null,
      currentIndex: activeIndex,
    };
  }, [lyrics, currentTime]);

  // Gradasi dinamis mengikuti mood lirik aktif
  const bgGradient = useMemo(() => {
    if (currentLyric && currentLyric.bgGradient) {
      return currentLyric.bgGradient;
    }
    return "from-slate-950 via-zinc-900 to-black";
  }, [currentLyric]);

  // Volume & Mute synchronizer
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // High-precision RAF loop untuk sinkronisasi audio dan animasi lirik
  const updateLoop = useCallback(() => {
    if (!isPlaying) return;

    if (audioRef.current && !audioRef.current.paused) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.ended) {
        setIsPlaying(false);
        setCurrentTime(0);
        return;
      }
    } else {
      // Fallback timer jika audio element belum memuat audio
      const now = performance.now();
      if (lastTimeRef.current !== null) {
        const delta = (now - lastTimeRef.current) / 1000;
        setCurrentTime((prev) => {
          const nextTime = prev + delta;
          if (nextTime >= duration) {
            return 0;
          }
          return nextTime;
        });
      }
      lastTimeRef.current = now;
    }

    animationFrameRef.current = requestAnimationFrame(updateLoop);
  }, [isPlaying, duration]);

  // Start / Stop animation & audio loop
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(updateLoop);

      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.warn("Autoplay notice, falling back to ambient synth:", err);
          synthEngine.startAmbientTrack();
        });
      }
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimeRef.current = null;
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      synthEngine.stopAmbientTrack();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      synthEngine.stopAmbientTrack();
    };
  }, [isPlaying, updateLoop]);

  // Play / Pause Toggle handler
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    } else {
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [isPlaying]);

  // Restart handler
  const handleRestart = useCallback(() => {
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
    lastTimeRef.current = performance.now();
  }, [isPlaying]);

  // Seek handler
  const handleSeek = useCallback(
    (targetTime) => {
      const clamped = Math.max(0, Math.min(targetTime, duration));
      setCurrentTime(clamped);
      if (audioRef.current) {
        audioRef.current.currentTime = clamped;
      }
      lastTimeRef.current = performance.now();
    },
    [duration]
  );

  // Switch to another song from playlist
  const handleSelectSong = (song) => {
    setCurrentSongId(song.id);
    setSongInfo(song);
    setLyrics(song.lyrics || []);
    setCurrentTime(0);

    if (audioRef.current) {
      audioRef.current.src = song.audioSrc;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  // Next Track in playlist
  const handleNextTrack = () => {
    const currentIndex = playlist.findIndex((s) => s.id === currentSongId);
    const nextIndex = (currentIndex + 1) % playlist.length;
    handleSelectSong(playlist[nextIndex]);
  };

  // Prev Track in playlist
  const handlePrevTrack = () => {
    if (currentTime > 4) {
      handleRestart();
      return;
    }
    const currentIndex = playlist.findIndex((s) => s.id === currentSongId);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    handleSelectSong(playlist[prevIndex]);
  };

  // Add new song to playlist
  const handleAddNewSong = (newSong) => {
    setPlaylist((prev) => [newSong, ...prev]);
    handleSelectSong(newSong);
    setIsPlaying(true);
  };

  // Delete custom song
  const handleDeleteSong = (songId) => {
    setPlaylist((prev) => prev.filter((s) => s.id !== songId));
    if (currentSongId === songId) {
      handleSelectSong(playlist[0]);
    }
  };

  // Volume & Mute handlers
  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Handler to select and test a specific preset effect on current lyric
  const handleSelectPresetEffect = (effectId) => {
    if (!currentLyric) {
      const found = lyrics.find((l) => l.effect === effectId);
      if (found) {
        handleSeek(found.time);
      }
      return;
    }
    setLyrics((prev) =>
      prev.map((l) => (l.id === currentLyric.id ? { ...l, effect: effectId } : l))
    );
  };

  // Apply custom lyrics from TimestampMaker
  const handleApplyCustomLyrics = (newLyrics) => {
    setLyrics(newLyrics);
  };

  // Terapkan hasil parsing Textboard LRC ke lagu target
  const handleApplyLyricsToSong = (targetSongId, parsedLyrics, rawLrc) => {
    setPlaylist((prevPlaylist) => {
      const updated = prevPlaylist.map((song) => {
        if (song.id === targetSongId) {
          return {
            ...song,
            lyrics: parsedLyrics,
            rawLrc: rawLrc,
          };
        }
        return song;
      });
      try {
        localStorage.setItem("kinetic_lyrics_playlist", JSON.stringify(updated));
      } catch (e) {
        console.warn("Gagal menyimpan ke localStorage:", e);
      }
      return updated;
    });

    if (targetSongId === currentSongId) {
      setLyrics(parsedLyrics);
    } else {
      const targetSong = playlist.find((s) => s.id === targetSongId);
      if (targetSong) {
        handleSelectSong({
          ...targetSong,
          lyrics: parsedLyrics,
          rawLrc: rawLrc,
        });
      }
    }
  };

  // Particle Color Customization Handlers
  const handleSelectParticleTheme = (themeId) => {
    setParticleTheme(themeId);
    try {
      localStorage.setItem("kinetic_particle_theme", themeId);
    } catch (e) {}
  };

  const handleSelectCustomColor = (colorHex) => {
    setCustomParticleColor(colorHex);
    setParticleTheme("custom");
    try {
      localStorage.setItem("kinetic_particle_theme", "custom");
      localStorage.setItem("kinetic_particle_custom_color", colorHex);
    } catch (e) {}
  };

  // Keyboard Shortcuts (Spacebar = Play/Pause)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (isTimestampMakerOpen || isSongLibraryOpen) return;
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "SELECT"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleSeek(currentTime + 5);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handleSeek(currentTime - 5);
      } else if (e.code === "KeyM") {
        handleToggleMute();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handlePlayPause, handleSeek, currentTime, isTimestampMakerOpen, isSongLibraryOpen, isMuted]);

  return (
    <div
      className={`min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden transition-all duration-1000 bg-gradient-to-br ${bgGradient}`}
    >
      {/* Dynamic Background Fluid Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-[130px] animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-[140px] animate-pulse" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-rose-500/10 blur-[150px] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      </div>

      {/* Main Audio Element loaded with current song */}
      <audio
        ref={audioRef}
        src={songInfo.audioSrc}
        preload="auto"
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.duration) {
            setSongInfo((prev) => ({
              ...prev,
              duration: Math.ceil(audioRef.current.duration),
            }));
          }
        }}
        onEnded={handleNextTrack}
      />

      {/* Sleek, Minimalist Top Header */}
      <Header
        songInfo={songInfo}
        isPlaying={isPlaying}
        currentLyric={currentLyric}
        onSelectPresetEffect={handleSelectPresetEffect}
        onOpenLyricsList={() => setIsLyricsListOpen(true)}
        onOpenTimestampMaker={() => setIsTimestampMakerOpen(true)}
        onOpenSpotifyEmbed={() => setIsSpotifyModalOpen(true)}
        onOpenSongLibrary={() => setIsSongLibraryOpen(true)}
        onOpenTextboard={() => setIsTextboardOpen(true)}
        particleTheme={particleTheme}
        customColor={customParticleColor}
        onOpenParticleColorPicker={() => setIsParticleColorModalOpen(true)}
      />

      {/* Main Kinetic Typography Lyric Stage — Elevated for clear visibility */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center pb-28 sm:pb-36 -translate-y-6 sm:-translate-y-12 transition-transform duration-500">
        <LyricStage
          currentLyric={currentLyric}
          previousLyric={previousLyric}
          nextLyric={nextLyric}
          isPlaying={isPlaying}
          particleTheme={particleTheme}
          customColor={customParticleColor}
          onOpenParticleColorPicker={() => setIsParticleColorModalOpen(true)}
        />
      </main>

      {/* Decluttered, Ultra-Responsive Bottom Player Controls */}
      <PlayerControls
        songInfo={songInfo}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onRestart={handleRestart}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenLyricsList={() => setIsLyricsListOpen(true)}
        onOpenSongLibrary={() => setIsSongLibraryOpen(true)}
        onOpenSpotifyEmbed={() => setIsSpotifyModalOpen(true)}
      />

      {/* Song Library & Add New Song Modal */}
      <SongLibraryModal
        isOpen={isSongLibraryOpen}
        onClose={() => setIsSongLibraryOpen(false)}
        playlist={playlist}
        currentSongId={currentSongId}
        onSelectSong={handleSelectSong}
        onAddNewSong={handleAddNewSong}
        onDeleteSong={handleDeleteSong}
        onOpenTextboard={(songId) => {
          if (songId) {
            const target = playlist.find((s) => s.id === songId);
            if (target) {
              handleSelectSong(target);
            }
          }
          setIsTextboardOpen(true);
        }}
      />

      {/* LRC Textboard Importer Modal */}
      <LrcTextboardModal
        isOpen={isTextboardOpen}
        onClose={() => setIsTextboardOpen(false)}
        currentSong={currentSong}
        playlist={playlist}
        onApplyLyricsToSong={handleApplyLyricsToSong}
        onSwitchSong={handleSelectSong}
      />

      {/* Spotify Embed Player Modal */}
      <SpotifyEmbedModal
        isOpen={isSpotifyModalOpen}
        onClose={() => setIsSpotifyModalOpen(false)}
        songInfo={songInfo}
        embedUrl={songInfo.spotifyEmbedUrl || "https://open.spotify.com/embed/track/5MtVEg8pDiR6jJHmyKYSKY?utm_source=generator&si=a7a72be2b4694fb6"}
        trackUrl={`https://open.spotify.com/track/${songInfo.spotifyTrackId || "5MtVEg8pDiR6jJHmyKYSKY"}`}
        onPlayPreview={handlePlayPause}
        isPreviewPlaying={isPlaying}
        onAddNewSong={handleAddNewSong}
      />

      {/* Developer Helper Modal: Timestamp Maker */}
      <TimestampMaker
        isOpen={isTimestampMakerOpen}
        onClose={() => setIsTimestampMakerOpen(false)}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        currentLyrics={lyrics}
        onApplyCustomLyrics={handleApplyCustomLyrics}
      />

      {/* Full Lyrics Overview Modal */}
      <LyricsListModal
        isOpen={isLyricsListOpen}
        onClose={() => setIsLyricsListOpen(false)}
        lyrics={lyrics}
        currentLyricId={currentLyric?.id}
        onSelectLyric={handleSeek}
      />

      {/* Particle Color Picker Modal */}
      <ParticleColorModal
        isOpen={isParticleColorModalOpen}
        onClose={() => setIsParticleColorModalOpen(false)}
        particleTheme={particleTheme}
        customColor={customParticleColor}
        onSelectTheme={handleSelectParticleTheme}
        onSelectCustomColor={handleSelectCustomColor}
      />
    </div>
  );
}
