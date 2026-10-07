import React, { useState } from 'react';
import { TrendingUp, Target, Save } from 'lucide-react';
import { Habit, BettermentPeriod } from '../types';
import { getBettermentSnapshot, getBettermentTrajectory } from '../utils/bettermentUtils';
import { getTodayDateString } from '../utils/dateUtils';
import { triggerCompletionConfetti } from '../utils/confetti';
import { Modal } from './Modal';

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

  const formId = `betterment-form-${habit.id}`;

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="1% Betterment Engine"
      subtitle={habit.title}
      icon={<TrendingUp className="w-5 h-5 text-f7-teal" />}
      size="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="f7-btn f7-btn-secondary text-xs px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            className="f7-btn f7-btn-gold text-xs px-5 py-2 shadow-accent-glow"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Save & Log Progress</span>
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSaveAndLog} className="space-y-5">
        {/* Today's Target Card in Cream Surface */}
        {snapshot && (
          <div className="bg-f7-cream text-ink p-5 rounded-3xl border-2 border-f7-gold shadow-accent-glow">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-f7-teal-dark bg-f7-gold/30 px-2.5 py-0.5 rounded-full border border-f7-gold">
                  {snapshot.periodLabel} Milestone
                </span>
                <div className="text-xs text-ink-3 mt-1.5 font-bold">
                  Compounded Target for Today:
                </div>
                <div className="text-3xl font-black text-f7-teal-dark mt-0.5 leading-none">
                  {snapshot.currentTarget} <span className="text-sm font-bold text-ink-3">{snapshot.unit}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black text-f7-coral-dark">
                  +{snapshot.percentGrowth}% Growth
                </div>
                <div className="text-[11px] font-bold text-ink-3">
                  from baseline {snapshot.baseline} {snapshot.unit}
                </div>
              </div>
            </div>

            {/* Log today's actual performance */}
            <div className="mt-4 pt-3.5 border-t-2 border-dashed border-f7-gold-dark/30 flex items-center justify-between gap-3">
              <label className="text-xs font-black text-f7-teal-dark flex items-center gap-1.5">
                <Target className="w-4 h-4 text-f7-coral" />
                <span>Log Actual Today:</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  value={actualValue}
                  onChange={(e) => setActualValue(e.target.value)}
                  className="f7-input w-28 text-center text-sm font-black py-1.5 px-3 bg-surface"
                />
                <span className="text-xs font-bold text-ink-2">{unit}</span>
              </div>
            </div>
          </div>
        )}

        {/* Betterment Configuration Form */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-ink-3">
            Betterment Cadence & Baseline
          </h3>

          {/* Time Period Selector */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              Compounding Time Period:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'daily', label: 'Daily', desc: '+1% each day' },
                { id: 'weekly', label: 'Weekly', desc: '+1% each week' },
                { id: 'monthly', label: 'Monthly', desc: '+1% each month' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPeriod(item.id as BettermentPeriod)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    period === item.id
                      ? 'border-f7-gold bg-f7-gold/20 text-ink font-black shadow-accent-glow'
                      : 'border-line bg-surface text-ink-2 hover:bg-surface-2'
                  }`}
                >
                  <div className="text-xs font-black capitalize">{item.label}</div>
                  <div className="text-[10px] font-bold text-ink-3 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Baseline & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Starting Baseline:
              </label>
              <input
                type="number"
                step="any"
                required
                value={baseline}
                onChange={(e) => setBaseline(parseFloat(e.target.value) || 0)}
                className="f7-input text-xs font-bold py-2 px-3"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Metric Unit:
              </label>
              <input
                type="text"
                placeholder="e.g. pages, mins, reps"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="f7-input text-xs font-bold py-2 px-3"
              />
            </div>
          </div>

          {/* Rate percent */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              Improvement Rate per {period}:
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setRatePercent(rate)}
                  className={`f7-pill text-xs px-3.5 py-1 ${
                    ratePercent === rate ? 'f7-pill-gold' : ''
                  }`}
                  aria-pressed={ratePercent === rate}
                >
                  +{rate}% / {period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compounding Trajectory Road Map */}
        <div className="space-y-2 pt-3 border-t-2 border-dashed border-line">
          <h3 className="text-xs font-black uppercase tracking-wider text-ink-3">
            Projected Compounding Milestones
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {trajectory.map((point) => (
              <div
                key={point.label}
                className="p-3 rounded-2xl bg-surface-2 border border-line text-center shadow-xs"
              >
                <div className="text-[10px] font-black text-ink-3 uppercase">
                  {point.label}
                </div>
                <div className="text-sm font-black text-ink mt-0.5">
                  {point.projected}
                </div>
                <div className="text-[10px] font-bold text-ink-3 truncate">
                  {unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};
