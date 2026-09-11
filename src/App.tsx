import { useState, useEffect, useRef, type RefObject, type ChangeEvent, type FormEvent } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Heart,
  Send,
  ChevronDown,
  ArrowRight,
  Share2,
  Flower2,
  Leaf,
  Layers,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { SpectrumSection, PortraitItem, BirthdayWish } from './types';
import { INITIAL_PORTRAITS, INITIAL_WISHES } from './data/portraits';
import { celestialAudio } from './utils/audio';

import Preloader3D from './components/Preloader3D';
import Navigation from './components/Navigation';
import CosmicHeroCanvas from './components/CosmicHeroCanvas';
import EtherealCanvas from './components/EtherealCanvas';
import GardenCanvas from './components/GardenCanvas';
import WishingWellCanvas from './components/WishingWellCanvas';
import CustomPhotoModal from './components/CustomPhotoModal';
import ShareModal from './components/ShareModal';
import PortraitDetailModal from './components/PortraitDetailModal';

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<SpectrumSection>('hero');
  const [portraits, setPortraits] = useState<PortraitItem[]>(() => {
    const saved = localStorage.getItem('kajal_spectrum_portraits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PORTRAITS;
      }
    }
    return INITIAL_PORTRAITS;
  });

  const [wishes, setWishes] = useState<BirthdayWish[]>(() => {
    const saved = localStorage.getItem('kajal_spectrum_wishes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_WISHES;
      }
    }
    return INITIAL_WISHES;
  });

  // Hero interactive state
  const [isHeroTextHovered, setIsHeroTextHovered] = useState<boolean>(false);

  // Garden interactive state
  const [selectedPortrait, setSelectedPortrait] = useState<PortraitItem | null>(null);
  const [isGreyscaleActive, setIsGreyscaleActive] = useState<boolean>(false);
  const [isBloomActive, setIsBloomActive] = useState<boolean>(false);

  // Wishing interactive state
  const [wishSender, setWishSender] = useState<string>('');
  const [wishMessage, setWishMessage] = useState<string>('');
  const [wishSubmittedToast, setWishSubmittedToast] = useState<boolean>(false);

  // Modals state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [detailModalPortrait, setDetailModalPortrait] = useState<PortraitItem | null>(null);

  // Well Canvas Callback Ref
  const wellTriggerDropRef = useRef<(() => void) | null>(null);
  const wellTriggerShootingStarRef = useRef<((letter: string) => void) | null>(null);

  // Refs for section scrolling
  const heroRef = useRef<HTMLDivElement>(null);
  const etherealRef = useRef<HTMLDivElement>(null);
  const gardenRef = useRef<HTMLDivElement>(null);
  const wishingRef = useRef<HTMLDivElement>(null);

  // Save portraits to localStorage when updated
  useEffect(() => {
    localStorage.setItem('kajal_spectrum_portraits', JSON.stringify(portraits));
  }, [portraits]);

  // Save wishes to localStorage
  useEffect(() => {
    localStorage.setItem('kajal_spectrum_wishes', JSON.stringify(wishes));
  }, [wishes]);

  // Handle section scrolling
  const scrollToSection = (section: SpectrumSection) => {
    setActiveSection(section);
    celestialAudio.startAmbient();
    celestialAudio.playSparkle(1.0);

    const refMap: Record<SpectrumSection, RefObject<HTMLDivElement | null>> = {
      hero: heroRef,
      ethereal: etherealRef,
      garden: gardenRef,
      wishing: wishingRef,
    };

    const targetEl = refMap[section]?.current;
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Section observer to update activeSection on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.4;
      const hTop = heroRef.current?.offsetTop || 0;
      const eTop = etherealRef.current?.offsetTop || 0;
      const gTop = gardenRef.current?.offsetTop || 0;
      const wTop = wishingRef.current?.offsetTop || 0;

      if (scrollPos >= wTop) {
        setActiveSection('wishing');
      } else if (scrollPos >= gTop) {
        setActiveSection('garden');
      } else if (scrollPos >= eTop) {
        setActiveSection('ethereal');
      } else {
        setActiveSection('hero');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update a single portrait image
  const handleUpdatePortrait = (id: string, newSrc: string) => {
    setPortraits((prev) =>
      prev.map((p) => (p.id === id ? { ...p, src: newSrc } : p))
    );
  };

  const handleResetAllPortraits = () => {
    setPortraits(INITIAL_PORTRAITS);
    localStorage.removeItem('kajal_spectrum_portraits');
  };

  // Wishing typing particle trigger
  const handleWishInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setWishMessage(e.target.value);
    if (wellTriggerDropRef.current) {
      wellTriggerDropRef.current();
    }
    celestialAudio.playParticleDrop();
  };

  // Submit Wish Handler
  const handleSubmitWish = (e: FormEvent) => {
    e.preventDefault();
    if (!wishMessage.trim()) return;

    const letters: ('K' | 'A' | 'J' | 'A2' | 'L')[] = ['K', 'A', 'J', 'A2', 'L'];
    const letter = letters[wishes.length % letters.length];

    const colors = ['#ec4899', '#f59e0b', '#38bdf8', '#c084fc', '#f43f5e', '#10b981'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];

    const newWish: BirthdayWish = {
      id: `w-${Date.now()}`,
      sender: wishSender.trim() || 'A Devoted Wellwisher',
      message: wishMessage.trim(),
      timestamp: Date.now(),
      color: chosenColor,
      constellationLetter: letter,
    };

    setWishes((prev) => [newWish, ...prev]);
    setWishMessage('');
    setWishSender('');

    // Trigger 3D shooting star ascending
    if (wellTriggerShootingStarRef.current) {
      wellTriggerShootingStarRef.current(letter);
    }
    celestialAudio.playShootingStar();

    // Confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#ec4899', '#fbbf24', '#38bdf8', '#a855f7'],
    });

    setWishSubmittedToast(true);
    setTimeout(() => setWishSubmittedToast(false), 4500);
  };

  // Map portraits for fast access
  const heroPortrait = portraits.find((p) => p.id === 'image_0') || portraits[0];
  const etherealPortrait1 = portraits.find((p) => p.id === 'image_1') || portraits[1];
  const etherealPortrait2 = portraits.find((p) => p.id === 'image_2') || portraits[2];

  return (
    <div className="relative min-h-screen bg-[#04020a] text-slate-100 selection:bg-pink-500 selection:text-white">
      {/* 3D Preloader */}
      <AnimatePresence>
        {isLoading && <Preloader3D onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {/* Fixed Navigation Bar */}
      <Navigation
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      <main className="relative z-10 w-full overflow-hidden">
        {/* ========================================================================= */}
        {/* SECTION 1: THE COSMIC ENTRANCE (HERO SECTION) */}
        {/* ========================================================================= */}
        <section
          ref={heroRef}
          id="hero"
          className="relative w-full min-h-screen flex flex-col justify-between pt-20 pb-12 px-4 sm:px-8 border-b border-pink-500/10"
        >
          {/* 3D Canvas with Cake Crystal & Kinetic Jhumkas */}
          <div className="absolute inset-0 z-0">
            <CosmicHeroCanvas
              portraitSrc={heroPortrait.src}
              isTextHovered={isHeroTextHovered}
              onExploreClick={() => scrollToSection('ethereal')}
            />
          </div>

          {/* Foreground Atmospheric Glass Header & Glowing 3D Typography */}
          <div className="relative z-10 max-w-4xl mx-auto text-center pt-8 sm:pt-12 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-pink-400/30 backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(236,72,153,0.3)] pointer-events-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-[11px] sm:text-xs font-cinzel font-semibold tracking-widest text-amber-200 uppercase">
                Celestial Birthday Universe
              </span>
            </motion.div>

            {/* Glowing Crystalline 3D Typography Etched into Atmosphere */}
            <div
              onMouseEnter={() => {
                setIsHeroTextHovered(true);
                celestialAudio.playSparkle(1.2);
              }}
              onMouseLeave={() => setIsHeroTextHovered(false)}
              className="pointer-events-auto cursor-pointer group py-2"
            >
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-cinzel font-black tracking-[0.18em] leading-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-amber-200 to-indigo-200 drop-shadow-[0_0_25px_rgba(236,72,153,0.6)] group-hover:scale-[1.02] transition-transform duration-300">
                HAPPY BIRTHDAY, KAJAL
              </h1>
              <p className="mt-2 text-xs sm:text-sm font-cormorant italic text-pink-200/80 tracking-widest group-hover:text-amber-200 transition-colors">
                Hover to elongate her 3D kinetic golden jhumkas & trigger orbital star cascades
              </p>
            </div>
          </div>

          {/* Bottom Hero Call-to-Action */}
          <div className="relative z-10 max-w-xl mx-auto text-center pb-4 flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-cinzel text-slate-300/80 bg-black/50 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
              <span className="text-amber-300">✨ Royal Magenta & Blue Silk</span>
              <span>•</span>
              <span className="text-pink-300">Kinetic 3D Gold Jhumkas</span>
              <span>•</span>
              <span className="text-indigo-300">Blinking Starlight Core</span>
            </div>

            {/* Animated CTA Button: "TAP TO EXPLORE HER SPECTRUM" */}
            <button
              onClick={() => scrollToSection('ethereal')}
              className="group px-8 py-4 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-cinzel text-xs sm:text-sm font-bold tracking-[0.2em] shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:shadow-[0_0_45px_rgba(236,72,153,0.8)] hover:scale-105 transition-all duration-300 flex items-center gap-3 cursor-pointer border border-pink-300/40"
            >
              <span>TAP TO EXPLORE HER SPECTRUM</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button
              onClick={() => scrollToSection('ethereal')}
              className="text-slate-400 hover:text-white transition-colors animate-bounce mt-2"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: THE ETHEREAL DANCE OF LIGHT */}
        {/* ========================================================================= */}
        <section
          ref={etherealRef}
          id="ethereal"
          className="relative w-full min-h-screen flex flex-col justify-between py-16 px-4 sm:px-8 border-b border-pink-500/10 bg-gradient-to-b from-[#04020a] via-[#10061c] to-[#0d0517]"
        >
          {/* Section Header */}
          <div className="relative z-10 max-w-4xl mx-auto text-center mb-6 pointer-events-none">
            <span className="text-xs font-cinzel font-semibold tracking-[0.3em] text-pink-300/80 uppercase block mb-1">
              Section II • The Silver Constellation
            </span>
            <h2 className="text-3xl sm:text-5xl font-cormorant font-bold italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-100 via-rose-200 to-indigo-100 drop-shadow-[0_0_20px_rgba(244,114,182,0.4)]">
              A SPECTRUM OF GRACE
            </h2>
            <p className="max-w-xl mx-auto text-xs sm:text-sm font-cormorant text-pink-200/80 italic mt-2">
              Floating crystal clusters, sacred Maang Tikka artifact, and the refined mudra gesture scattering beams of silver pearls.
            </p>
          </div>

          {/* 3D WebGL Canvas for Ethereal Section */}
          <div className="relative z-10 w-full h-[540px] sm:h-[620px] max-w-6xl mx-auto rounded-3xl overflow-hidden border border-pink-400/20 shadow-2xl bg-black/20">
            <EtherealCanvas
              image1Src={etherealPortrait1.src}
              image2Src={etherealPortrait2.src}
              onGestureTrigger={() => {
                confetti({
                  particleCount: 50,
                  spread: 80,
                  origin: { y: 0.5 },
                  colors: ['#ffffff', '#fbcfe8', '#e0e7ff', '#fef08a'],
                });
              }}
            />
          </div>

          {/* Bottom Descriptive Pill Row */}
          <div className="relative z-10 max-w-3xl mx-auto mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setDetailModalPortrait(etherealPortrait1)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-pink-300/20 text-xs font-cinzel text-pink-100 flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
            >
              <span>👑</span>
              <span>Inspect Sacred Maang Tikka (image_1)</span>
            </button>
            <button
              onClick={() => setDetailModalPortrait(etherealPortrait2)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-pink-300/20 text-xs font-cinzel text-pink-100 flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
            >
              <span>🪡</span>
              <span>Woven Zari Embroidery (image_2)</span>
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: THE GARDEN OF DREAMS */}
        {/* ========================================================================= */}
        <section
          ref={gardenRef}
          id="garden"
          className="relative w-full min-h-screen flex flex-col justify-between py-16 px-4 sm:px-8 border-b border-amber-500/10 bg-gradient-to-b from-[#0d0517] via-[#1a0c06] to-[#0c0410]"
        >
          {/* Section Header */}
          <div className="relative z-10 max-w-4xl mx-auto text-center mb-6 pointer-events-none">
            <span className="text-xs font-cinzel font-semibold tracking-[0.3em] text-amber-300/80 uppercase block mb-1">
              Section III • Golden Hour Sanctuary
            </span>
            <h2 className="text-3xl sm:text-5xl font-floral font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-amber-100 drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]">
              BLOOMING IN BEAUTY
            </h2>
            <p className="max-w-xl mx-auto text-xs sm:text-sm font-cormorant text-amber-100/80 italic mt-2">
              A circular winding path of glowing mehndi stone, rustling saree fabrics, swaying cycad palms, and interactive floral blooms.
            </p>
          </div>

          {/* 3D WebGL Canvas for Garden Section */}
          <div className="relative z-10 w-full h-[540px] sm:h-[620px] max-w-6xl mx-auto rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl bg-black/20">
            <GardenCanvas
              portraits={portraits}
              selectedPortraitId={selectedPortrait?.id || null}
              onSelectPortrait={(p) => {
                setSelectedPortrait(p);
                setDetailModalPortrait(p);
              }}
              isGreyscaleActive={isGreyscaleActive}
              onToggleGreyscale={() => setIsGreyscaleActive(!isGreyscaleActive)}
              isBloomActive={isBloomActive}
              onToggleBloom={() => setIsBloomActive(!isBloomActive)}
            />
          </div>

          {/* Saree Portrait Thumbnails Navigation along the Path */}
          <div className="relative z-10 max-w-5xl mx-auto mt-6 w-full">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-[11px] font-cinzel text-amber-300/80 uppercase tracking-widest">
                Portraits on the Mehndi Path (Tap to Focus Camera)
              </span>
              <span className="text-[11px] font-cormorant text-amber-200/60 italic">
                Saree Fabric Rippling in Golden Breeze
              </span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {portraits
                .filter((p) => p.section === 'garden' || p.id === 'image_4' || p.id === 'image_6')
                .map((p) => {
                  const isSelected = selectedPortrait?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPortrait(p);
                        setDetailModalPortrait(p);
                        celestialAudio.playBreeze();
                      }}
                      className={`flex-shrink-0 flex items-center gap-2.5 p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                          : 'bg-black/40 border-white/10 text-slate-300 hover:border-amber-400/40 hover:text-white'
                      }`}
                    >
                      <img
                        src={p.src}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="w-8 h-10 object-cover rounded-lg border border-white/10"
                      />
                      <div className="text-left pr-2">
                        <span className="text-[10px] font-bold text-amber-400 block font-cinzel">
                          {p.imageKey}
                        </span>
                        <span className="text-xs truncate max-w-[110px] block font-medium">
                          {p.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: THE WISHING WELL & COSMIC ENCORE */}
        {/* ========================================================================= */}
        <section
          ref={wishingRef}
          id="wishing"
          className="relative w-full min-h-screen flex flex-col justify-between py-16 px-4 sm:px-8 bg-gradient-to-b from-[#0c0410] via-[#080214] to-[#04010a]"
        >
          {/* Section Header */}
          <div className="relative z-10 max-w-4xl mx-auto text-center mb-6 pointer-events-none">
            <span className="text-xs font-cinzel font-semibold tracking-[0.3em] text-indigo-300/80 uppercase block mb-1">
              Section IV • The Wishing Well & Cosmic Encore
            </span>
            <h2 className="text-3xl sm:text-5xl font-cinzel font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-amber-200 to-indigo-300 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">
              MAKE A WISH FOR KAJAL
            </h2>
            <p className="max-w-xl mx-auto text-xs sm:text-sm font-cormorant text-indigo-200/80 italic mt-2">
              Type your heartfelt birthday blessing. Typing releases glowing particles into the well’s galaxy vortex; submitting launches a shooting star to join the K-A-J-A-L constellation!
            </p>
          </div>

          {/* 3D WebGL Canvas for Wishing Well Section */}
          <div className="relative z-10 w-full h-[520px] sm:h-[600px] max-w-6xl mx-auto rounded-3xl overflow-hidden border border-indigo-500/20 shadow-2xl bg-black/30 mb-8">
            <WishingWellCanvas
              wishes={wishes}
              onCanvasReady={(triggerDrop, triggerShootingStar) => {
                wellTriggerDropRef.current = triggerDrop;
                wellTriggerShootingStarRef.current = triggerShootingStar;
              }}
            />
          </div>

          {/* Interactive Wish Form & Constellation Sky Board */}
          <div className="relative z-10 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Interactive Input Form */}
            <div className="lg:col-span-6 bg-[#0e071c]/90 border border-pink-500/20 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-cinzel text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-amber-200">
                  Cast Your Celestial Wish
                </h3>
              </div>

              <form onSubmit={handleSubmitWish} className="space-y-4">
                <div>
                  <label className="text-[11px] font-cinzel uppercase tracking-widest text-pink-300/80 block mb-1.5">
                    Your Name or Blessing Title
                  </label>
                  <input
                    type="text"
                    required
                    value={wishSender}
                    onChange={(e) => setWishSender(e.target.value)}
                    placeholder="e.g. Maya & Raghav, or An Old Friend"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-400/80 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-cinzel uppercase tracking-widest text-pink-300/80">
                      Birthday Wish for Kajal
                    </label>
                    <span className="text-[10px] font-cormorant italic text-amber-300/70">
                      Drops golden stardust as you type!
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={wishMessage}
                    onChange={handleWishInputChange}
                    placeholder="Write your heartfelt birthday wishes for Kajal... May her year be filled with radiant joy, peace, and endless love!"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-400/80 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-cinzel text-xs sm:text-sm font-bold tracking-[0.18em] shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>LAUNCH SHOOTING STAR WISH</span>
                </button>
              </form>

              {wishSubmittedToast && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Your shooting star has ascended into the celestial sky and joined Kajal's constellation! 🌟
                  </span>
                </motion.div>
              )}
            </div>

            {/* Right: Floating Wishes in the Sky */}
            <div className="lg:col-span-6 flex flex-col max-h-[460px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <h4 className="font-cinzel text-sm font-bold tracking-wider text-slate-200">
                    Constellation Wishes ({wishes.length})
                  </h4>
                </div>
                <span className="text-[11px] font-cormorant text-slate-400 italic">
                  Ascended to K • A • J • A • L
                </span>
              </div>

              <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-[400px]">
                {wishes.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-pink-500/30 transition-all backdrop-blur-md group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                          style={{ backgroundColor: w.color, color: w.color }}
                        />
                        <span className="text-xs font-cinzel font-bold text-amber-200">
                          {w.sender}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-pink-300 border border-white/5">
                        Constellation [{w.constellationLetter}]
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      "{w.message}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Final Call-to-Action: "SHARE HER SPECTRUM" */}
          <div className="relative z-10 max-w-2xl mx-auto text-center mt-16 pb-8">
            <div className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-black/60 border border-white/10 backdrop-blur-2xl shadow-2xl">
              <h3 className="font-cinzel text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-amber-200 to-indigo-300 mb-2">
                SHARE HER SPECTRUM
              </h3>
              <p className="text-xs sm:text-sm font-cormorant text-slate-300 italic mb-6">
                Celebrate Kajal’s birthday across the universe — send wishes to WhatsApp, 𝕏, or download her customized keepsake starlight card.
              </p>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-cinzel text-xs sm:text-sm font-bold tracking-[0.2em] shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-105 transition-all flex items-center gap-2.5 mx-auto cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>OPEN SHARE & CARD STUDIO</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4 text-center border-t border-white/5 bg-[#030107] text-[11px] font-cormorant text-slate-500 tracking-widest">
        <p>KAJAL'S STARLIT SPECTRUM • CELEBRATING HER CELESTIAL GRACE, BEAUTY & BRILLIANCE</p>
      </footer>

      {/* MODALS */}
      <CustomPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        portraits={portraits}
        onUpdatePortraitSrc={handleUpdatePortrait}
        onResetAllPortraits={handleResetAllPortraits}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        portraitSrc={heroPortrait.src}
      />

      <PortraitDetailModal
        portrait={detailModalPortrait}
        onClose={() => setDetailModalPortrait(null)}
        onTriggerSpecial={(trigger) => {
          if (trigger === 'hair_bloom') {
            setIsBloomActive(true);
            scrollToSection('garden');
            setDetailModalPortrait(null);
            celestialAudio.playSparkle(1.3);
          } else if (trigger === 'autumn_grayscale') {
            setIsGreyscaleActive(true);
            scrollToSection('garden');
            setDetailModalPortrait(null);
            celestialAudio.playBreeze();
          } else if (trigger === 'pearl_scatter') {
            scrollToSection('ethereal');
            setDetailModalPortrait(null);
          } else if (trigger === 'kinetic_jhumka') {
            setIsHeroTextHovered(true);
            scrollToSection('hero');
            setDetailModalPortrait(null);
          }
        }}
      />
    </div>
  );
}
