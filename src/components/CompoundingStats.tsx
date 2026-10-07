import React, { useState } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Award, 
  Calendar, 
  Zap, 
  Target, 
  Settings, 
  Sparkles
} from 'lucide-react';
import { Habit, BettermentPeriod } from '../types';
import { calculateStreak, getPastDays, getTodayDateString } from '../utils/dateUtils';
import { getBettermentSnapshot, getBettermentTrajectory } from '../utils/bettermentUtils';

interface CompoundingStatsProps {
  habits: Habit[];
  onOpenBetterment?: (habit: Habit) => void;
}

export const CompoundingStats: React.FC<CompoundingStatsProps> = ({ 
  habits, 
  onOpenBetterment 
}) => {
  const [dailyRate, setDailyRate] = useState<number>(1); // 1%
  const [periodFilter, setPeriodFilter] = useState<'all' | BettermentPeriod>('all');

  const todayStr = getTodayDateString();

  // Math: (1 + rate / 100)^365
  const compoundYear = Math.pow(1 + dailyRate / 100, 365).toFixed(2);

  // User stats calculation
  const totalHabits = habits.length;
  let totalVotes = 0;
  let bestStreak = 0;
  let currentActiveStreaks = 0;

  habits.forEach((h) => {
    totalVotes += h.completedDates.length;
    const streak = calculateStreak(h.completedDates);
    if (streak.currentStreak > 0) currentActiveStreaks++;
    if (streak.longestStreak > bestStreak) bestStreak = streak.longestStreak;
  });

  // Calculate past 7 days consistency rate
  const past7 = getPastDays(7);
  let possible7 = past7.length * totalHabits;
  let actual7 = 0;

  past7.forEach((day) => {
    habits.forEach((h) => {
      if (h.completedDates.includes(day.dateStr)) {
        actual7++;
      }
    });
  });

  const consistencyRate = possible7 > 0 ? Math.round((actual7 / possible7) * 100) : 0;

  // Filter habits with 1% Betterment Engine active
  const bettermentHabits = habits.filter((h) => {
    if (!h.betterment?.enabled) return false;
    if (periodFilter !== 'all' && h.betterment.period !== periodFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1% Better Every Day Flip7 Arcade Showcase */}
      <div className="relative rounded-3xl bg-surface border-2 border-line border-l-[6px] border-l-f7-gold p-6 sm:p-8 shadow-card overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-f7-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-f7-gold/25 text-f7-teal-dark dark:text-f7-gold border border-f7-gold text-xs font-black mb-3 shadow-xs">
              <TrendingUp className="w-4 h-4 text-f7-coral" />
              <span>Aggregation of Marginal Gains</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
              Habits are the compound interest of self-improvement.
            </h2>
            <p className="text-ink-3 text-xs sm:text-sm font-semibold mt-2 leading-relaxed">
              If you can get just 1% better each day for one year, you’ll end up <strong className="text-ink font-black">thirty-seven times better</strong> by the time you’re done. Tiny progressive gains compound into massive transformations.
            </p>
          </div>

          {/* Big Math Game Display in Cream Card */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-5 sm:p-6 bg-f7-cream rounded-3xl border-2 border-f7-gold shadow-accent-glow flex-shrink-0">
            <div className="text-right">
              <div className="text-[10px] uppercase font-black tracking-wider text-f7-teal-dark">1% Better Daily</div>
              <div className="text-3xl sm:text-4xl font-black text-f7-teal-dark leading-none mt-1">
                1.01<sup>365</sup> = <span className="text-f7-teal-dark">37.78x</span>
              </div>
            </div>
            <div className="text-right mt-3.5 pt-3.5 border-t-2 border-dashed border-f7-gold-dark/30 hidden sm:block">
              <div className="text-[10px] uppercase font-black tracking-wider text-f7-coral-dark">1% Worse Daily</div>
              <div className="text-xl font-black text-f7-coral-dark">
                0.99<sup>365</sup> = 0.03
              </div>
            </div>
          </div>
        </div>

        {/* Interactive rate slider (Flip7 Pills) */}
        <div className="relative mt-8 pt-6 border-t-2 border-dashed border-line">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-ink-3 font-bold">Test Daily Rate:</span>
              <div className="text-sm font-black text-f7-coral-dark mt-0.5">
                +{dailyRate}% improvement per day &rarr; {compoundYear}x growth in 1 year!
              </div>
            </div>
            <div className="flex items-center gap-2" role="group" aria-label="Daily improvement rate">
              {[0.5, 1, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setDailyRate(rate)}
                  aria-pressed={dailyRate === rate}
                  className={`f7-pill px-3.5 py-1 text-xs ${
                    dailyRate === rate ? 'f7-pill-gold' : ''
                  }`}
                >
                  +{rate}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Progress & Consistency Metrics (Flip7 4-Pillar Podiums) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4.5">
        {/* Metric 1: Consistency (Teal) */}
        <div className="rounded-3xl bg-surface border-2 border-line border-l-[6px] border-l-f7-teal p-5 shadow-card">
          <div className="flex items-center justify-between text-ink-3 mb-2 font-black">
            <span className="text-xs uppercase tracking-wider">7-Day Consistency</span>
            <Calendar className="w-4 h-4 text-f7-teal" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink">
            {consistencyRate}%
          </div>
          <p className="text-xs font-bold text-ink-3 mt-1">
            {actual7} of {possible7} check-ins
          </p>
        </div>

        {/* Metric 2: Identity Votes (Gold) */}
        <div className="rounded-3xl bg-surface border-2 border-line border-l-[6px] border-l-f7-gold p-5 shadow-accent-glow">
          <div className="flex items-center justify-between text-ink-3 mb-2 font-black">
            <span className="text-xs uppercase tracking-wider">Identity Votes</span>
            <Award className="w-4 h-4 text-f7-gold-dark" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-f7-teal-dark dark:text-f7-gold">
            {totalVotes}
          </div>
          <p className="text-xs font-bold text-ink-3 mt-1">
            Lifetime ballots cast
          </p>
        </div>

        {/* Metric 3: Active Streaks (Coral) */}
        <div className="rounded-3xl bg-surface border-2 border-line border-l-[6px] border-l-f7-coral p-5 shadow-coral-glow">
          <div className="flex items-center justify-between text-ink-3 mb-2 font-black">
            <span className="text-xs uppercase tracking-wider">Active Streaks</span>
            <Flame className="w-4 h-4 text-f7-coral fill-f7-coral" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink">
            {currentActiveStreaks} / {totalHabits}
          </div>
          <p className="text-xs font-bold text-ink-3 mt-1">
            Habits continuing today
          </p>
        </div>

        {/* Metric 4: Longest Streak (Sky Blue) */}
        <div className="rounded-3xl bg-surface border-2 border-line border-l-[6px] border-l-f7-sky p-5 shadow-sky-glow">
          <div className="flex items-center justify-between text-ink-3 mb-2 font-black">
            <span className="text-xs uppercase tracking-wider">Longest Streak</span>
            <Zap className="w-4 h-4 text-f7-sky" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-f7-sky">
            {bestStreak} days
          </div>
          <p className="text-xs font-bold text-ink-3 mt-1">
            Personal best record
          </p>
        </div>
      </div>

      {/* 1% Betterment Engine Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div>
            <h3 className="text-xl font-black text-ink flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-f7-teal" />
              <span>1% Betterment Engine</span>
            </h3>
            <p className="text-xs text-ink-3 font-semibold">
              Progressive micro-overload tracking calibrated across customizable time cycles
            </p>
          </div>

          {/* Period Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar" role="group" aria-label="Filter by period">
            {(['all', 'daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodFilter(p)}
                aria-pressed={periodFilter === p}
                className={`f7-pill capitalize text-xs px-3.5 py-1.5 ${
                  periodFilter === p ? 'f7-pill-gold' : ''
                }`}
              >
                {p === 'all' ? 'All Periods' : p}
              </button>
            ))}
          </div>
        </div>

        {/* Betterment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bettermentHabits.map((habit) => {
            const snapshot = getBettermentSnapshot(habit, todayStr);
            if (!snapshot) return null;
            const trajectory = getBettermentTrajectory(habit, 4);

            return (
              <div
                key={habit.id}
                className="rounded-3xl bg-surface border-2 border-line border-l-[6px] border-l-f7-gold p-6 shadow-card space-y-4 hover:border-f7-gold/70 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="f7-chip bg-f7-gold/25 text-f7-teal-dark dark:text-f7-gold border border-f7-gold font-black uppercase tracking-wider">
                        +{snapshot.ratePercent}% / {snapshot.period}
                      </span>
                      <span className="text-xs font-bold text-ink-3">
                        {snapshot.periodLabel}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-ink">
                      {habit.title}
                    </h4>
                    <p className="text-xs text-ink-3 font-bold">
                      Identity: {habit.identity}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenBetterment?.(habit)}
                    className="w-9 h-9 rounded-full bg-surface border-2 border-line flex items-center justify-center text-ink-2 hover:border-f7-teal hover:text-ink shadow-xs cursor-pointer"
                    title="Open Betterment Engine Settings & Logging"
                    aria-label={`Open Betterment Engine settings for ${habit.title}`}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {/* Betterment Progress & Target Stats in Cream Inset */}
                <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-f7-cream border border-f7-gold/40 text-center">
                  <div>
                    <div className="text-[10px] font-black text-ink-3 uppercase">Baseline</div>
                    <div className="text-sm font-black text-ink mt-0.5">
                      {snapshot.baseline}
                    </div>
                    <div className="text-[11px] font-bold text-ink-3 truncate">{snapshot.unit}</div>
                  </div>

                  <div className="border-x-2 border-dashed border-f7-gold-dark/30">
                    <div className="text-[10px] font-black text-f7-teal-dark uppercase">
                      Today's Target
                    </div>
                    <div className="text-base font-black text-f7-teal-dark mt-0.5">
                      {snapshot.currentTarget}
                    </div>
                    <div className="text-[11px] font-bold text-f7-coral-dark truncate">
                      {snapshot.actualLoggedToday !== null ? `✓ ${snapshot.actualLoggedToday}` : snapshot.unit}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-black text-f7-coral-dark uppercase">1-Yr Target</div>
                    <div className="text-sm font-black text-f7-coral-dark mt-0.5">
                      {snapshot.projectedOneYear}
                    </div>
                    <div className="text-[11px] font-bold text-ink-3 truncate">{snapshot.unit}</div>
                  </div>
                </div>

                {/* Trajectory Milestone Chips */}
                <div className="space-y-1.5">
                  <div className="text-xs font-black text-ink-3 flex items-center justify-between">
                    <span>Compounding Trajectory:</span>
                    <span className="text-f7-teal font-black">
                      +{snapshot.percentGrowth}% achieved
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {trajectory.map((point) => (
                      <div
                        key={point.label}
                        className="flex-1 py-1.5 px-1 rounded-xl bg-surface-2 border border-line text-center shadow-xs"
                      >
                        <div className="text-[10px] text-ink-3 font-black uppercase tracking-wide">{point.label}</div>
                        <div className="text-xs font-black text-ink">{point.projected}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => onOpenBetterment?.(habit)}
                  className="f7-btn f7-btn-gold w-full text-xs py-2 shadow-accent-glow"
                >
                  <Target className="w-4 h-4" />
                  <span>Log Output / Adjust Engine</span>
                </button>
              </div>
            );
          })}
        </div>

        {bettermentHabits.length === 0 && (
          <div className="rounded-3xl bg-surface border-2 border-line p-8 text-center text-xs font-bold text-ink-3">
            No habits currently matching this time period with 1% Betterment Engine active.
          </div>
        )}
      </div>

      {/* Cadence Comparison Guide (Flip7 Tri-Card Layout) */}
      <div className="rounded-3xl bg-surface-2 border-2 border-line p-6 space-y-4">
        <h4 className="font-black text-ink text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-f7-gold" />
          <span>Understanding the 1% Betterment Cadences:</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-4 rounded-2xl bg-surface border-2 border-line border-l-4 border-l-f7-gold shadow-xs">
            <div className="font-black text-f7-gold-dark">1% Daily (365 cycles)</div>
            <div className="text-xl font-black text-ink mt-0.5">37.78x Gain</div>
            <p className="text-ink-3 text-xs font-semibold mt-1">
              Perfect for divisible daily actions like reading pages, pushups, or flashcards.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border-2 border-line border-l-4 border-l-f7-teal shadow-xs">
            <div className="font-black text-f7-teal">1% Weekly (52 cycles)</div>
            <div className="text-xl font-black text-ink mt-0.5">1.68x Gain (+68%)</div>
            <p className="text-ink-3 text-xs font-semibold mt-1">
              Ideal for physical conditioning, writing word counts, and meditation where rest matters.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border-2 border-line border-l-4 border-l-f7-sky shadow-xs">
            <div className="font-black text-f7-sky">1% Monthly (12 cycles)</div>
            <div className="text-xl font-black text-ink mt-0.5">1.13x Gain (+13%)</div>
            <p className="text-ink-3 text-xs font-semibold mt-1">
              Best for cognitive depth, project milestone lengths, and broader skill challenges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
