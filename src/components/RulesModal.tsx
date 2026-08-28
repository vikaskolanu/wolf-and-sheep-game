import React from 'react';
import { X, BookOpen, Sparkles } from 'lucide-react';
import { SheepSilhouette, WolfSilhouette, GrassTileIcon } from './Icons';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#182327] border border-[#2e4149] rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[90vh] flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-lime-400" />
            <h3 className="text-lg font-bold text-white">Ecosystem Simulation Rules</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-4 overflow-y-auto pr-1 text-xs md:text-sm leading-relaxed text-slate-300">
          <div className="bg-[#131b1e] p-3 rounded-lg border border-slate-800 flex gap-3 items-start">
            <WolfSilhouette className="w-7 h-7 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-400 mb-0.5">Wolf Hunting & Starvation</h4>
              <p>
                Each wolf hunts the <strong>closest alive sheep</strong> that is not already targeted by another wolf.
                When a wolf reaches a sheep's tile, it catches and eats the sheep. If a wolf goes <strong>4 weeks without eating</strong>, it starves and perishes.
              </p>
            </div>
          </div>

          <div className="bg-[#131b1e] p-3 rounded-lg border border-slate-800 flex gap-3 items-start">
            <SheepSilhouette className="w-7 h-7 text-sky-200 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sky-400 mb-0.5">Sheep Grazing & Reproduction</h4>
              <p>
                Sheep feed exclusively on <strong>grass patches</strong>. While on grass, sheep remain healthy and <strong>multiply/reproduce every 4 weeks</strong> into neighboring grass tiles.
                If a sheep is outside grasslands, it starves in <strong>2 weeks</strong>.
              </p>
            </div>
          </div>

          <div className="bg-[#131b1e] p-3 rounded-lg border border-slate-800 flex gap-3 items-start">
            <div className="w-6 h-6 rounded bg-lime-500/20 text-lime-400 flex items-center justify-center shrink-0 mt-0.5">
              <GrassTileIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-lime-400 mb-0.5">Grassland Pastures</h4>
              <p>
                Grasslands provide essential shelter and food for sheep. Strategic placement of grass patches allows you to keep sheep separated from wolf starting positions and buy time for breeding.
              </p>
            </div>
          </div>

          <div className="bg-[#131b1e] p-3 rounded-lg border border-slate-800 flex gap-3 items-start">
            <Sparkles className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-400 mb-0.5">Win Condition</h4>
              <p>
                Maintain an active, thriving ecosystem where <strong>both species survive until the final week deadline</strong>.
                If all sheep are hunted or wolves starve to extinction, the reserve collapses.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-lime-600 hover:bg-lime-500 text-black font-semibold text-xs"
          >
            Got it, Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};
