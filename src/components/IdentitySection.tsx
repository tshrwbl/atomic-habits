import React from 'react';
import { UserCheck, Award, Sparkles, Plus, CheckCircle2, Flame } from 'lucide-react';
import { Habit } from '../types';

interface IdentitySectionProps {
  habits: Habit[];
  onOpenAddModal: () => void;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({ habits, onOpenAddModal }) => {
  // Aggregate habits by identity
  const identityMap = new Map<string, { habits: Habit[]; totalVotes: number }>();

  habits.forEach((h) => {
    const id = h.identity || 'Better Self';
    if (!identityMap.has(id)) {
      identityMap.set(id, { habits: [], totalVotes: 0 });
    }
    const item = identityMap.get(id)!;
    item.habits.push(h);
    item.totalVotes += h.completedDates.length;
  });

  const identityList = Array.from(identityMap.entries()).map(([identity, data]) => ({
    identity,
    habits: data.habits,
    totalVotes: data.totalVotes,
  })).sort((a, b) => b.totalVotes - a.totalVotes);

  const getTier = (votes: number) => {
    if (votes >= 50) return { label: 'Solidified Identity', color: 'text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20' };
    if (votes >= 20) return { label: 'Strong Evidence', color: 'text-amber-800 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20' };
    if (votes >= 5) return { label: 'Gaining Traction', color: 'text-sky-800 dark:text-sky-300 bg-sky-500/10 dark:bg-sky-500/15 border-sky-500/20' };
    return { label: 'Casting First Ballots', color: 'text-stone-700 dark:text-stone-300 bg-stone-500/10 dark:bg-stone-500/15 border-stone-500/20' };
  };

  return (
    <div className="space-y-6">
      {/* James Clear identity wisdom banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5 sm:p-6 rounded-2xl border border-amber-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center flex-shrink-0 shadow-md">
            <UserCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
              Identity-Based Habits
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 mt-1 max-w-3xl leading-relaxed">
              "Every action you take is a vote for the type of person you wish to become. No single instance will transform your beliefs, but as the votes build up, so does the evidence of your new identity."
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Decide who you want to be. Then prove it to yourself with small wins.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Identities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {identityList.map(({ identity, habits: idHabits, totalVotes }) => {
          const tier = getTier(totalVotes);
          const maxTarget = 50;
          const progressPercent = Math.min(100, Math.round((totalVotes / maxTarget) * 100));

          return (
            <div
              key={identity}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${tier.color}`}>
                    {tier.label}
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white mt-1.5">
                    "I am a {identity}"
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-400">
                    {totalVotes}
                  </div>
                  <div className="text-[10px] text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-tight">
                    votes cast
                  </div>
                </div>
              </div>

              {/* Progress bar towards 50 votes milestone */}
              <div>
                <div className="flex justify-between text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                  <span>Identity Evidence Level</span>
                  <span>{totalVotes} / 50 votes</span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Supporting Habits */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800/80">
                <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Supporting Habits ({idHabits.length}):
                </div>
                <div className="space-y-1.5">
                  {idHabits.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span className="text-stone-900 dark:text-stone-100 font-medium truncate">{h.title}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex-shrink-0 ml-2">
                        <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{h.completedDates.length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {identityList.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
          <p className="text-stone-600 dark:text-stone-400 text-sm font-medium">No identities configured yet.</p>
          <button
            onClick={onOpenAddModal}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-500 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Design Your First Habit</span>
          </button>
        </div>
      )}
    </div>
  );
};
