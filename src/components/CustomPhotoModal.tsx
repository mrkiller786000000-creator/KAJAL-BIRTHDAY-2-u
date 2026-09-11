import { useState, type ChangeEvent } from 'react';
import { X, Upload, RotateCcw, Check, Sparkles } from 'lucide-react';
import { PortraitItem } from '../types';
import { INITIAL_PORTRAITS } from '../data/portraits';

interface CustomPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  portraits: PortraitItem[];
  onUpdatePortraitSrc: (id: string, newSrc: string) => void;
  onResetAllPortraits: () => void;
}

export default function CustomPhotoModal({
  isOpen,
  onClose,
  portraits,
  onUpdatePortraitSrc,
  onResetAllPortraits,
}: CustomPhotoModalProps) {
  const [selectedId, setSelectedId] = useState<string>('image_0');
  const [urlInput, setUrlInput] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const activePortrait = portraits.find((p) => p.id === selectedId) || portraits[0];

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdatePortraitSrc(selectedId, reader.result);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 2000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onUpdatePortraitSrc(selectedId, urlInput.trim());
      setUrlInput('');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0b0614] border border-pink-500/20 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-cinzel text-lg font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-amber-200">
                Personalize Kajal's Photo Spectrum
              </h3>
              <p className="text-xs font-cormorant text-slate-400">
                Upload real photos of Kajal to customize the 10 portraits across all 3D WebGL scenes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetAllPortraits}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-cinzel text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Portrait Selector List (10 items) */}
          <div className="md:col-span-5 space-y-2 overflow-y-auto max-h-[60vh] pr-1">
            <span className="text-[11px] font-cinzel uppercase tracking-widest text-pink-300/70 block mb-1">
              Select Portrait Slot (image_0 to image_9)
            </span>
            {portraits.map((p) => {
              const isSelected = p.id === selectedId;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-pink-500/15 border-pink-400/50 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <img
                    src={p.src}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-16 object-cover rounded-lg border border-white/10 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-200 font-cinzel">
                        {p.imageKey}
                      </span>
                      <span className="text-[10px] text-pink-400 capitalize px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">
                        {p.section}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 truncate">{p.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{p.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Portrait Preview & Replacement Controls */}
          <div className="md:col-span-7 flex flex-col items-center justify-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="relative mb-4 group">
              <img
                src={activePortrait.src}
                alt={activePortrait.title}
                referrerPolicy="no-referrer"
                className="w-48 h-64 sm:w-56 sm:h-72 object-cover rounded-xl border-2 border-pink-400/40 shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-xl flex flex-col justify-end p-4">
                <span className="text-xs font-cinzel font-bold text-amber-300">{activePortrait.imageKey}</span>
                <span className="text-sm font-cinzel text-white">{activePortrait.title}</span>
                <span className="text-[11px] text-pink-200">{activePortrait.attire}</span>
              </div>
            </div>

            {uploadSuccess && (
              <div className="mb-3 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs flex items-center gap-1.5 animate-bounce">
                <Check className="w-3.5 h-3.5" />
                <span>Portrait replaced successfully!</span>
              </div>
            )}

            <div className="w-full max-w-sm space-y-3">
              {/* File Upload Button */}
              <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-cinzel text-xs font-semibold tracking-wider cursor-pointer shadow-lg transition-all">
                <Upload className="w-4 h-4" />
                <span>Upload Local Photo ({activePortrait.imageKey})</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Or URL input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or paste image web URL..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-400"
                />
                <button
                  onClick={handleApplyUrl}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-cinzel text-white"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-cinzel text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
