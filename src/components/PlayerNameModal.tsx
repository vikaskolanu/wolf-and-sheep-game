import React, { useState } from 'react';
import { User, Play, Sparkles } from 'lucide-react';

interface PlayerNameModalProps {
  isOpen: boolean;
  initialName?: string;
  onSaveName: (name: string) => void;
  isFirstTime?: boolean;
}

export const PlayerNameModal: React.FC<PlayerNameModalProps> = ({
  isOpen,
  initialName = '',
  onSaveName,
  isFirstTime = true,
}) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name to begin');
      return;
    }
    if (trimmed.length > 20) {
      setError('Name must be 20 characters or fewer');
      return;
    }
    setError('');
    onSaveName(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#182327] border border-[#2e4149] rounded-2xl shadow-2xl overflow-hidden p-6 text-center text-slate-200">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-full bg-lime-500/20 border-2 border-lime-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-lime-500/20">
          <User className="w-8 h-8 text-lime-400" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-1">
          {isFirstTime ? 'Welcome, Reserve Manager' : 'Change Player Name'}
        </h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          {isFirstTime
            ? 'Enter your name to track your highest scores and record the surviving species across each level.'
            : 'Update your name for the high score records.'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Player / Manager Name
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Alex"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-4 py-2.5 rounded-lg bg-[#11191c] border border-slate-700 text-white font-medium text-sm focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-all placeholder:text-slate-600"
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-lime-600 hover:bg-lime-500 text-black font-bold text-sm shadow-lg shadow-lime-950/40 transition-all transform active:scale-95"
          >
            {isFirstTime ? (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>Start Game</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
