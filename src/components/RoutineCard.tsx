import React, { useState } from 'react';
import { 
  Check, 
  Flame, 
  Clock, 
  Zap, 
  Gift, 
  ArrowRight, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  Layers, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Unlink, 
  Share2, 
  Archive,
  CheckCircle2,
  Sparkles,
  Target
} from 'lucide-react';
import { Habit } from '../types';
import { calculateStreak, getPastDays, getTodayDateString } from '../utils/dateUtils';
import { getBettermentSnapshot } from '../utils/bettermentUtils';
import { triggerCompletionConfetti } from '../utils/confetti';

interface RoutineCardProps {
  routineId: string;
  routineName: string;
  steps: Habit[];
  onToggleDate: (habitId: string, dateStr: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleArchiveHabit: (habitId: string) => void;
  onOpenBetterment?: (habit: Habit) => void;
  onShareHabit?: (habit: Habit) => void;
  onAddStepToRoutine?: (parentHabit: Habit) => void;
  onUnlinkStep?: (habitId: string) => void;
  onRenameRoutine?: (routineId: string, newName: string) => void;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({
  routineId,
  routineName,
  steps,
  onToggleDate,
  onEditHabit,
  onDeleteHabit,
  onToggleArchiveHabit,
  onOpenBetterment,
  onShareHabit,
  onAddStepToRoutine,
  onUnlinkStep,
  onRenameRoutine,
}) => {
  const todayStr = getTodayDateString();

  // Manual expand overrides: habitId -> boolean
  const [expandedOverrides, setExpandedOverrides] = useState<Record<string, boolean>>({});
  const [activeMenuHabitId, setActiveMenuHabitId] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [customName, setCustomName] = useState(routineName);

  // Step completion counts
  const completedCount = steps.filter((s) => s.completedDates.includes(todayStr)).length;
  const totalCount = steps.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Find the first undone step in the sequence (active step in focus)
  const firstUndoneIndex = steps.findIndex((s) => !s.completedDates.includes(todayStr));
  const activeStepId = firstUndoneIndex !== -1 ? steps[firstUndoneIndex].id : null;

  // Toggle single step completion
  const handleToggleStep = (habit: Habit, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isNowCompleted = !habit.completedDates.includes(todayStr);
    onToggleDate(habit.id, todayStr);

    if (isNowCompleted) {
      // Check if this was the last remaining step in the routine
      const remainingUndone = steps.filter(
        (s) => s.id !== habit.id && !s.completedDates.includes(todayStr)
      ).length;
      if (remainingUndone === 0) {
        triggerCompletionConfetti();
      }
    }
  };

  // 2-Minute rule action
  const handleCompleteTwoMinute = (habit: Habit, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!habit.completedDates.includes(todayStr)) {
      handleToggleStep(habit);
    }
  };

  // Toggle manual expansion
  const toggleStepExpanded = (habitId: string) => {
    setExpandedOverrides((prev) => {
      const currentlyExpanded = prev[habitId] !== undefined ? prev[habitId] : habitId === activeStepId;
      return {
        ...prev,
        [habitId]: !currentlyExpanded,
      };
    });
  };

  // Expand all / Collapse all toggle
  const areAllExpanded = steps.every((s) => {
    return expandedOverrides[s.id] !== undefined ? expandedOverrides[s.id] : s.id === activeStepId;
  });

  const handleToggleExpandAll = () => {
    const nextState = !areAllExpanded;
    const newOverrides: Record<string, boolean> = {};
    steps.forEach((s) => {
      newOverrides[s.id] = nextState;
    });
    setExpandedOverrides(newOverrides);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim() && customName !== routineName) {
      onRenameRoutine?.(routineId, customName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden bg-white dark:bg-stone-900 shadow-sm ${
        allCompleted
          ? 'border-emerald-300 dark:border-emerald-800/80 shadow-emerald-500/5'
          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
      }`}
    >
      {/* Routine Container Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/5 via-stone-50/50 to-emerald-500/5 dark:from-amber-950/20 dark:via-stone-900 dark:to-emerald-950/20 border-b border-stone-100 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Routine Title and Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {allCompleted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Routine Complete! 🎉</span>
                </span>
              )}
            </div>

            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="text-base font-bold px-2 py-1 rounded-lg border border-amber-500 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden"
                  autoFocus
                  onBlur={handleSaveName}
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 text-xs font-semibold bg-amber-500 text-stone-950 rounded-lg cursor-pointer"
                >
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 group">
                <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white tracking-tight break-words">
                  {routineName}
                </h3>
                {onRenameRoutine && (
                  <button
                    onClick={() => {
                      setCustomName(routineName);
                      setIsEditingName(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer rounded"
                    title="Rename routine"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Routine Actions & Progress */}
          <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-900 dark:text-white">
                {completedCount}/{totalCount}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                ({progressPercent}%)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {onAddStepToRoutine && (
                <button
                  onClick={() => onAddStepToRoutine(steps[steps.length - 1])}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
                  title="Add another habit to this routine"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Step</span>
                </button>
              )}

              <button
                onClick={handleToggleExpandAll}
                className="p-1.5 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
                title={areAllExpanded ? 'Collapse non-focus steps' : 'Expand all steps'}
              >
                {areAllExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Routine Overall Progress Bar */}
        <div className="mt-3 w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              allCompleted
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Routine Steps List */}
      <div className="p-3 sm:p-5 space-y-3">
        {steps.map((step, index) => {
          const isDone = step.completedDates.includes(todayStr);
          const isNextActive = step.id === activeStepId;
          const isExpanded =
            expandedOverrides[step.id] !== undefined
              ? expandedOverrides[step.id]
              : isNextActive || (allCompleted && index === 0);

          const streak = calculateStreak(step.completedDates);
          const bettermentSnapshot = getBettermentSnapshot(step, todayStr);
          const pastDays = getPastDays(7);
          const isFirstStep = index === 0;
          const isLastStep = index === steps.length - 1;

          return (
            <div key={step.id} className="relative">
              {/* Vertical connector line to next step */}
              {!isLastStep && (
                <div
                  className={`absolute left-5 sm:left-6 top-10 bottom-[-14px] w-0.5 z-0 transition-colors ${
                    isDone
                      ? 'bg-emerald-500/50 dark:bg-emerald-500/40'
                      : 'bg-stone-200 dark:bg-stone-800'
                  }`}
                />
              )}

              {/* Step Container */}
              <div
                className={`relative z-1 rounded-2xl border transition-all duration-200 ${
                  isNextActive
                    ? 'border-amber-400 dark:border-amber-500/80 ring-2 ring-amber-500/20 dark:ring-amber-500/30 shadow-md bg-white dark:bg-stone-900'
                    : isExpanded
                    ? 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900'
                    : isDone
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                {/* Active Focus Ribbon */}
                {isNextActive && (
                  <div className="bg-amber-500/15 dark:bg-amber-500/25 border-b border-amber-500/20 px-3.5 py-1 rounded-t-2xl flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>Next Up in Routine (Step {index + 1})</span>
                    </span>
                    {step.twoMinuteVersion && (
                      <button
                        onClick={(e) => handleCompleteTwoMinute(step, e)}
                        className="text-[11px] underline font-bold hover:text-amber-950 dark:hover:text-white cursor-pointer"
                      >
                        ⚡ 2-min rule
                      </button>
                    )}
                  </div>
                )}

                {/* ======================================================== */}
                {/* COLLAPSED VIEW (When out of focus) */}
                {/* ======================================================== */}
                {!isExpanded ? (
                  <div
                    onClick={() => toggleStepExpanded(step.id)}
                    className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-stone-100/50 dark:hover:bg-stone-800/40 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Step Number / Interactive Checkbox */}
                      <button
                        onClick={(e) => handleToggleStep(step, e)}
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-stone-200 dark:bg-stone-800 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/50 text-stone-700 dark:text-stone-300'
                        }`}
                        title={isDone ? 'Mark as not done' : 'Mark step as done'}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : index + 1}
                      </button>

                      {/* Habit Title & Tags */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-semibold truncate ${
                              isDone
                                ? 'line-through text-stone-600 dark:text-stone-400'
                                : 'text-stone-900 dark:text-white'
                            }`}
                          >
                            {step.title}
                          </h4>
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hidden sm:inline">
                            {step.identity}
                          </span>
                        </div>
                        {step.habitStack?.after && (
                          <p className="text-[11px] text-stone-600 dark:text-stone-400 truncate">
                            After: {step.habitStack.after}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right side collapsed indicators */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {step.twoMinuteVersion && (
                        <span className="text-stone-500 dark:text-stone-400" title="Has 2-min rule version">
                          <Zap className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {bettermentSnapshot && (
                        <span className="text-amber-500" title="+1% Betterment Engine active">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {streak.currentStreak > 0 && (
                        <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                          <Flame className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{streak.currentStreak}</span>
                        </div>
                      )}
                      <ChevronDown className="w-4 h-4 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors" />
                    </div>
                  </div>
                ) : (
                  /* ======================================================== */
                  /* EXPANDED VIEW (When in focus or explicitly expanded) */
                  /* ======================================================== */
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      {/* Checkbox and Title Area */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Step Number / Interactive Checkbox */}
                        <button
                          onClick={(e) => handleToggleStep(step, e)}
                          className={`w-8 h-8 rounded-xl text-sm font-bold flex items-center justify-center transition-all cursor-pointer flex-shrink-0 mt-0.5 ${
                            isDone
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                              : isNextActive
                              ? 'bg-amber-500 text-stone-950 font-extrabold shadow-sm hover:bg-amber-400'
                              : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                          }`}
                          title={isDone ? 'Mark as not done today' : 'Check off step for today'}
                        >
                          {isDone ? <Check className="w-5 h-5 stroke-[3]" /> : index + 1}
                        </button>

                        {/* Title, Identity & Meta */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            {/* Identity Tag */}
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              {step.identity}
                            </span>
                            
                            {/* Time of day */}
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 capitalize flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-500 dark:text-stone-400" />
                              {step.timeOfDay}
                            </span>
                          </div>

                          <h4
                            className={`text-base font-semibold leading-snug break-words ${
                              isDone
                                ? 'line-through text-stone-600 dark:text-stone-400'
                                : 'text-stone-900 dark:text-white'
                            }`}
                          >
                            {step.title}
                          </h4>

                          {/* 1% Betterment Target Indicator */}
                          {bettermentSnapshot && (
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <button
                                onClick={() => onOpenBetterment?.(step)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
                              >
                                <Target className="w-3.5 h-3.5 text-emerald-500" />
                                <span>
                                  Target: {bettermentSnapshot.currentTarget} {bettermentSnapshot.unit}
                                </span>
                                {bettermentSnapshot.actualLoggedToday !== null && (
                                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                    (Logged: {bettermentSnapshot.actualLoggedToday})
                                  </span>
                                )}
                              </button>
                              <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400">
                                +{bettermentSnapshot.percentGrowth}% compounded
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Step Menu and Controls */}
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {/* More Menu */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenuHabitId(activeMenuHabitId === step.id ? null : step.id)
                            }
                            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                            title="Step actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuHabitId === step.id && (
                            <div className="absolute right-0 top-8 z-30 w-40 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                              <button
                                onClick={() => {
                                  setActiveMenuHabitId(null);
                                  onEditHabit(step);
                                }}
                                className="w-full text-left px-3.5 py-1.5 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Step</span>
                              </button>

                              {onUnlinkStep && (
                                <button
                                  onClick={() => {
                                    setActiveMenuHabitId(null);
                                    onUnlinkStep(step.id);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 text-xs text-amber-700 dark:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 cursor-pointer"
                                >
                                  <Unlink className="w-3.5 h-3.5" />
                                  <span>Unlink Step</span>
                                </button>
                              )}

                              {onShareHabit && (
                                <button
                                  onClick={() => {
                                    setActiveMenuHabitId(null);
                                    onShareHabit(step);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 cursor-pointer"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                  <span>Share / Export</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setActiveMenuHabitId(null);
                                  onToggleArchiveHabit(step.id);
                                }}
                                className="w-full text-left px-3.5 py-1.5 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 cursor-pointer"
                              >
                                <Archive className="w-3.5 h-3.5" />
                                <span>{step.archived ? 'Unarchive' : 'Archive'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveMenuHabitId(null);
                                  onDeleteHabit(step.id);
                                }}
                                className="w-full text-left px-3.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Step</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Collapse button */}
                        <button
                          onClick={() => toggleStepExpanded(step.id)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                          title="Collapse step"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Unified 4 Laws Display */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {/* 1st Law: Make it Obvious */}
                      <div className={`p-3 rounded-xl border flex flex-col justify-center ${step.habitStack?.after ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20' : 'bg-stone-50 dark:bg-stone-800/30 border-stone-100 dark:border-stone-800'}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400">1. Obvious</span>
                        </div>
                        {step.habitStack?.after ? (
                          <div className="text-xs font-medium text-stone-700 dark:text-stone-300 leading-tight">
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">After</span> {step.habitStack.after}
                          </div>
                        ) : (
                          <div className="text-xs text-stone-400 dark:text-stone-500 italic">No stack trigger set</div>
                        )}
                      </div>

                      {/* 2nd Law: Make it Attractive */}
                      <div className={`p-3 rounded-xl border flex flex-col justify-center ${step.attractiveReward ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/20' : 'bg-stone-50 dark:bg-stone-800/30 border-stone-100 dark:border-stone-800'}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400">2. Attractive</span>
                        </div>
                        {step.attractiveReward ? (
                          <div className="text-xs font-medium text-stone-700 dark:text-stone-300 leading-tight flex items-start gap-1.5">
                            <Gift className="w-4 h-4 text-rose-500 shrink-0" />
                            {step.attractiveReward}
                          </div>
                        ) : (
                          <div className="text-xs text-stone-400 dark:text-stone-500 italic">No immediate reward set</div>
                        )}
                      </div>

                      {/* 3rd Law: Make it Easy */}
                      <div className={`p-3 rounded-xl border flex flex-col justify-center ${step.twoMinuteVersion ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20' : 'bg-stone-50 dark:bg-stone-800/30 border-stone-100 dark:border-stone-800'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400">3. Easy</span>
                          {step.twoMinuteVersion && !isDone && (
                            <button
                              onClick={(e) => handleCompleteTwoMinute(step, e)}
                              className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800 cursor-pointer"
                            >
                              Done
                            </button>
                          )}
                        </div>
                        {step.twoMinuteVersion ? (
                          <div className="text-xs font-medium text-stone-700 dark:text-stone-300 leading-tight flex items-start gap-1.5">
                            <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
                            {step.twoMinuteVersion}
                          </div>
                        ) : (
                          <div className="text-xs text-stone-400 dark:text-stone-500 italic">No 2-minute version</div>
                        )}
                      </div>

                      {/* 4th Law: Make it Satisfying */}
                      <div className="p-3 rounded-xl border bg-sky-500/5 dark:bg-sky-500/10 border-sky-500/20 flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400">4. Satisfying</span>
                        </div>
                        <div className="text-xs font-medium text-stone-700 dark:text-stone-300 leading-tight flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <span className="flex items-center gap-1">
                            <Flame className={`w-4 h-4 ${streak.currentStreak > 0 ? 'text-amber-500 fill-amber-500' : 'text-stone-400'}`} />
                            {streak.currentStreak} day streak
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Past 7 Days Mini Heatmap */}
                    <div className="flex items-center justify-end pt-3 border-t border-stone-100 dark:border-stone-800">
                      <div className="flex items-center gap-1">
                        {pastDays.map((d) => {
                          const doneOnDay = step.completedDates.includes(d.dateStr);
                          return (
                            <span
                              key={d.dateStr}
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                doneOnDay
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600'
                              }`}
                              title={`${d.dateStr}: ${doneOnDay ? 'Completed' : 'Missed'}`}
                            >
                              {doneOnDay ? '✓' : ''}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
