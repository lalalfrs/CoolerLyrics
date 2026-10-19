/**
 * Utility untuk mem-parsing input Spotify (kode iframe embed, link track, URI, atau ID)
 * dan mengambil metadata lagu (judul, thumbnail, album art) via Spotify public oEmbed API.
 */

export function extractSpotifyTrackId(input) {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();

  // 1. Ekstrak dari atribut src pada tag <iframe ... src="...">
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const targetStr = iframeSrcMatch ? iframeSrcMatch[1] : trimmed;

  // 2. Ekstrak dari URL open.spotify.com/embed/track/{id} atau open.spotify.com/track/{id}
  // Mendukung juga regional seperti open.spotify.com/intl-id/track/{id}
  const urlMatch = targetStr.match(/(?:embed\/track|track)\/([a-zA-Z0-9]{15,30})/);
  if (urlMatch) {
    return urlMatch[1];
  }

  // 3. Ekstrak dari format Spotify URI: spotify:track:{id}
  const uriMatch = targetStr.match(/spotify:track:([a-zA-Z0-9]{15,30})/);
  if (uriMatch) {
    return uriMatch[1];
  }

  // 4. Ekstrak jika input adalah 22 karakter Alphanumeric ID langsung
  const directIdMatch = targetStr.match(/^[a-zA-Z0-9]{22}$/);
  if (directIdMatch) {
    return directIdMatch[0];
  }

  return null;
}

export function buildSpotifyEmbedUrl(trackId) {
  if (!trackId) return "";
  return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
}

export function buildSpotifyTrackUrl(trackId) {
  if (!trackId) return "";
  return `https://open.spotify.com/track/${trackId}`;
}

export function buildSpotifyIframeCode(trackId, title = "Spotify Track") {
  if (!trackId) return "";
  return `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/${trackId}?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="${title}"></iframe>`;
}

/**
 * Mengambil metadata publik lagu dari Spotify oEmbed API (CORS wildcard enabled).
 */
export async function fetchSpotifyMetadata(inputOrTrackId) {
  const trackId = extractSpotifyTrackId(inputOrTrackId);
  if (!trackId) {
    throw new Error("Format kode embed atau link Spotify tidak valid. Pastikan menyalin embed code atau link track Spotify.");
  }

  const trackUrl = buildSpotifyTrackUrl(trackId);
  const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(trackUrl)}`;

  try {
    const res = await fetch(oembedUrl);
    if (!res.ok) {
      throw new Error(`Spotify oEmbed merespon dengan status: ${res.status}`);
    }
    const data = await res.json();
    
    // Pecah judul jika formatnya "Judul - Artis" atau "Judul"
    let title = data.title || "Lagu Spotify";
    let artist = "Spotify Artist";

    // Kadang data title dari Spotify oEmbed hanya nama lagu atau "Title - Artist"
    if (title.includes(" - ")) {
      const parts = title.split(" - ");
      title = parts[0].trim();
      artist = parts[1].trim();
    }

    return {
      trackId,
      title,
      artist,
      coverArt: data.thumbnail_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300",
      embedUrl: buildSpotifyEmbedUrl(trackId),
      trackUrl,
      iframeHtml: data.html || buildSpotifyIframeCode(trackId, title),
      rawOembed: data,
    };
  } catch (err) {
    console.warn("Gagal memanggil Spotify oEmbed, menggunakan metadata fallback:", err);
    // Fallback jika offline atau fetch gagal
    return {
      trackId,
      title: "Spotify Track (" + trackId.slice(0, 6) + "…)",
      artist: "Spotify",
      coverArt: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300",
      embedUrl: buildSpotifyEmbedUrl(trackId),
      trackUrl,
      iframeHtml: buildSpotifyIframeCode(trackId),
    };
  }
}
