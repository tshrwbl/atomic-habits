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
  Sparkles,
  TrendingUp,
  Target,
  Share2,
  Archive,
  ArchiveRestore,
  Layers,
  Link as LinkIcon
} from 'lucide-react';
import { Habit } from '../types';
import { calculateStreak, getPastDays, getTodayDateString } from '../utils/dateUtils';
import { getBettermentSnapshot } from '../utils/bettermentUtils';
import { triggerCompletionConfetti } from '../utils/confetti';

interface HabitCardProps {
  habit: Habit;
  onToggleDate: (habitId: string, dateStr: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleArchiveHabit: (habitId: string) => void;
  onOpenBetterment?: (habit: Habit) => void;
  onShareHabit?: (habit: Habit) => void;
  onLinkToRoutine?: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleDate,
  onEditHabit,
  onDeleteHabit,
  onToggleArchiveHabit,
  onOpenBetterment,
  onShareHabit,
  onLinkToRoutine,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const streak = calculateStreak(habit.completedDates);
  const todayStr = getTodayDateString();
  const pastDays = getPastDays(7);
  const bettermentSnapshot = getBettermentSnapshot(habit, todayStr);

  const handleToggleToday = () => {
    const isNowCompleted = !streak.completedToday;
    onToggleDate(habit.id, todayStr);
    if (isNowCompleted) {
      triggerCompletionConfetti();
    }
  };

  const handleCompleteTwoMinute = () => {
    if (!streak.completedToday) {
      onToggleDate(habit.id, todayStr);
      triggerCompletionConfetti();
    }
  };

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 overflow-hidden bg-white dark:bg-stone-900 ${
        streak.completedToday
          ? 'border-emerald-300/80 dark:border-emerald-800/80 shadow-sm shadow-emerald-500/5'
          : streak.needsRescueToday
          ? 'border-amber-400 dark:border-amber-600 shadow-md shadow-amber-500/10'
          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 shadow-sm'
      }`}
    >
      {/* "Never Miss Twice" urgent indicator banner */}
      {streak.needsRescueToday && (
        <div className="bg-amber-500/15 dark:bg-amber-500/20 border-b border-amber-500/30 px-3.5 py-1.5 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>Never miss twice! Complete today to protect your streak.</span>
          </div>
          {habit.twoMinuteVersion && (
            <button
              onClick={handleCompleteTwoMinute}
              className="text-[11px] underline font-bold text-amber-900 dark:text-amber-200 hover:text-amber-950 dark:hover:text-white cursor-pointer flex-shrink-0"
            >
              Do 2-min rule
            </button>
          )}
        </div>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Main Habit Title & Checkbox */}
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <button
              onClick={handleToggleToday}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0 mt-0.5 ${
                streak.completedToday
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                  : 'border-2 border-stone-300 dark:border-stone-700 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-transparent'
              }`}
              title={streak.completedToday ? "Mark as not done today" : "Check off for today"}
            >
              <Check className={`w-4 h-4 sm:w-5 sm:h-5 stroke-[3] ${streak.completedToday ? 'opacity-100' : 'opacity-0'}`} />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {/* Identity Tag */}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {habit.identity}
                </span>

                {/* 1% Betterment Engine Pill */}
                {bettermentSnapshot && (
                  <button
                    onClick={() => onOpenBetterment?.(habit)}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25 flex items-center gap-1 hover:bg-amber-500/25 transition-colors cursor-pointer"
                    title={`1% Betterment Engine active! Improving by +${bettermentSnapshot.ratePercent}% every ${bettermentSnapshot.period}. Click to track.`}
                  >
                    <TrendingUp className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>+1% {bettermentSnapshot.period}</span>
                  </button>
                )}

                {/* Time of day */}
                <span className="text-[11px] text-stone-600 dark:text-stone-400 capitalize flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-500 dark:text-stone-400" />
                  {habit.timeOfDay}
                </span>

