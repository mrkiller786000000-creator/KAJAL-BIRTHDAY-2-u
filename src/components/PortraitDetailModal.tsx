import { X, Sparkles, Heart } from 'lucide-react';
import { PortraitItem } from '../types';

interface PortraitDetailModalProps {
  portrait: PortraitItem | null;
  onClose: () => void;
  onTriggerSpecial?: (trigger: string) => void;
}

export default function PortraitDetailModal({
  portrait,
  onClose,
  onTriggerSpecial,
}: PortraitDetailModalProps) {
  if (!portrait) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0e071a] border border-amber-400/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-slate-300 hover:text-white border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Image View */}
        <div className="md:w-1/2 relative bg-black/50 p-4 flex items-center justify-center">
          <div className="relative group">
            <img
              src={portrait.src}
              alt={portrait.title}
              referrerPolicy="no-referrer"
              className="max-h-[380px] w-auto object-cover rounded-xl border-2 border-pink-400/40 shadow-2xl group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-300/40 text-[10px] font-cinzel text-amber-200">
              {portrait.imageKey}
            </div>
          </div>
        </div>

        {/* Right Details */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-[11px] font-cinzel text-pink-300 uppercase tracking-widest">
                {portrait.section} Spectrum
              </span>
            </div>

            <h3 className="font-cinzel text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-pink-300 mb-1">
              {portrait.title}
            </h3>
            <p className="text-xs font-cormorant text-amber-200/80 italic mb-4">
              {portrait.subtitle}
            </p>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 mb-4">
              <span className="text-[10px] font-cinzel text-slate-400 uppercase tracking-wider block mb-1">
                Attire & Styling
              </span>
              <p className="text-xs font-medium text-pink-100">{portrait.attire}</p>
            </div>

            <p className="text-xs leading-relaxed text-slate-300 font-normal mb-4">
              {portrait.description}
            </p>
          </div>

          {/* Action Trigger if available */}
          {portrait.specialTrigger && onTriggerSpecial && (
            <div className="pt-2">
              <button
                onClick={() => onTriggerSpecial(portrait.specialTrigger!)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-cinzel text-xs font-semibold tracking-wider hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>
                  {portrait.specialTrigger === 'hair_bloom' && 'Activate Floral Bloom'}
                  {portrait.specialTrigger === 'autumn_grayscale' && 'Trigger Autumn Reverie'}
                  {portrait.specialTrigger === 'pearl_scatter' && 'Scatter Silver Pearl Beams'}
                  {portrait.specialTrigger === 'kinetic_jhumka' && 'Kinetic Jhumka Sway'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
