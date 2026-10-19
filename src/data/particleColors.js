/**
 * Definisi Preset Warna Partikel Atom (Atomic Particles Color Themes)
 * dan generator palet multi-tier untuk custom color picker.
 */

export const particleColorPresets = [
  {
    id: "pearl",
    name: "Pearl Luxury",
    subtitle: "Putih mutiara, platinum & champagne lembut",
    primary: "#ffffff",
    glowColor: "rgba(255, 255, 255, 0.25)",
    previewGradient: "from-white via-slate-200 to-amber-100",
    tiers: [
      { color: "rgba(255, 255, 255, 0.96)", weight: 0.45 }, // Inti
      { color: "rgba(241, 245, 249, 0.88)", weight: 0.25 }, // Platinum
      { color: "rgba(254, 243, 199, 0.84)", weight: 0.15 }, // Warm Champagne
      { color: "rgba(224, 242, 254, 0.80)", weight: 0.15 }, // Starlight
    ],
  },
  {
    id: "cyan-neon",
    name: "Cyber Neon Cyan",
    subtitle: "Biru toska elektrik & kilau es futuristik",
    primary: "#00f0ff",
    glowColor: "rgba(0, 240, 255, 0.35)",
    previewGradient: "from-cyan-400 via-teal-300 to-blue-500",
    tiers: [
      { color: "rgba(0, 240, 255, 0.96)", weight: 0.45 },
      { color: "rgba(103, 232, 249, 0.88)", weight: 0.25 },
      { color: "rgba(165, 243, 252, 0.82)", weight: 0.15 },
      { color: "rgba(255, 255, 255, 0.92)", weight: 0.15 },
    ],
  },
  {
    id: "gold-amber",
    name: "Solar Gold & Amber",
    subtitle: "Kilau emas mewah & hangat matahari fana",
    primary: "#fbbf24",
    glowColor: "rgba(251, 191, 36, 0.35)",
    previewGradient: "from-amber-400 via-yellow-300 to-orange-400",
    tiers: [
      { color: "rgba(251, 191, 36, 0.96)", weight: 0.45 },
      { color: "rgba(253, 224, 71, 0.88)", weight: 0.25 },
      { color: "rgba(254, 240, 138, 0.84)", weight: 0.15 },
      { color: "rgba(255, 255, 255, 0.92)", weight: 0.15 },
    ],
  },
  {
    id: "emerald-aurora",
    name: "Emerald Aurora",
    subtitle: "Hijau zamrud bercahaya & mint aurora",
    primary: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.35)",
    previewGradient: "from-emerald-400 via-teal-300 to-green-500",
    tiers: [
      { color: "rgba(16, 185, 129, 0.96)", weight: 0.45 },
      { color: "rgba(52, 211, 153, 0.88)", weight: 0.25 },
      { color: "rgba(110, 231, 183, 0.84)", weight: 0.15 },
      { color: "rgba(255, 255, 255, 0.92)", weight: 0.15 },
    ],
  },
  {
    id: "cosmic-rose",
    name: "Cosmic Rose",
    subtitle: "Merah muda kosmik & fuchsia elektrik",
    primary: "#f43f5e",
    glowColor: "rgba(244, 63, 94, 0.35)",
    previewGradient: "from-rose-500 via-pink-400 to-purple-400",
    tiers: [
      { color: "rgba(244, 63, 94, 0.96)", weight: 0.45 },
      { color: "rgba(251, 113, 133, 0.88)", weight: 0.25 },
      { color: "rgba(244, 114, 182, 0.84)", weight: 0.15 },
      { color: "rgba(255, 255, 255, 0.92)", weight: 0.15 },
    ],
  },
  {
    id: "amethyst-violet",
    name: "Amethyst Violet",
    subtitle: "Ungu mistis & kilau kristal kecubung",
    primary: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.35)",
    previewGradient: "from-purple-500 via-violet-400 to-indigo-400",
    tiers: [
      { color: "rgba(168, 85, 247, 0.96)", weight: 0.45 },
      { color: "rgba(192, 132, 252, 0.88)", weight: 0.25 },
      { color: "rgba(216, 180, 254, 0.84)", weight: 0.15 },
      { color: "rgba(255, 255, 255, 0.92)", weight: 0.15 },
    ],
  },
  {
    id: "crimson-flame",
    name: "Crimson Flame",
    subtitle: "Merah kobaran api & koral membara",
    primary: "#ef4444",
    glowColor: "rgba(239, 68, 68, 0.35)",
    previewGradient: "from-red-500 via-orange-400 to-amber-500",
    tiers: [
      { color: "rgba(239, 68, 68, 0.96)", weight: 0.45 },
      { color: "rgba(248, 113, 113, 0.88)", weight: 0.25 },
      { color: "rgba(251, 146, 60, 0.84)", weight: 0.15 },
      { color: "rgba(255, 255, 255, 0.92)", weight: 0.15 },
    ],
  },
  {
    id: "spotify-neon",
    name: "Spotify Neon",
    subtitle: "Hijau neon khas Spotify yang kontras",
    primary: "#1db954",
    glowColor: "rgba(29, 185, 84, 0.35)",
    previewGradient: "from-[#1db954] via-emerald-400 to-green-300",
    tiers: [
      { color: "rgba(29, 185, 84, 0.96)", weight: 0.45 },
      { color: "rgba(46, 213, 115, 0.88)", weight: 0.25 },
      { color: "rgba(123, 237, 159, 0.84)", weight: 0.15 },
      { color: "rgba(255, 255, 255, 0.92)", weight: 0.15 },
    ],
  },
];

/**
 * Membuat palet 4-tier dari warna custom hex apapun yang dipilih user
 */
export function generateTiersFromHex(hex) {
  if (!hex) return particleColorPresets[0].tiers;
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) || 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 255;

  return [
    { color: `rgba(${r}, ${g}, ${b}, 0.96)`, weight: 0.45 },
    { color: `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}, 0.88)`, weight: 0.25 },
    { color: `rgba(${Math.min(255, r + 75)}, ${Math.min(255, g + 75)}, ${Math.min(255, b + 75)}, 0.82)`, weight: 0.15 },
    { color: "rgba(255, 255, 255, 0.92)", weight: 0.15 },
  ];
}

/**
 * Mengambil palet tiers aktif berdasarkan ID tema atau Custom Hex
 */
export function getParticleTiers(themeId = "pearl", customHex = null) {
  if (themeId === "custom" && customHex) {
    return generateTiersFromHex(customHex);
  }
  const preset = particleColorPresets.find((p) => p.id === themeId);
  return preset ? preset.tiers : particleColorPresets[0].tiers;
}

/**
 * Mengambil warna primer hex untuk indikator UI
 */
export function getParticlePrimaryColor(themeId = "pearl", customHex = null) {
  if (themeId === "custom" && customHex) {
    return customHex;
  }
  const preset = particleColorPresets.find((p) => p.id === themeId);
  return preset ? preset.primary : "#ffffff";
}
