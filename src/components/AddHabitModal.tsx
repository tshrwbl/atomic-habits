import React, { useState, useEffect } from 'react';
import { X, Sparkles, User, Clock, ArrowRight, Zap, Gift, Check, TrendingUp, Layers, Link as LinkIcon, Unlink } from 'lucide-react';
import { Habit, TimeOfDay, BettermentPeriod } from '../types';
import { calculateTargetValue } from '../utils/bettermentUtils';
import { getTodayDateString } from '../utils/dateUtils';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveHabit: (
    habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>, 
    existingId?: string,
    parentHabitToLink?: Habit
  ) => void;
  editingHabit: Habit | null;
  allHabits?: Habit[];
  initialParentHabitId?: string | null;
}

const COMMON_IDENTITIES = [
  'Lifelong Learner',
  'Energized Athlete',
  'Mindful Thinker',
  'Master Craftsperson',
  'Healthy & Vital Person',
  'Organized Professional',
  'Consistent Writer',
  'Calm & Patient Parent',
];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onSaveHabit,
  editingHabit,
  allHabits = [],
  initialParentHabitId = null,
}) => {
  const [title, setTitle] = useState('');
  const [identity, setIdentity] = useState('');
  const [customIdentity, setCustomIdentity] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [stackAfter, setStackAfter] = useState('');
  const [twoMinuteVersion, setTwoMinuteVersion] = useState('');
  const [attractiveReward, setAttractiveReward] = useState('');

  // Routine & Habit Linking State
  const [isRoutineLinked, setIsRoutineLinked] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [routineNameInput, setRoutineNameInput] = useState('');

  // 1% Betterment Engine state
  const [bettermentEnabled, setBettermentEnabled] = useState(true);
  const [bettermentBaseline, setBettermentBaseline] = useState<number>(10);
  const [bettermentUnit, setBettermentUnit] = useState('pages');
  const [bettermentPeriod, setBettermentPeriod] = useState<BettermentPeriod>('daily');
  const [bettermentRate, setBettermentRate] = useState<number>(1);

  // Candidate habits that can be selected as a parent/anchor
  const candidateParents = allHabits.filter(
    (h) => !editingHabit || h.id !== editingHabit.id
  );

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title);
      setIdentity(editingHabit.identity);
      setCustomIdentity(COMMON_IDENTITIES.includes(editingHabit.identity) ? '' : editingHabit.identity);
      setTimeOfDay(editingHabit.timeOfDay);
      setStackAfter(editingHabit.habitStack?.after || '');
      setTwoMinuteVersion(editingHabit.twoMinuteVersion || '');
      setAttractiveReward(editingHabit.attractiveReward || '');

      const hasRoutine = Boolean(editingHabit.routineId);
      setIsRoutineLinked(hasRoutine);
      setSelectedParentId(editingHabit.linkedHabitId || '');
      setRoutineNameInput(editingHabit.routineName || '');

      if (editingHabit.betterment) {
        setBettermentEnabled(editingHabit.betterment.enabled);
        setBettermentBaseline(editingHabit.betterment.baselineValue);
        setBettermentUnit(editingHabit.betterment.unit);
        setBettermentPeriod(editingHabit.betterment.period);
        setBettermentRate(editingHabit.betterment.ratePercent);
      } else {
        setBettermentEnabled(false);
      }
    } else {
      setTitle('');
      setIdentity(COMMON_IDENTITIES[0]);
      setCustomIdentity('');
      setTwoMinuteVersion('');
      setAttractiveReward('');
      setBettermentEnabled(true);
      setBettermentBaseline(10);
      setBettermentUnit('pages');
      setBettermentPeriod('daily');
      setBettermentRate(1);

      if (initialParentHabitId) {
        const parent = allHabits.find((h) => h.id === initialParentHabitId);
        setIsRoutineLinked(true);
        setSelectedParentId(initialParentHabitId);
        setTimeOfDay(parent?.timeOfDay || 'morning');
        setRoutineNameInput(parent?.routineName || (parent ? `${parent.title} Routine` : 'Morning Momentum Routine'));
        setStackAfter(parent ? `I finish ${parent.title}` : '');
      } else {
        setIsRoutineLinked(false);
        setSelectedParentId('');
        setRoutineNameInput('');
        setTimeOfDay('morning');
        setStackAfter('');
      }
    }
  }, [editingHabit, isOpen, initialParentHabitId]);

  if (!isOpen) return null;

  // Compounded 1-year preview
  const periodsInYear = bettermentPeriod === 'daily' ? 365 : bettermentPeriod === 'weekly' ? 52 : 12;
  const projectedOneYear = calculateTargetValue(bettermentBaseline || 1, bettermentRate, periodsInYear);

  const handleParentHabitSelect = (parentId: string) => {
    setSelectedParentId(parentId);
    if (!parentId) return;

    const parent = allHabits.find((h) => h.id === parentId);
    if (parent) {
      if (parent.timeOfDay && parent.timeOfDay !== 'anytime') {
        setTimeOfDay(parent.timeOfDay);
      }
      setRoutineNameInput(parent.routineName || `${parent.title} Routine`);
      setStackAfter(`I finish ${parent.title}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalIdentity = customIdentity.trim() || identity || 'Better Self';

    // Determine routine parameters
    let finalRoutineId: string | undefined = undefined;
    let finalRoutineName: string | undefined = undefined;
    let finalOrder: number | undefined = undefined;
    let finalLinkedHabitId: string | undefined = undefined;
    let parentHabitToUpdate: Habit | undefined = undefined;

    if (isRoutineLinked) {
      const parent = allHabits.find((h) => h.id === selectedParentId);
      if (parent) {
        finalRoutineId = parent.routineId || `routine-${Date.now()}`;
        finalRoutineName = routineNameInput.trim() || parent.routineName || `${parent.title} Routine`;
        finalLinkedHabitId = parent.id;
        finalOrder = (parent.orderInRoutine || 1) + 1;
        
        // If parent wasn't part of a routine yet, pass it so App can update it as Step 1
        if (!parent.routineId) {
          parentHabitToUpdate = {
            ...parent,
            routineId: finalRoutineId,
            routineName: finalRoutineName,
            orderInRoutine: 1,
          };
        }
      } else if (editingHabit?.routineId) {
        finalRoutineId = editingHabit.routineId;
        finalRoutineName = routineNameInput.trim() || editingHabit.routineName || 'Daily Routine';
        finalOrder = editingHabit.orderInRoutine || 1;
        finalLinkedHabitId = editingHabit.linkedHabitId;
      } else {
        // Routine with no specific parent selected yet
        finalRoutineId = `routine-${Date.now()}`;
        finalRoutineName = routineNameInput.trim() || 'Daily Routine';
        finalOrder = 1;
      }
    }

    onSaveHabit(
      {
        title: title.trim(),
        identity: finalIdentity,
        timeOfDay,
        habitStack: {
          after: stackAfter.trim() || 'my regular routine',
          then: title.trim(),
        },
        routineId: finalRoutineId,
        routineName: finalRoutineName,
        orderInRoutine: finalOrder,
        linkedHabitId: finalLinkedHabitId,
        twoMinuteVersion: twoMinuteVersion.trim() || undefined,
        attractiveReward: attractiveReward.trim() || undefined,
        betterment: bettermentEnabled
          ? {
              enabled: true,
              baselineValue: Number(bettermentBaseline) || 1,
              unit: bettermentUnit.trim() || 'units',
              period: bettermentPeriod,
              ratePercent: Number(bettermentRate) || 1,
              startDate: editingHabit?.betterment?.startDate || getTodayDateString(),
            }
          : undefined,
      },
      editingHabit?.id,
      parentHabitToUpdate
    );

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
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                {editingHabit ? 'Edit Atomic Habit' : 'Design an Atomic Habit'}
              </h2>
              <p className="text-[11px] text-stone-600 dark:text-stone-400">
                Identity &bull; 4 Laws &bull; 1% Betterment Engine
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Habit Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1.5">
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Read 10 Pages of Non-Fiction"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Desired Identity */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>Identity: "Who do you want to become?"</span>
              </label>
              <span className="text-[10px] text-stone-600 dark:text-stone-400 font-medium">Each completion is a vote</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
              {COMMON_IDENTITIES.slice(0, 4).map((id) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => {
                    setIdentity(id);
                    setCustomIdentity('');
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs truncate border text-center transition-colors cursor-pointer ${
                    identity === id && !customIdentity
                      ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Or write custom identity (e.g. 'Consistent Runner')"
              value={customIdentity}
              onChange={(e) => {
                setCustomIdentity(e.target.value);
                setIdentity(e.target.value);
              }}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Time of Day */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Time of Day</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['morning', 'afternoon', 'evening', 'anytime'] as TimeOfDay[]).map((time) => (
                <button
                  type="button"
                  key={time}
                  onClick={() => setTimeOfDay(time)}
                  className={`py-2 rounded-xl text-xs font-medium capitalize border transition-all cursor-pointer ${
                    timeOfDay === time
                      ? 'bg-amber-500 text-stone-950 font-bold border-amber-500 shadow-xs'
                      : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* 1% Betterment Engine Config Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-emerald-500/10 border border-amber-500/20 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900 dark:text-white">
                    1% Betterment Engine
                  </h3>
                  <p className="text-[10px] text-stone-600 dark:text-stone-400 font-medium">
                    Progressive micro-compounding over chosen time periods
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={bettermentEnabled}
                  onChange={(e) => setBettermentEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {bettermentEnabled && (
              <div className="space-y-3 pt-2 border-t border-amber-500/20 animate-in fade-in duration-150">
                {/* Cadence Period Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-800 dark:text-stone-200 mb-1">
                    Compounding Period:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'daily', label: 'Daily (+1%/day)' },
                      { id: 'weekly', label: 'Weekly (+1%/wk)' },
                      { id: 'monthly', label: 'Monthly (+1%/mo)' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setBettermentPeriod(p.id as BettermentPeriod)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                          bettermentPeriod === p.id
                            ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs font-bold'
                            : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Baseline & Unit */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-800 dark:text-stone-200 mb-1">
                      Starting Baseline:
                    </label>
                    <input
                      type="number"
                      step="any"
                      required={bettermentEnabled}
                      value={bettermentBaseline}
                      onChange={(e) => setBettermentBaseline(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-800 dark:text-stone-200 mb-1">
                      Metric Unit:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. pages, mins, reps"
                      value={bettermentUnit}
                      onChange={(e) => setBettermentUnit(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Growth Rate */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      Growth Rate per {bettermentPeriod}:
                    </span>
                    <span className="font-bold text-amber-700 dark:text-amber-400">
                      +{bettermentRate}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 5].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setBettermentRate(rate)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          bettermentRate === rate
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                        }`}
                      >
                        +{rate}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1-Year Projected Compounding Pill */}
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 text-[11px] text-stone-700 dark:text-stone-300">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <span>1-Year Compounding Projection:</span>
                  </div>
                  <div className="mt-0.5">
                    Starting at <strong>{bettermentBaseline} {bettermentUnit}</strong> &rarr; grows to{' '}
                    <strong className="text-stone-900 dark:text-white text-xs">{projectedOneYear} {bettermentUnit}</strong> in 1 year!
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-stone-100 dark:bg-stone-800 my-1" />

          {/* 1st Law: Habit Stacking & Routine Linking */}
          <div className="space-y-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900 dark:text-white">
                    1st Law: Habit Stacking & Routine Linking
                  </h3>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">
                    Formula: "After [CURRENT HABIT], I will [NEW HABIT]"
                  </p>
                </div>
              </div>
            </div>

            {/* Routine Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsRoutineLinked(false);
                  setSelectedParentId('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  !isRoutineLinked
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white border-stone-300 dark:border-stone-600 shadow-xs'
                    : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700'
                }`}
              >
                <span>🌱 Standalone Habit</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRoutineLinked(true);
                  if (!selectedParentId && candidateParents.length > 0) {
                    handleParentHabitSelect(candidateParents[0].id);
                  }
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  isRoutineLinked
                    ? 'bg-amber-500 text-stone-950 font-bold border-amber-500 shadow-xs'
                    : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>🔗 Link in Routine Chain</span>
              </button>
            </div>

            {isRoutineLinked ? (
              <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-700 animate-in fade-in duration-150">
                {/* Select Parent Habit */}
                {candidateParents.length > 0 ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-800 dark:text-stone-200 mb-1">
                      Stack Immediately After This Habit:
                    </label>
                    <select
                      value={selectedParentId}
                      onChange={(e) => handleParentHabitSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    >
                      <option value="">-- Choose existing anchor habit --</option>
                      {candidateParents.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.timeOfDay}) {p.routineName ? `[In: ${p.routineName}]` : '[Standalone]'}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500">
                    No other habits exist yet. Create this one first, then link your next habit to it!
                  </p>
                )}

                {/* Routine Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-800 dark:text-stone-200 mb-1">
                    Routine Chain Name:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Morning Momentum Routine"
                    value={routineNameInput}
                    onChange={(e) => setRoutineNameInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                {/* Trigger statement */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-800 dark:text-stone-200 mb-1">
                    Stack Trigger Formula:
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex-shrink-0">
                      After I:
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. finish my morning movement"
                      value={stackAfter}
                      onChange={(e) => setStackAfter(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Standalone Anchor habit input */
              <div>
                <label className="block text-[11px] font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Existing Trigger / Anchor Routine:
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex-shrink-0">
                    After I:
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. pour my morning coffee / brush my teeth"
                    value={stackAfter}
                    onChange={(e) => setStackAfter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3rd Law: The 2-Minute Rule */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>3rd Law: The 2-Minute Rule Version</span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              Downscale to a 2-minute gateway habit to eliminate procrastination on hard days.
            </p>
            <input
              type="text"
              placeholder="e.g. Read just 1 page / Put on running shoes / Open code editor"
              value={twoMinuteVersion}
              onChange={(e) => setTwoMinuteVersion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* 2nd Law: Make it Attractive */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200">
              <Gift className="w-3.5 h-3.5 text-rose-500" />
              <span>2nd Law: Make it Attractive (Reward or Pairing)</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Listen to favourite podcast while doing it / Enjoy peaceful silence"
              value={attractiveReward}
              onChange={(e) => setAttractiveReward(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Footer actions */}
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-500 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{editingHabit ? 'Save Changes' : 'Create Atomic Habit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
