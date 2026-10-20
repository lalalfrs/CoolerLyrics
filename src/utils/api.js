/**
 * API Helper untuk berinteraksi dengan SQLite backend server CoolerLyrics
 */

export async function fetchSongs() {
  const res = await fetch("/api/songs");
  if (!res.ok) {
    throw new Error(`Gagal memuat lagu: ${res.statusText}`);
  }
  return await res.json();
}

export async function createSongApi({
  title,
  artist,
  album,
  duration,
  coverArt,
  audioFile,
  audioSrc,
  spotifyTrackId,
  spotifyEmbedUrl,
  rawLrc,
  lyrics,
}) {
  const formData = new FormData();
  formData.append("title", title || "");
  formData.append("artist", artist || "");
  formData.append("album", album || "");
  if (duration) formData.append("duration", duration);
  if (coverArt) formData.append("coverArt", coverArt);
  if (spotifyTrackId) formData.append("spotifyTrackId", spotifyTrackId);
  if (spotifyEmbedUrl) formData.append("spotifyEmbedUrl", spotifyEmbedUrl);
  if (rawLrc) formData.append("rawLrc", rawLrc);
  if (lyrics) formData.append("lyrics", JSON.stringify(lyrics));

  if (audioFile) {
    formData.append("audio", audioFile);
  } else if (audioSrc) {
    formData.append("audioSrc", audioSrc);
  }

  const res = await fetch("/api/songs", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Gagal menyimpan lagu ke database: ${res.statusText}`);
  }

  return await res.json();
}

export async function updateSongLyricsApi(songId, lyrics, rawLrc) {
  const res = await fetch(`/api/songs/${songId}/lyrics`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lyrics, rawLrc }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Gagal memperbarui lirik di database: ${res.statusText}`);
  }

  return await res.json();
}

export async function deleteSongApi(songId) {
  const res = await fetch(`/api/songs/${songId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Gagal menghapus lagu dari database: ${res.statusText}`);
  }

  return await res.json();
}
