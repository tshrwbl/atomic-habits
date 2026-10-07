import React, { useState } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Award, 
  Calendar, 
  Zap, 
  Target, 
  Settings, 
  ArrowRight,
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
  const activeHabits = habits.filter(h => !h.archived);
  const totalHabits = activeHabits.length;
  let totalVotes = 0;
  let bestStreak = 0;
  let currentActiveStreaks = 0;

  activeHabits.forEach((h) => {
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
    activeHabits.forEach((h) => {
      if (h.completedDates.includes(day.dateStr)) {
        actual7++;
      }
    });
  });

  const consistencyRate = possible7 > 0 ? Math.round((actual7 / possible7) * 100) : 0;

  // Filter habits with 1% Betterment Engine active
  const bettermentHabits = activeHabits.filter((h) => {
    if (!h.betterment?.enabled) return false;
    if (periodFilter !== 'all' && h.betterment.period !== periodFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1% Better Every Day Showcase */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>The Aggregation of Marginal Gains</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Habits are the compound interest of self-improvement.
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm mt-2 leading-relaxed">
              If you can get just 1% better each day for one year, you’ll end up <strong>thirty-seven times better</strong> by the time you’re done. Tiny progressive gains compound into massive life transformations.
            </p>
          </div>

          {/* Big Math Display */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10 flex-shrink-0">
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-stone-400">1% Better Every Day</div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-0.5">
                1.01<sup>365</sup> = 37.78x
              </div>
            </div>
            <div className="text-right mt-3 pt-3 border-t border-white/10 hidden sm:block">
              <div className="text-xs uppercase tracking-wider text-stone-400">1% Worse Every Day</div>
              <div className="text-lg font-bold text-rose-400">
                0.99<sup>365</sup> = 0.03
              </div>
            </div>
          </div>
        </div>

        {/* Interactive rate slider */}
        <div className="mt-8 pt-6 border-t border-stone-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-stone-400 font-medium">Test Daily Rate:</span>
              <div className="text-sm font-bold text-amber-400 mt-0.5">
                +{dailyRate}% improvement per day &rarr; {compoundYear}x growth in 1 year!
              </div>
            </div>
            <div className="flex items-center gap-3">
              {[0.5, 1, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setDailyRate(rate)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    dailyRate === rate
                      ? 'bg-amber-500 text-stone-950 shadow-md'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  +{rate}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Progress & Consistency Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 mb-2 font-semibold">
            <span className="text-xs uppercase tracking-wider">7-Day Consistency</span>
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
            {consistencyRate}%
          </div>
          <p className="text-[11px] font-medium text-stone-600 dark:text-stone-400 mt-1">
            {actual7} of {possible7} habit check-ins
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 mb-2 font-semibold">
            <span className="text-xs uppercase tracking-wider">Identity Votes</span>
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400">
            {totalVotes}
          </div>
          <p className="text-[11px] font-medium text-stone-600 dark:text-stone-400 mt-1">
            Lifetime habit reps completed
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 mb-2 font-semibold">
            <span className="text-xs uppercase tracking-wider">Active Streaks</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
            {currentActiveStreaks} / {totalHabits}
          </div>
          <p className="text-[11px] font-medium text-stone-600 dark:text-stone-400 mt-1">
            Habits currently ongoing
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 mb-2 font-semibold">
            <span className="text-xs uppercase tracking-wider">Longest Streak</span>
            <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-700 dark:text-sky-400">
            {bestStreak} days
          </div>
          <p className="text-[11px] font-medium text-stone-600 dark:text-stone-400 mt-1">
            Personal best unbroken streak
          </p>
        </div>
      </div>

      {/* 1% Betterment Engine Habit Trackers */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <span>1% Betterment Engine for Habits</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Track how your individual habits are progressive-overloading across time periods
            </p>
          </div>

          {/* Period Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl">
            {(['all', 'daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  periodFilter === p
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {p === 'all' ? 'All Periods' : p}
              </button>
            ))}
          </div>
        </div>

        {/* Betterment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bettermentHabits.map((habit) => {
            const snapshot = getBettermentSnapshot(habit, todayStr);
            if (!snapshot) return null;
            const trajectory = getBettermentTrajectory(habit, 4);

            return (
              <div
                key={habit.id}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                        +{snapshot.ratePercent}% / {snapshot.period}
                      </span>
                      <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400">
                        {snapshot.periodLabel}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-stone-900 dark:text-white">
                      {habit.title}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Identity: {habit.identity}
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenBetterment?.(habit)}
                    className="p-2 text-stone-500 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
                    title="Open Betterment Engine Settings & Logging"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {/* Betterment Progress & Target Stats */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 text-center">
                  <div>
                    <div className="text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase">Baseline</div>
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                      {snapshot.baseline}
                    </div>
                    <div className="text-[10px] font-medium text-stone-600 dark:text-stone-400 truncate">{snapshot.unit}</div>
                  </div>

                  <div className="border-x border-stone-200 dark:border-stone-700/60">
                    <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                      Today's Target
                    </div>
                    <div className="text-base font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {snapshot.currentTarget}
                    </div>
                    <div className="text-[10px] font-medium text-stone-600 dark:text-stone-400 truncate">
                      {snapshot.actualLoggedToday !== null ? `✓ Done: ${snapshot.actualLoggedToday}` : snapshot.unit}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">1-Yr Target</div>
                    <div className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                      {snapshot.projectedOneYear}
                    </div>
                    <div className="text-[10px] font-medium text-stone-600 dark:text-stone-400 truncate">{snapshot.unit}</div>
                  </div>
                </div>

                {/* Trajectory Milestone Chips */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 flex items-center justify-between">
                    <span>Compounding Trajectory:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      +{snapshot.percentGrowth}% growth achieved
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {trajectory.map((point) => (
                      <div
                        key={point.label}
                        className="flex-1 py-1.5 px-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center"
                      >
                        <div className="text-[9px] text-stone-600 dark:text-stone-400 font-bold uppercase">{point.label}</div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">{point.projected}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => onOpenBetterment?.(habit)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Log Output / Adjust Betterment Engine</span>
                </button>
              </div>
            );
          })}
        </div>

        {bettermentHabits.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
            No habits currently matching this time period with 1% Betterment Engine active.
          </div>
        )}
      </div>

      {/* Cadence Comparison Guide */}
      <div className="bg-stone-100 dark:bg-stone-900/60 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-3">
        <h4 className="font-bold text-stone-900 dark:text-white text-sm flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Understanding the 1% Betterment Time Periods:</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <div className="font-bold text-amber-700 dark:text-amber-400">1% Daily (365 cycles)</div>
            <div className="text-lg font-black text-stone-900 dark:text-white mt-0.5">37.78x Gain</div>
            <p className="text-stone-600 dark:text-stone-400 text-[11px] mt-1">
              Perfect for divisible, bite-sized daily habits like reading pages, pushups, or flashcards.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <div className="font-bold text-emerald-700 dark:text-emerald-400">1% Weekly (52 cycles)</div>
            <div className="text-lg font-black text-stone-900 dark:text-white mt-0.5">1.68x Gain (+68%)</div>
            <p className="text-stone-600 dark:text-stone-400 text-[11px] mt-1">
              Ideal for physical conditioning, writing word counts, and meditation duration where weekly recovery matters.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <div className="font-bold text-sky-700 dark:text-sky-400">1% Monthly (12 cycles)</div>
            <div className="text-lg font-black text-stone-900 dark:text-white mt-0.5">1.13x Gain (+13%)</div>
            <p className="text-stone-600 dark:text-stone-400 text-[11px] mt-1">
              Best for complex cognitive goals, deep work sprint lengths, and broader milestone challenges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