                {/* Routine Badge if linked */}
                {habit.routineName && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-500" />
                    <span>{habit.routineName} {habit.orderInRoutine ? `(Step ${habit.orderInRoutine})` : ''}</span>
                  </span>
                )}
              </div>

              <h3 className={`text-base font-semibold leading-snug break-words transition-colors ${
                streak.completedToday
                  ? 'text-stone-800 dark:text-stone-200 line-through decoration-stone-400/60 dark:decoration-stone-600'
                  : 'text-stone-900 dark:text-white'
              }`}>
                {habit.title}
              </h3>

              {/* 1% Betterment Target Indicator */}
              {bettermentSnapshot && (
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <button
                    onClick={() => onOpenBetterment?.(habit)}
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

              {/* Habit Stack formula summary if available */}
              {habit.habitStack?.after && (
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-1">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">After:</span> {habit.habitStack.after}
                </p>
              )}
            </div>
          </div>

          {/* Right actions: Streak badge & Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Streak flame badge */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                streak.currentStreak > 0
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-transparent'
              }`}
              title={`Current streak: ${streak.currentStreak} days | Longest: ${streak.longestStreak} days`}
            >
              <Flame className={`w-3.5 h-3.5 ${streak.currentStreak > 0 ? 'text-amber-500 fill-amber-500' : 'text-stone-500 dark:text-stone-400'}`} />
              <span>{streak.currentStreak}</span>
            </div>

            {/* Menu trigger */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div 
                  className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg p-1 text-xs z-30"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  {bettermentSnapshot && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onOpenBetterment?.(habit);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-amber-800 dark:text-amber-400 font-semibold cursor-pointer"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>1% Engine</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onShareHabit?.(habit);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share JSON</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onToggleArchiveHabit(habit.id);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
                  >
                    {habit.archived ? (
                      <>
                        <ArchiveRestore className="w-3.5 h-3.5" />
                        <span>Unarchive</span>
                      </>
                    ) : (
                      <>
                        <Archive className="w-3.5 h-3.5" />
                        <span>Archive</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEditHabit(habit);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  {onLinkToRoutine && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onLinkToRoutine(habit);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-amber-700 dark:text-amber-400 cursor-pointer"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Link into Routine</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDeleteHabit(habit.id);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 7-Day History Bubbles */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
          <div className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
            Last 7 days:
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {pastDays.map((day) => {
              const isCompleted = habit.completedDates.includes(day.dateStr);
              return (
                <button
                  key={day.dateStr}
                  onClick={() => onToggleDate(habit.id, day.dateStr)}
                  title={`${day.dateStr} (${isCompleted ? 'Completed' : 'Missed'}): Click to toggle`}
                  className={`flex flex-col items-center justify-center w-7 h-9 rounded-lg transition-all cursor-pointer ${
                    day.isToday
                      ? 'ring-1.5 ring-amber-500 ring-offset-1 dark:ring-offset-stone-900'
                      : ''
                  } ${
                    isCompleted
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-tighter opacity-90 font-medium">{day.dayName}</span>
                  <span className="text-[11px] font-bold leading-none">{day.dayNumber}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick 2-Minute Rule Shortcut (when not completed yet today) */}
        {!streak.completedToday && habit.twoMinuteVersion && (
          <div className="mt-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl p-2.5 border border-dashed border-stone-200 dark:border-stone-700/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <div className="truncate text-xs">
                <span className="font-semibold text-stone-800 dark:text-stone-200">2-Minute Rule:</span>{' '}
                <span className="text-stone-700 dark:text-stone-300">{habit.twoMinuteVersion}</span>
              </div>
            </div>
            <button
              onClick={handleCompleteTwoMinute}
              className="text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex-shrink-0"
            >
              Did this!
            </button>
          </div>
        )}

        {/* Accordion Toggle for 4 Laws */}
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            <span>{showDetails ? 'Hide Atomic Blueprint' : 'Show 4 Laws Blueprint'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400">
            {streak.totalCompletions} votes cast
          </span>
        </div>

        {/* The 4 Laws Blueprint Details Drawer */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/80 space-y-2.5 text-xs animate-in fade-in duration-200">
            {/* 1st Law: Make it Obvious */}
            <div className="p-2.5 rounded-lg bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-300 mb-1">
                <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                <span>1st Law: Make it Obvious (Habit Stack)</span>
              </div>
              <p className="text-stone-700 dark:text-stone-300 text-[11px]">
                After <strong className="text-amber-800 dark:text-amber-300">"{habit.habitStack?.after || 'my morning routine'}"</strong>,{' '}
                I will <strong className="text-amber-800 dark:text-amber-300">"{habit.habitStack?.then || habit.title}"</strong>.
              </p>
            </div>

            {/* 2nd Law: Make it Attractive */}
            {habit.attractiveReward && (
              <div className="p-2.5 rounded-lg bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20">
                <div className="flex items-center gap-1.5 font-semibold text-rose-900 dark:text-rose-300 mb-1">
                  <Gift className="w-3.5 h-3.5 text-rose-500" />
                  <span>2nd Law: Make it Attractive (Temptation Bundle)</span>
                </div>
                <p className="text-stone-700 dark:text-stone-300 text-[11px]">
                  {habit.attractiveReward}
                </p>
              </div>
            )}

            {/* 3rd Law: Make it Easy */}
            {habit.twoMinuteVersion && (
              <div className="p-2.5 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                  <span>3rd Law: Make it Easy (The 2-Minute Rule)</span>
                </div>
                <p className="text-stone-700 dark:text-stone-300 text-[11px]">
                  Scale down friction: <span className="italic">"{habit.twoMinuteVersion}"</span>
                </p>
              </div>
            )}

            {/* 4th Law: Make it Satisfying */}
            <div className="p-2.5 rounded-lg bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20">
              <div className="flex items-center gap-1.5 font-semibold text-sky-900 dark:text-sky-300 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>4th Law: Make it Satisfying (Never Miss Twice)</span>
              </div>
              <p className="text-stone-700 dark:text-stone-300 text-[11px]">
                Immediate visual streak tracking + identity reinforcement. You have logged this <strong>{streak.totalCompletions} times</strong>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
