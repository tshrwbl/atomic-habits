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
  Share2
} from 'lucide-react';
import { Habit } from '../types';
import { calculateStreak, getPastDays, getTodayDateString } from '../utils/dateUtils';
import { getBettermentSnapshot } from '../utils/bettermentUtils';
import { triggerCompletionConfetti } from '../utils/confetti';
import { useDismissible } from '../hooks/useDismissible';

interface HabitCardProps {
  habit: Habit;
  onToggleDate: (habitId: string, dateStr: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onOpenBetterment?: (habit: Habit) => void;
  onShareHabit?: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleDate,
  onEditHabit,
  onDeleteHabit,
  onOpenBetterment,
  onShareHabit,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const menu = useDismissible();

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

  const detailsId = `habit-details-${habit.id}`;

  // Flip7 card accent bar border selection
  const cardBorderClass = streak.completedToday
    ? 'border-l-[6px] border-l-f7-success shadow-teal-glow'
    : streak.needsRescueToday
    ? 'border-l-[6px] border-l-f7-coral shadow-coral-glow animate-boom'
    : bettermentSnapshot
    ? 'border-l-[6px] border-l-f7-gold shadow-accent-glow'
    : 'border-l-[6px] border-l-f7-teal-light shadow-card';

  return (
    <div
      className={`relative rounded-3xl bg-surface border-2 border-line ${cardBorderClass} transition-all duration-200 overflow-hidden hover:-translate-y-0.5`}
    >
      {/* Flip7 BOOM State Alert: "Never Miss Twice" */}
      {streak.needsRescueToday && (
        <div className="bg-coral-bg border-b-2 border-f7-coral/30 px-4 py-2 flex items-center justify-between gap-2 text-xs font-bold text-coral-fg">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-f7-coral text-white flex items-center justify-center text-[10px] shadow-xs">
              !
            </span>
            <span>BOOM RISK: Never miss twice! Protect your streak today.</span>
          </div>
          {habit.twoMinuteVersion && (
            <button
              type="button"
              onClick={handleCompleteTwoMinute}
              className="f7-btn f7-btn-coral text-[11px] py-1 px-3 min-h-0 cursor-pointer flex-shrink-0"
            >
              2-Min Rule
            </button>
          )}
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3.5">
          {/* Main Habit Title & Checkbox */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Flip7 Tactile Checkbox Button */}
            <button
              type="button"
              onClick={handleToggleToday}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0 mt-0.5 active:scale-90 ${
                streak.completedToday
                  ? 'bg-f7-success text-white shadow-teal-glow border-2 border-f7-teal-dark'
                  : 'bg-surface border-2 border-f7-teal/50 hover:border-f7-teal hover:bg-f7-teal-bg text-transparent'
              }`}
              title={streak.completedToday ? "Mark as not done today" : "Check off for today"}
              aria-label={streak.completedToday ? `Mark "${habit.title}" as not done today` : `Check off "${habit.title}" for today`}
              aria-pressed={streak.completedToday}
            >
              <Check className={`w-6 h-6 stroke-[3.5] ${streak.completedToday ? 'opacity-100' : 'opacity-0'}`} />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {/* Identity Tag (Flip7 Chip) */}
                <span className="f7-chip bg-surface-2 border border-line text-ink-2">
                  <span className="w-2 h-2 rounded-full bg-f7-teal" />
                  {habit.identity}
                </span>

                {/* 1% Betterment Engine Pill */}
                {bettermentSnapshot && (
                  <button
                    type="button"
                    onClick={() => onOpenBetterment?.(habit)}
                    className="f7-chip bg-f7-gold/20 text-f7-teal-dark dark:text-f7-gold border border-f7-gold font-black hover:bg-f7-gold/30 transition-colors cursor-pointer"
                    title={`1% Betterment Engine active! Improving by +${bettermentSnapshot.ratePercent}% every ${bettermentSnapshot.period}. Click to track.`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-f7-coral" />
                    <span>+1% {bettermentSnapshot.period}</span>
                  </button>
                )}

                {/* Time of day */}
                <span className="text-xs text-ink-3 font-bold capitalize flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {habit.timeOfDay}
                </span>
              </div>

              <h3 className={`text-base sm:text-lg font-black leading-snug break-words transition-colors ${
                streak.completedToday
                  ? 'text-ink-3 line-through decoration-line-strong'
                  : 'text-ink'
              }`}>
                {habit.title}
              </h3>

              {/* 1% Betterment Target Indicator */}
              {bettermentSnapshot && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => onOpenBetterment?.(habit)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-success-bg text-success-fg border border-f7-success/40 hover:bg-f7-teal-bg transition-colors cursor-pointer"
                  >
                    <Target className="w-3.5 h-3.5 text-f7-success" />
                    <span>
                      Target: {bettermentSnapshot.currentTarget} {bettermentSnapshot.unit}
                    </span>
                    {bettermentSnapshot.actualLoggedToday !== null && (
                      <span className="font-extrabold text-f7-teal-dark dark:text-f7-teal-light">
                        (Logged: {bettermentSnapshot.actualLoggedToday})
                      </span>
                    )}
                  </button>
                  <span className="text-xs font-extrabold text-f7-teal">
                    +{bettermentSnapshot.percentGrowth}% compounded
                  </span>
                </div>
              )}

              {/* Habit Stack formula summary if available */}
              {habit.habitStack?.after && (
                <p className="text-xs text-ink-3 font-medium mt-1.5 line-clamp-1">
                  <span className="font-extrabold text-ink-2">After:</span> {habit.habitStack.after}
                </p>
              )}
            </div>
          </div>

          {/* Right actions: Streak badge & Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Streak flame badge */}
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black transition-colors border-2 ${
                streak.currentStreak > 0
                  ? 'bg-f7-gold/25 text-f7-teal-dark dark:text-f7-gold border-f7-gold shadow-accent-glow'
                  : 'bg-surface-2 text-ink-3 border-line'
              }`}
              title={`Current streak: ${streak.currentStreak} days | Longest: ${streak.longestStreak} days`}
              aria-label={`Current streak: ${streak.currentStreak} days`}
            >
              <Flame className={`w-4 h-4 ${streak.currentStreak > 0 ? 'text-f7-coral fill-f7-coral' : ''}`} />
              <span>{streak.currentStreak}</span>
            </div>

            {/* Menu trigger */}
            <div ref={menu.ref} className="relative">
              <button
                type="button"
                onClick={() => menu.setOpen(!menu.open)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface border-2 border-line text-ink-2 hover:border-f7-teal hover:text-ink shadow-sm transition-all cursor-pointer"
                aria-haspopup="menu"
                aria-expanded={menu.open}
                aria-label="Habit actions"
                title="Habit actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menu.open && (
                <div 
                  role="menu"
                  aria-label="Habit actions"
                  className="absolute right-0 top-full mt-2 min-w-44 bg-surface border-2 border-line rounded-2xl shadow-lg p-1.5 z-30 animate-modal-in"
                >
                  {bettermentSnapshot && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        menu.setOpen(false);
                        onOpenBetterment?.(habit);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-xs font-bold text-f7-teal hover:bg-surface-2 cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>1% Engine</span>
                    </button>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      menu.setOpen(false);
                      onShareHabit?.(habit);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-xs font-bold text-ink-2 hover:bg-surface-2 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share JSON</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      menu.setOpen(false);
                      onEditHabit(habit);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-xs font-bold text-ink-2 hover:bg-surface-2 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Habit</span>
                  </button>
                  <div className="my-1 border-t border-line" role="separator" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      menu.setOpen(false);
                      onDeleteHabit(habit.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-xs font-bold text-f7-coral-dark hover:bg-coral-bg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 7-Day History Bubbles */}
        <div className="mt-5 pt-3.5 border-t-2 border-dashed border-line flex items-center justify-between gap-2">
          <div className="text-xs font-extrabold text-ink-3">
            Last 7 days:
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2" role="group" aria-label="Last 7 days">
            {pastDays.map((day) => {
              const isCompleted = habit.completedDates.includes(day.dateStr);
              return (
                <button
                  type="button"
                  key={day.dateStr}
                  onClick={() => onToggleDate(habit.id, day.dateStr)}
                  title={`${day.dateStr} (${isCompleted ? 'Completed' : 'Missed'}): Click to toggle`}
                  aria-label={`${day.dayName} ${day.dayNumber}${day.isToday ? ' (today)' : ''} – ${isCompleted ? 'completed' : 'not completed'}`}
                  aria-pressed={isCompleted}
                  className={`flex flex-col items-center justify-center gap-0.5 w-9 h-11 rounded-xl transition-all cursor-pointer ${
                    day.isToday
                      ? 'ring-2 ring-f7-gold ring-offset-2 ring-offset-surface'
                      : ''
                  } ${
                    isCompleted
                      ? 'bg-f7-teal text-white font-black shadow-teal-glow border border-f7-teal-dark'
                      : 'bg-surface-2 border-2 border-line text-ink-3 hover:bg-surface-3 hover:text-ink'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold leading-none">{day.dayName}</span>
                  <span className="text-xs font-extrabold leading-none">{day.dayNumber}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Flip7 Cream 2-Minute Rule Shortcut (when not completed yet today) */}
        {!streak.completedToday && habit.twoMinuteVersion && (
          <div className="mt-4 bg-f7-cream text-ink rounded-2xl p-3 border-2 border-dashed border-f7-gold-dark/40 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-6 h-6 rounded-full bg-f7-gold text-f7-teal-dark flex items-center justify-center flex-shrink-0 shadow-xs">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </span>
              <div className="truncate text-xs">
                <span className="font-black text-f7-teal-dark">2-Min Rule:</span>{' '}
                <span className="text-ink-2 font-semibold">{habit.twoMinuteVersion}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCompleteTwoMinute}
              className="f7-btn f7-btn-gold text-xs py-1 px-3.5 min-h-0 flex-shrink-0"
            >
              Did this!
            </button>
          </div>
        )}

        {/* Accordion Toggle for 4 Laws */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
            aria-controls={detailsId}
            className="flex items-center gap-1.5 text-xs font-black text-f7-teal hover:text-f7-teal-dark transition-colors cursor-pointer"
          >
            <span>{showDetails ? 'Hide 4 Laws Blueprint' : 'Show 4 Laws Blueprint'}</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <span className="text-xs font-extrabold text-ink-3">
            {streak.totalCompletions} votes cast
          </span>
        </div>

        {/* The 4 Laws Blueprint Details Drawer */}
        {showDetails && (
          <div id={detailsId} className="mt-3.5 pt-3.5 border-t-2 border-dashed border-line space-y-2.5 text-xs animate-fade-in">
            {/* 1st Law: Make it Obvious (Teal Card) */}
            <div className="p-3 rounded-2xl bg-f7-teal-bg border-2 border-f7-teal/30">
              <div className="flex items-center gap-1.5 font-black text-f7-teal-dark mb-1">
                <ArrowRight className="w-4 h-4 text-f7-teal" />
                <span>1st Law: Make it Obvious (Habit Stack)</span>
              </div>
              <p className="text-ink-2 font-medium">
                After <strong className="text-ink">"{habit.habitStack?.after || 'my morning routine'}"</strong>,{' '}
                I will <strong className="text-ink">"{habit.habitStack?.then || habit.title}"</strong>.
              </p>
            </div>

            {/* 2nd Law: Make it Attractive (Coral Card) */}
            {habit.attractiveReward && (
              <div className="p-3 rounded-2xl bg-coral-bg border-2 border-f7-coral/30">
                <div className="flex items-center gap-1.5 font-black text-coral-fg mb-1">
                  <Gift className="w-4 h-4 text-f7-coral" />
                  <span>2nd Law: Make it Attractive (Temptation Bundle)</span>
                </div>
                <p className="text-ink-2 font-medium">
                  {habit.attractiveReward}
                </p>
              </div>
            )}

            {/* 3rd Law: Make it Easy (Gold Card) */}
            {habit.twoMinuteVersion && (
              <div className="p-3 rounded-2xl bg-f7-cream border-2 border-f7-gold/40">
                <div className="flex items-center gap-1.5 font-black text-f7-gold-dark mb-1">
                  <Zap className="w-4 h-4 text-f7-gold" />
                  <span>3rd Law: Make it Easy (The 2-Minute Rule)</span>
                </div>
                <p className="text-ink-2 font-medium">
                  Scale down friction: <span className="italic">"{habit.twoMinuteVersion}"</span>
                </p>
              </div>
            )}

            {/* 4th Law: Make it Satisfying (Sky Blue Card) */}
            <div className="p-3 rounded-2xl bg-sky-bg border-2 border-f7-sky/30">
              <div className="flex items-center gap-1.5 font-black text-sky-fg mb-1">
                <Sparkles className="w-4 h-4 text-f7-sky" />
                <span>4th Law: Make it Satisfying (Never Miss Twice)</span>
              </div>
              <p className="text-ink-2 font-medium">
                Immediate visual streak tracking + identity reinforcement. You have cast <strong className="text-ink">{streak.totalCompletions} ballots</strong> for this identity!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
