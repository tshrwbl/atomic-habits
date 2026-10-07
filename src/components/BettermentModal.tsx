import React, { useState } from 'react';
import { X, TrendingUp, Zap, Target, Calendar, Check, Save } from 'lucide-react';
import { Habit, BettermentPeriod } from '../types';
import { getBettermentSnapshot, getBettermentTrajectory } from '../utils/bettermentUtils';
import { getTodayDateString } from '../utils/dateUtils';
import { triggerCompletionConfetti } from '../utils/confetti';

interface BettermentModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateHabitBetterment: (
    habitId: string,
    bettermentConfig: Habit['betterment'],
    loggedValue?: number,
    logDate?: string
  ) => void;
}

export const BettermentModal: React.FC<BettermentModalProps> = ({
  habit,
  isOpen,
  onClose,
  onUpdateHabitBetterment,
}) => {
  if (!isOpen || !habit) return null;

  const todayStr = getTodayDateString();
  const snapshot = getBettermentSnapshot(habit, todayStr);

  const [actualValue, setActualValue] = useState<string>(
    snapshot?.actualLoggedToday?.toString() || snapshot?.currentTarget.toString() || ''
  );
  const [period, setPeriod] = useState<BettermentPeriod>(
    habit.betterment?.period || 'daily'
  );
  const [baseline, setBaseline] = useState<number>(
    habit.betterment?.baselineValue || 10
  );
  const [unit, setUnit] = useState<string>(
    habit.betterment?.unit || 'pages'
  );
  const [ratePercent, setRatePercent] = useState<number>(
    habit.betterment?.ratePercent || 1
  );

  const trajectory = getBettermentTrajectory({
    ...habit,
    betterment: {
      enabled: true,
      baselineValue: baseline,
      unit,
      period,
      ratePercent,
      startDate: habit.betterment?.startDate || habit.createdAt,
    },
  });

  const handleSaveAndLog = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedActual = parseFloat(actualValue);

    const updatedConfig = {
      enabled: true,
      baselineValue: Number(baseline),
      unit: unit.trim() || 'units',
      period,
      ratePercent: Number(ratePercent),
      startDate: habit.betterment?.startDate || habit.createdAt,
    };

    onUpdateHabitBetterment(
      habit.id,
      updatedConfig,
      !isNaN(parsedActual) ? parsedActual : undefined,
      todayStr
    );

    if (!isNaN(parsedActual) && parsedActual >= (snapshot?.currentTarget || 0)) {
      triggerCompletionConfetti();
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-stone-950 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4 text-stone-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                1% Betterment Engine
              </h2>
              <p className="text-[11px] text-stone-600 dark:text-stone-400">
                {habit.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSaveAndLog} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Today's Target Card */}
          {snapshot && (
            <div className="bg-gradient-to-br from-amber-500/10 via-stone-50 to-emerald-500/10 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md">
                    {snapshot.periodLabel} Milestone
                  </span>
                  <div className="text-xs text-stone-600 dark:text-stone-400 mt-1 font-medium">
                    Compounded Target for Today:
                  </div>
                  <div className="text-2xl font-black text-stone-900 dark:text-white mt-0.5">
                    {snapshot.currentTarget} <span className="text-sm font-semibold text-stone-600 dark:text-stone-400">{snapshot.unit}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    +{snapshot.percentGrowth}% Growth
                  </div>
                  <div className="text-[11px] font-medium text-stone-600 dark:text-stone-400">
                    from baseline {snapshot.baseline} {snapshot.unit}
                  </div>
                </div>
              </div>

              {/* Log today's actual performance */}
              <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
                <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-500" />
                  <span>Log Actual Today:</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    value={actualValue}
                    onChange={(e) => setActualValue(e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm font-bold text-center focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">{unit}</span>
                </div>
              </div>
            </div>
          )}

          {/* Betterment Configuration Form */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Betterment Cadence & Baseline
            </h3>

            {/* Time Period Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1.5">
                Compounding Time Period:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'daily', label: 'Daily (+1% each day)', desc: 'Fast rapid gains' },
                  { id: 'weekly', label: 'Weekly (+1% each week)', desc: 'Sustainable & solid' },
                  { id: 'monthly', label: 'Monthly (+1% each mo)', desc: 'Steady lifestyle shifts' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPeriod(item.id as BettermentPeriod)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      period === item.id
                        ? 'border-amber-500 bg-amber-500/10 text-stone-900 dark:text-white font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    <div className="text-xs font-semibold capitalize">{item.id}</div>
                    <div className="text-[10px] text-stone-600 dark:text-stone-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Baseline & Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Starting Baseline:
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={baseline}
                  onChange={(e) => setBaseline(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Metric Unit:
                </label>
                <input
                  type="text"
                  placeholder="e.g. pages, mins, reps"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Rate percent */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                Improvement Rate per {period}:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 5].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setRatePercent(rate)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      ratePercent === rate
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    +{rate}% / {period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Compounding Trajectory Road Map */}
          <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Projected Compounding Milestones
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {trajectory.map((point) => (
                <div
                  key={point.label}
                  className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-center"
                >
                  <div className="text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase">
                    {point.label}
                  </div>
                  <div className="text-sm font-extrabold text-stone-900 dark:text-white mt-0.5">
                    {point.projected}
                  </div>
                  <div className="text-[10px] font-medium text-stone-600 dark:text-stone-400 truncate">
                    {unit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-500 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Save & Log Progress</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
