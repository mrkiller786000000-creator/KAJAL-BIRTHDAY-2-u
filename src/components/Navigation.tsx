import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Image as ImageIcon, Share2, Compass } from 'lucide-react';
import { SpectrumSection } from '../types';
import { celestialAudio } from '../utils/audio';

interface NavigationProps {
  activeSection: SpectrumSection;
  onNavigate: (section: SpectrumSection) => void;
  onOpenPhotoModal: () => void;
  onOpenShareModal: () => void;
}

export default function Navigation({
  activeSection,
  onNavigate,
  onOpenPhotoModal,
  onOpenShareModal,
}: NavigationProps) {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const sections: { id: SpectrumSection; label: string; number: string }[] = [
    { id: 'hero', label: 'Cosmic Entrance', number: 'I' },
    { id: 'ethereal', label: 'Dance of Light', number: 'II' },
    { id: 'garden', label: 'Garden of Dreams', number: 'III' },
    { id: 'wishing', label: 'Wishing Well', number: 'IV' },
  ];

  const toggleSound = () => {
    if (!hasInteracted) {
      celestialAudio.startAmbient();
      setHasInteracted(true);
    }
    const muted = celestialAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      celestialAudio.playSparkle(1.1);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-[#04020a]/90 via-[#04020a]/60 to-transparent backdrop-blur-md border-b border-white/5">
      {/* Brand Title */}
      <div
        onClick={() => onNavigate('hero')}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-amber-300 flex items-center justify-center shadow-[0_0_12px_rgba(236,72,153,0.5)] group-hover:scale-105 transition-transform">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-cinzel text-sm sm:text-base font-bold tracking-widest text-slate-100 group-hover:text-pink-300 transition-colors">
            KAJAL
          </span>
          <span className="hidden sm:inline-block ml-1.5 text-[10px] font-cormorant tracking-widest text-pink-300/80 uppercase">
            Starlit Spectrum
          </span>
        </div>
      </div>

      {/* Center Nav Sections */}
      <nav className="hidden md:flex items-center gap-1.5 bg-black/40 border border-white/10 p-1 rounded-full backdrop-blur-lg">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => onNavigate(sec.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-cinzel tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
              activeSection === sec.id
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="opacity-60 text-[10px]">{sec.number}.</span>
            <span>{sec.label}</span>
          </button>
        ))}
      </nav>

      {/* Right Controls: Sound, Custom Photos, Share */}
      <div className="flex items-center gap-2">
        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          title={isMuted ? 'Unmute celestial ambience' : 'Mute celestial ambience'}
          className={`p-2 rounded-full border transition-all ${
            isMuted
              ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              : 'bg-pink-500/20 border-pink-400/40 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.3)] animate-pulse'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Custom Photos Uploader */}
        <button
          onClick={onOpenPhotoModal}
          title="Personalize or replace Kajal's photos"
          className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-amber-300 hover:border-amber-400/40 transition-all"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Share Button */}
        <button
          onClick={onOpenShareModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-400/30 text-amber-200 text-xs font-cinzel hover:bg-amber-500/30 transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </header>
  );
}
