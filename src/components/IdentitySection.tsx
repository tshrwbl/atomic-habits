import React from 'react';
import { UserCheck, Award, Sparkles, Plus, CheckCircle2, Flame, Crown, Medal } from 'lucide-react';
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
    if (votes >= 50) return { 
      label: 'Solidified Identity', 
      cardClass: 'border-l-[6px] border-l-f7-gold shadow-accent-glow',
      badgeClass: 'bg-f7-gold text-[#173836] border border-f7-gold-dark font-black',
      icon: <Crown className="w-4 h-4 text-[#173836]" />,
      barGradient: 'from-f7-gold-light via-f7-gold to-f7-gold-dark'
    };
    if (votes >= 20) return { 
      label: 'Strong Evidence', 
      cardClass: 'border-l-[6px] border-l-f7-teal shadow-teal-glow',
      badgeClass: 'bg-f7-teal text-white border border-f7-teal-dark font-black',
      icon: <Medal className="w-4 h-4 text-white" />,
      barGradient: 'from-f7-teal-light to-f7-teal-dark'
    };
    if (votes >= 5) return { 
      label: 'Gaining Traction', 
      cardClass: 'border-l-[6px] border-l-f7-coral shadow-coral-glow',
      badgeClass: 'bg-f7-coral text-white border border-f7-coral-dark font-black',
      icon: <Medal className="w-4 h-4 text-white" />,
      barGradient: 'from-f7-coral-light to-f7-coral-dark'
    };
    return { 
      label: 'Casting First Ballots', 
      cardClass: 'border-l-[6px] border-l-f7-sky shadow-sky-glow',
      badgeClass: 'bg-sky-bg text-sky-fg border border-f7-sky/40 font-bold',
      icon: <Award className="w-4 h-4 text-f7-sky" />,
      barGradient: 'from-f7-sky to-f7-teal'
    };
  };

  return (
    <div className="space-y-6">
      {/* James Clear Identity Hero Banner */}
      <div className="rounded-3xl bg-surface border-2 border-line border-l-[6px] border-l-f7-teal p-6 sm:p-7 shadow-card">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-f7-teal text-white flex items-center justify-center flex-shrink-0 shadow-teal-glow">
            <UserCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-f7-teal-dark dark:text-f7-teal-light uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-f7-gold" />
              <span>Identity-First Behavior</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-ink">
              Every Habit Casts a Ballot
            </h2>
            <p className="text-xs sm:text-sm text-ink-3 font-semibold mt-1 max-w-3xl leading-relaxed">
              "Every action you take is a vote for the type of person you wish to become. No single instance transforms your beliefs, but as the votes build up, so does the evidence of your new identity."
            </p>
          </div>
        </div>
      </div>

      {/* Identities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {identityList.map(({ identity, habits: idHabits, totalVotes }) => {
          const tier = getTier(totalVotes);
          const maxTarget = 50;
          const progressPercent = Math.min(100, Math.round((totalVotes / maxTarget) * 100));

          return (
            <div
              key={identity}
              className={`rounded-3xl bg-surface border-2 border-line ${tier.cardClass} p-5 sm:p-6 shadow-sm space-y-4.5 transition-all`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs ${tier.badgeClass}`}>
                    {tier.icon}
                    <span>{tier.label}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-ink mt-2">
                    "I am a {identity}"
                  </h3>
                </div>

                <div className="text-right p-3 rounded-2xl bg-f7-cream border border-f7-gold/50 shadow-xs flex-shrink-0">
                  <div className="text-2xl sm:text-3xl font-black text-f7-teal-dark leading-none">
                    {totalVotes}
                  </div>
                  <div className="text-[10px] text-f7-coral-dark font-extrabold uppercase tracking-tight mt-0.5">
                    votes cast
                  </div>
                </div>
              </div>

              {/* Progress bar towards 50 votes milestone */}
              <div>
                <div className="flex justify-between text-xs font-bold text-ink-3 mb-1.5">
                  <span>Identity Evidence Level</span>
                  <span className="text-ink font-black">{totalVotes} / 50 ballots</span>
                </div>
                <div className="w-full bg-surface-2 h-3 rounded-full overflow-hidden border border-line-strong p-0.5">
                  <div
                    className={`bg-gradient-to-r ${tier.barGradient} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Supporting Habits */}
              <div className="space-y-2 pt-3 border-t-2 border-dashed border-line">
                <div className="text-xs font-black text-ink">
                  Supporting Habits ({idHabits.length}):
                </div>
                <div className="space-y-2">
                  {idHabits.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-surface-2 border border-line"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <CheckCircle2 className="w-4 h-4 text-f7-teal flex-shrink-0" />
                        <span className="text-ink font-bold truncate">{h.title}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-black text-f7-coral flex-shrink-0 ml-2">
                        <Flame className="w-3.5 h-3.5 fill-current" />
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
        <div className="text-center py-14 bg-surface rounded-3xl border-3 border-dashed border-line p-6">
          <p className="text-ink-3 text-sm font-bold">No identities configured yet.</p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="mt-4 f7-btn f7-btn-gold text-xs px-6 py-2.5 shadow-accent-glow"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Design Your First Habit</span>
          </button>
        </div>
      )}
    </div>
  );
};
