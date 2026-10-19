# ✨ CoolerLyrics — Cinematic Kinetic & Atomic Particle Lyric Visualizer

A web application designed for synchronized, cinematic music lyric visualization. Featuring ultra-smooth **Atomic Particle Typography**, custom particle color themes, full album management, Spotify embeds, and LRC synchronization tools.

---

## 🌟 Key Features

### ⚛️ Ultra-HD Atomic Particle Typography
- **Sub-Pixel Density Grid**: High-resolution particle sampling (~12,000+ points on HD/Retina displays) for razor-sharp typography without pixelation.
- **Organic Kinetic Physics**: Natural flow with spring damping, gentle orbital drift, and fluid morphing transitions between lyric lines.
- **Device Pixel Ratio (DPR 2.5x)**: Optimized rendering pipeline using batched single-pass canvas drawing for steady 60 FPS performance.

### 🎨 Customizable Particle Color Engine
- **8 Curated Cinematic Color Palettes**:
  - *Pearl Luxury* (Warm Silver & White Gold)
  - *Cyber Neon Cyan* (Electric Cyan & Aqua)
  - *Solar Gold & Amber* (Gilded Sun & Deep Amber)
  - *Emerald Aurora* (Ethereal Mint & Jade)
  - *Cosmic Rose* (Vibrant Pink & Neon Rose)
  - *Amethyst Violet* (Deep Purple & Neon Orchid)
  - *Crimson Flame* (Fiery Ruby & Sunset Coral)
  - *Spotify Neon* (Signature Spotify Bright Green)
- **Custom Color Picker**: Native HTML5 color wheel and HEX input that automatically synthesizes a 4-tier sub-pixel tonal palette (Highlight, Core, Midtone, Deep Ambient Glow).
- **Instant Live Shifting**: Color changes dynamically without interrupting canvas particle physics.
- **Persistent Preferences**: Saves selected themes directly to `localStorage`.

### 🎵 Song Library & Audio Engine
- Built-in full album playlist support (*Jalaran Sadrah* and singles like *Hitam Dan Biru*).
- Interactive scrubbing, volume control, mute toggles, and loop support.
- Add and delete custom tracks on the fly.

### 📋 Interactive LRC Textboard & Importer
- Built-in LRC text editor with real-time synchronized playback previews.
- Quick copy, reset, and one-click lyric application to any track.
- Pre-loaded with popular tracks and presets.

### 🟢 Spotify Integration
- Spotify Embed player modal for direct track listening.
- Auto-extracts Track IDs from Spotify URLs or embed codes.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` or `pnpm`

### Installation
```bash
# Clone the repository
git clone https://github.com/lalalfrs/CoolerLyrics.git

# Enter project directory
cd CoolerLyrics

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🛠️ Built With
- **React 19**
- **Vite 8**
- **Tailwind CSS 3**
- **HTML5 Canvas 2D Engine**
- **Framer Motion & Lucide Icons**

---

## 📄 License
MIT License. Created by [lalalfrs](https://github.com/lalalfrs).
