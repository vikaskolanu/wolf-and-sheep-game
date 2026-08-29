import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, User, Calendar, Globe2, Star } from 'lucide-react';
import { PlayerProfile, LeaderboardEntry } from '../core/types';
import { GAME_LEVELS } from '../data/levels';
import { fetchGlobalLevelLeaderboard, getLocalLeaderboard } from '../core/storage';

interface LeaderboardPanelProps {
  currentLevelId: number;
  profile: PlayerProfile | null;
  onEditName: () => void;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  currentLevelId,
  profile,
  onEditName,
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState(currentLevelId);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync selected level with game level if changed
  useEffect(() => {
    setSelectedLevelId(currentLevelId);
  }, [currentLevelId]);

  // Load entries for selected level
  const loadLeaderboard = async (levelId: number) => {
    setIsLoading(true);
    // Instant local load first
    const local = getLocalLeaderboard();
    if (local[levelId]) {
      setEntries([...local[levelId]].sort((a, b) => b.sheepAlive - a.sheepAlive));
    }

    // Cloud fetch
    try {
      const live = await fetchGlobalLevelLeaderboard(levelId);
      setEntries(live);
    } catch (e) {
      // Fallback already loaded
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard(selectedLevelId);
  }, [selectedLevelId]);

  const selectedConfig = GAME_LEVELS.find(l => l.id === selectedLevelId) || GAME_LEVELS[0];

  const getRankBadge = (idx: number) => {
    if (idx === 0) return <span className="text-base">🥇</span>;
    if (idx === 1) return <span className="text-base">🥈</span>;
    if (idx === 2) return <span className="text-base">🥉</span>;
    return <span className="font-mono text-slate-400 font-bold text-xs">#{idx + 1}</span>;
  };

  return (
    <div className="w-full bg-[#182327]/90 backdrop-blur-md border border-[#2b3d44] rounded-2xl shadow-2xl p-4 flex flex-col gap-3 text-slate-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">Global Leaderboard</h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] font-mono text-lime-400 bg-lime-950/60 px-2 py-0.5 rounded-full border border-lime-500/30">
            <Globe2 className="w-3 h-3 animate-spin text-lime-400" style={{ animationDuration: '6s' }} />
            <span>Live Cloud</span>
          </div>

          <button
            type="button"
            onClick={() => loadLeaderboard(selectedLevelId)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all"
            title="Refresh latest scores"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-lime-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Active Player Tag */}
      <div className="flex items-center justify-between bg-[#12191c] px-3 py-2 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-lime-500/20 border border-lime-400 flex items-center justify-center text-lime-400 font-bold text-[11px]">
            {profile?.name ? profile.name[0].toUpperCase() : 'P'}
          </div>
          <span className="font-semibold text-white truncate max-w-[120px]">
            {profile?.name || 'Player'}
          </span>
        </div>

        <button
          type="button"
          onClick={onEditName}
          className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-[#1d2a2f] hover:bg-[#25363c] px-2 py-1 rounded border border-slate-700 transition-all"
        >
          <User className="w-3 h-3 text-lime-400" />
          <span>Edit Name</span>
        </button>
      </div>

      {/* Level Tabs (Horizontal scrollable) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
        {GAME_LEVELS.map(lvl => (
          <button
            key={lvl.id}
            onClick={() => setSelectedLevelId(lvl.id)}
            className={`px-2 py-1 text-[11px] font-semibold rounded-md shrink-0 transition-all ${
              selectedLevelId === lvl.id
                ? 'bg-lime-600 text-black font-bold shadow-sm'
                : 'bg-[#121a1d] text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Lvl {lvl.id}
          </button>
        ))}
      </div>

      {/* Level Summary Header */}
      <div className="bg-[#141d21] p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-white block text-xs">
            Level {selectedConfig.id} ({selectedConfig.gridRows}×{selectedConfig.gridCols})
          </span>
          <span className="text-[10px] text-slate-400">
            {selectedConfig.targetWeeks}w · {selectedConfig.budgets.wolves} wolves
          </span>
        </div>

        <div className="text-right">
          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Top Score</span>
          <span className="font-mono font-bold text-xs text-lime-400">
            {entries.length > 0 ? `${entries[0].sheepAlive} 🐑 Alive` : 'None yet'}
          </span>
        </div>
      </div>

      {/* Rankings List */}
      <div className="overflow-y-auto max-h-[320px] space-y-1.5 pr-1 scrollbar-thin">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-slate-500 text-xs text-center">
            <Star className="w-6 h-6 text-slate-600 mb-1.5 opacity-40" />
            <span>No scores recorded yet for Level {selectedConfig.id}.</span>
            <span className="text-[10px] text-slate-600 mt-0.5">Win this level to claim 1st place!</span>
          </div>
        ) : (
          entries.map((entry, idx) => {
            const isCurrentPlayer = entry.playerName.toLowerCase() === (profile?.name || '').toLowerCase();

            return (
              <div
                key={entry.id || idx}
                className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                  isCurrentPlayer
                    ? 'bg-gradient-to-r from-[#1b2b25] to-[#162227] border-lime-500/40 shadow-sm'
                    : 'bg-[#121a1d] border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 flex items-center justify-center">
                    {getRankBadge(idx)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isCurrentPlayer ? 'text-lime-300' : 'text-white'}`}>
                        {entry.playerName}
                      </span>
                      {isCurrentPlayer && (
                        <span className="text-[8px] bg-lime-500/20 text-lime-400 px-1 py-0.2 rounded font-bold uppercase">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(entry.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-sky-400 block">
                    🐑 {entry.sheepAlive} Alive
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {entry.weeksSurvived}w survived
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
