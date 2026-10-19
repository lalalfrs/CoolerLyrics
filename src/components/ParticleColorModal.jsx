import React, { useState } from "react";
import {
  X,
  Palette,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  Eye,
} from "lucide-react";
import {
  particleColorPresets,
  generateTiersFromHex,
  getParticlePrimaryColor,
} from "../data/particleColors";

export default function ParticleColorModal({
  isOpen,
  onClose,
  particleTheme = "pearl",
  customColor = "#00f0ff",
  onSelectTheme,
  onSelectCustomColor,
}) {
  const [localCustomHex, setLocalCustomHex] = useState(customColor || "#00f0ff");

  if (!isOpen) return null;

  const handleCustomChange = (newHex) => {
    setLocalCustomHex(newHex);
    if (onSelectCustomColor) {
      onSelectCustomColor(newHex);
    }
  };

  const previewTiers =
    particleTheme === "custom"
      ? generateTiersFromHex(localCustomHex)
      : particleColorPresets.find((p) => p.id === particleTheme)?.tiers ||
        particleColorPresets[0].tiers;

  const activePrimary = getParticlePrimaryColor(particleTheme, localCustomHex);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl glass-panel border border-white/15 bg-slate-950/95 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl border transition-colors shadow-lg"
              style={{
                backgroundColor: `${activePrimary}20`,
                borderColor: `${activePrimary}50`,
                color: activePrimary,
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Pilih Warna Partikel Atom
              </h2>
              <p className="text-xs text-slate-400">
                Pilih tema palet warna favorit Anda atau tentukan warna kustom bebas.
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

        {/* Live Color Swatch Preview Bar */}
        <div className="p-4 bg-black/40 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex-shrink-0">
              Palet Aktif:
            </span>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
              {previewTiers.map((tier, idx) => (
                <span
                  key={idx}
                  className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: tier.color }}
                  title={`Tier ${idx + 1}: ${tier.color}`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectTheme("pearl");
              onSelectCustomColor("#00f0ff");
              setLocalCustomHex("#00f0ff");
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Kembalikan ke warna default Pearl Luxury"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>
        </div>

        {/* Modal Body: Presets & Custom Picker */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Preset Colors Grid */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Preset Palet Sinematik:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {particleColorPresets.map((preset) => {
                const isSelected = particleTheme === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectTheme(preset.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-white/10 border-white/40 shadow-lg scale-[1.01]"
                        : "bg-white/[0.03] hover:bg-white/[0.07] border-white/5 hover:border-white/20"
                    }`}
                    style={
                      isSelected
                        ? {
                            boxShadow: `0 0 20px ${preset.primary}25`,
                            borderColor: `${preset.primary}60`,
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Gradient Circle Swatch */}
                      <div
                        className="w-8 h-8 rounded-xl shadow-md border border-white/20 flex-shrink-0 flex items-center justify-center"
                        style={{
                          backgroundColor: preset.primary,
                          boxShadow: `0 0 10px ${preset.primary}50`,
                        }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-black font-bold" />}
                      </div>

                      <div className="min-w-0">
                        <h4
                          className={`text-xs sm:text-sm font-bold truncate ${
                            isSelected ? "text-white" : "text-slate-200"
                          }`}
                        >
                          {preset.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {preset.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {preset.tiers.slice(0, 3).map((tier, tIdx) => (
                        <span
                          key={tIdx}
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: tier.color }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Picker Section */}
          <div className="pt-2 border-t border-white/10">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Warna Kustom Pilihan Anda:</span>
            </h3>

            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                particleTheme === "custom"
                  ? "bg-white/10 border-indigo-500/60 shadow-lg"
                  : "bg-white/[0.02] border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* HTML5 Native Color Input with Custom Styled Wrapper */}
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20 cursor-pointer shadow-md">
                    <input
                      type="color"
                      value={localCustomHex}
                      onChange={(e) => handleCustomChange(e.target.value)}
                      className="absolute -top-3 -left-3 w-16 h-16 cursor-pointer border-none outline-none"
                    />
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      Custom Color Picker
                      {particleTheme === "custom" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500 text-white font-mono">
                          Aktif
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Hex: <span className="text-indigo-300 font-bold uppercase">{localCustomHex}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={localCustomHex}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    placeholder="#00f0ff"
                    maxLength={7}
                    className="w-24 px-2.5 py-1.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs uppercase text-center outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTheme("custom");
                      onSelectCustomColor(localCustomHex);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      particleTheme === "custom"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    Gunakan Warna Ini
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 bg-white/5 flex items-center justify-between gap-2">
          <p className="text-[11px] text-slate-400 hidden sm:block">
            ✨ Warna partikel otomatis tersimpan dan aktif pada baris lirik Atomic Particles.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95 ml-auto"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
