/**
 * Utility untuk mem-parsing format LRC standar ([MM:SS.xx] atau [MM:SS] Lirik)
 * menjadi struktur objek lirik lengkap dengan efek kinetik dan warna background dinamis.
 */
import { effectPresets } from "../data/lyricsData";

const defaultGradients = [
  "from-slate-950 via-zinc-950 to-black",
  "from-slate-950 via-neutral-900 to-black",
  "from-zinc-950 via-neutral-950 to-black",
  "from-neutral-950 via-stone-950 to-black",
  "from-slate-950 via-stone-900 to-black",
  "from-blue-950 via-indigo-950 to-black",
  "from-indigo-950 via-purple-950 to-black",
  "from-purple-950 via-slate-950 to-black",
];

export function parseLRC(lrcText, defaultEffect = "atomic-particles") {
  if (!lrcText) return [];

  const lines = lrcText.split("\n");
  const result = [];
  let idCounter = 1;

  // Regex mendeteksi timestamp [MM:SS.xx] atau [M:SS.xx] atau [MM:SS]
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Abaikan metadata tag seperti [ti:...], [ar:...], [al:...]
    if (/^\[(ti|ar|al|by|offset|length):/i.test(trimmed)) {
      continue;
    }

    const matches = [...trimmed.matchAll(timeRegex)];
    if (matches.length > 0) {
      // Ambil teks setelah semua tag waktu
      const textOnly = trimmed.replace(timeRegex, "").trim();
      const lyricText = textOnly || "• Selesai •";

      for (const match of matches) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const ms = match[3] ? parseFloat("0." + match[3]) : 0;
        const totalSeconds = Math.round((minutes * 60 + seconds + ms) * 100) / 100;

        result.push({
          id: idCounter++,
          time: totalSeconds,
          text: lyricText,
          subtext: "",
          effect: defaultEffect === "random" 
            ? effectPresets[idCounter % effectPresets.length].id 
            : defaultEffect,
          bgGradient: defaultGradients[idCounter % defaultGradients.length],
          fontStyle: "font-sans font-bold text-slate-200",
        });
      }
    } else {
      // Baris teks biasa tanpa timestamp (diberi estimasi interval 4 detik)
      result.push({
        id: idCounter++,
        time: (idCounter - 1) * 4,
        text: trimmed,
        subtext: "",
        effect: defaultEffect === "random" 
          ? effectPresets[idCounter % effectPresets.length].id 
          : defaultEffect,
        bgGradient: defaultGradients[idCounter % defaultGradients.length],
        fontStyle: "font-sans font-bold text-slate-200",
      });
    }
  }

  // Urutkan berdasarkan waktu terkecil
  return result.sort((a, b) => a.time - b.time);
}
