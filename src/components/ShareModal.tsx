import { useState } from 'react';
import { X, Copy, Check, Sparkles, Download, Heart } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  portraitSrc: string;
}

export default function ShareModal({ isOpen, onClose, portraitSrc }: ShareModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [cardDownloading, setCardDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = "Step into Kajal's Starlit Spectrum — an immersive 3D celestial birthday universe celebrating Kajal! ✨🌟";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank');
  };

  const generateBirthdayCard = () => {
    setCardDownloading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark celestial background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1440);
    bgGrad.addColorStop(0, '#060210');
    bgGrad.addColorStop(0.5, '#1e082b');
    bgGrad.addColorStop(1, '#080112');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1440);

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 200; i++) {
      const sx = Math.random() * 1080;
      const sy = Math.random() * 1440;
      const sr = Math.random() * 2.5 + 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Gold Frame
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 960, 1320);

    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1;
    ctx.strokeRect(75, 75, 930, 1290);

    // Load portrait
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = portraitSrc;
    img.onload = () => {
      // Draw circular or rounded portrait
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(240, 240, 600, 720, 24);
      ctx.clip();
      ctx.drawImage(img, 240, 240, 600, 720);
      ctx.restore();

      // Portrait border
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 6;
      ctx.strokeRect(240, 240, 600, 720);

      // Title Typography
      ctx.fillStyle = '#fce7f3';
      ctx.font = 'bold 36px serif';
      ctx.textAlign = 'center';
      ctx.fillText('KAJAL’S STARLIT SPECTRUM', 540, 160);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'italic 26px serif';
      ctx.fillText('— A Celestial Birthday Universe —', 540, 205);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px serif';
      ctx.fillText('HAPPY BIRTHDAY, KAJAL!', 540, 1040);

      ctx.fillStyle = '#fbcfe8';
      ctx.font = 'italic 28px serif';
      ctx.fillText('“Radiant in grace, starlit in spirit, blooming in beauty.”', 540, 1110);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '22px sans-serif';
      ctx.fillText('Celebrate with wishes at kajal-spectrum.app', 540, 1260);

      const link = document.createElement('a');
      link.download = 'kajal-starlit-birthday-card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      setCardDownloading(false);
    };

    img.onerror = () => {
      setCardDownloading(false);
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0b0517] border border-amber-500/20 rounded-2xl shadow-2xl overflow-hidden text-slate-100 p-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)] mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-cinzel text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-amber-200 to-indigo-300">
            SHARE HER SPECTRUM
          </h3>
          <p className="text-xs font-cormorant text-pink-200/70 italic mt-1">
            Spread the celestial love and invite friends to make a wish for Kajal
          </p>
        </div>

        {/* 3D Social Buttons that scale on hover */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-b from-emerald-600/30 to-emerald-800/40 border border-emerald-400/40 hover:scale-105 transition-all duration-300 shadow-md group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:rotate-12 transition-transform">
              <span className="font-bold text-lg">WA</span>
            </div>
            <span className="text-xs font-cinzel tracking-wider text-emerald-200 font-semibold">
              WhatsApp
            </span>
          </button>

          {/* Twitter / X */}
          <button
            onClick={handleTwitter}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-b from-sky-600/30 to-sky-800/40 border border-sky-400/40 hover:scale-105 transition-all duration-300 shadow-md group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] group-hover:-rotate-12 transition-transform">
              <span className="font-bold text-lg">𝕏</span>
            </div>
            <span className="text-xs font-cinzel tracking-wider text-sky-200 font-semibold">
              Share on 𝕏
            </span>
          </button>
        </div>

        {/* Copy Link Input */}
        <div className="mb-4">
          <label className="text-[11px] font-cinzel text-slate-300 tracking-wider block mb-1.5">
            Direct Experience Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-cinzel font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Download Starlit Greeting Card */}
        <button
          onClick={generateBirthdayCard}
          disabled={cardDownloading}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-cinzel text-xs font-semibold tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{cardDownloading ? 'Generating Card...' : 'Download Starlit Birthday Card PNG'}</span>
        </button>
      </div>
    </div>
  );
}
