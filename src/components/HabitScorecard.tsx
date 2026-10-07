import React, { useState } from 'react';
import { ClipboardList, Plus, Trash2, Sparkles } from 'lucide-react';
import { ScorecardItem, ScorecardRating } from '../types';

interface HabitScorecardProps {
  items: ScorecardItem[];
  onAddItem: (item: Omit<ScorecardItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
  onUpdateRating: (id: string, rating: ScorecardRating) => void;
  onConvertToHabit: (name: string) => void;
}

export const HabitScorecard: React.FC<HabitScorecardProps> = ({
  items,
  onAddItem,
  onDeleteItem,
  onUpdateRating,
  onConvertToHabit,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemRating, setNewItemRating] = useState<ScorecardRating>('positive');
  const [newItemTime, setNewItemTime] = useState<'morning' | 'day' | 'evening'>('morning');
  const [filterTime, setFilterTime] = useState<'all' | 'morning' | 'day' | 'evening'>('all');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem({
      name: newItemName.trim(),
      rating: newItemRating,
      timeOfDay: newItemTime,
    });
    setNewItemName('');
  };

  const filteredItems = items.filter((i) => {
    if (filterTime !== 'all' && i.timeOfDay !== filterTime) return false;
    return true;
  });

  const positiveCount = items.filter((i) => i.rating === 'positive').length;
  const negativeCount = items.filter((i) => i.rating === 'negative').length;
  const neutralCount = items.filter((i) => i.rating === 'neutral').length;

  return (
    <div className="space-y-6">
      {/* Flip7 Intro Hero Banner */}
      <div className="rounded-3xl bg-surface border-2 border-line border-l-[6px] border-l-f7-teal p-6 sm:p-7 shadow-card">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-f7-teal text-white flex items-center justify-center flex-shrink-0 shadow-teal-glow">
            <ClipboardList className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-f7-teal-dark dark:text-f7-teal-light uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-f7-gold" />
              <span>Awareness Before Change</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-ink">
              The Habit Scorecard
            </h2>
            <p className="text-xs sm:text-sm text-ink-3 font-semibold mt-1 max-w-3xl leading-relaxed">
              "Until you make the unconscious conscious, it will direct your life and you will call it fate." — C.G. Jung.
              Score your daily automatic behaviors to build awareness before trying to change them.
            </p>
          </div>
        </div>

        {/* Score Tally - Flip7 Tri-Podium */}
        <div className="mt-6 pt-5 border-t-2 border-dashed border-line grid grid-cols-3 gap-3.5 text-center">
          <div className="p-3.5 rounded-2xl bg-f7-teal-bg border-2 border-f7-teal/40 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-f7-teal-dark">
              {positiveCount}
            </span>
            <div className="text-xs font-black text-f7-teal-dark mt-0.5">
              Positive (+)
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-f7-cream border-2 border-f7-gold/50 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-f7-gold-dark">
              {neutralCount}
            </span>
            <div className="text-xs font-black text-f7-teal-dark mt-0.5">
              Neutral (=)
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-coral-bg border-2 border-f7-coral/40 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-f7-coral-dark">
              {negativeCount}
            </span>
            <div className="text-xs font-black text-coral-fg mt-0.5">
              Negative (-)
            </div>
          </div>
        </div>
      </div>

      {/* Add New Scorecard Item Form */}
      <form onSubmit={handleAdd} className="bg-surface p-4 sm:p-5 rounded-3xl border-2 border-line shadow-card flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Log a daily automatic behavior (e.g. check phone in bed)..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          aria-label="Behavior name"
          className="f7-input flex-1 text-xs sm:text-sm py-2.5 px-4 font-bold"
        />

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={newItemTime}
            onChange={(e) => setNewItemTime(e.target.value as any)}
            aria-label="Time of day"
            className="f7-input !w-auto text-xs py-2.5 px-3 font-bold cursor-pointer"
          >
            <option value="morning">Morning</option>
            <option value="day">Day / Afternoon</option>
            <option value="evening">Evening</option>
          </select>

          {/* Flip7 Counter Buttons (+ / = / -) */}
          <div className="flex items-center gap-1.5 bg-surface-2 p-1 rounded-2xl border border-line">
            <button
              type="button"
              onClick={() => setNewItemRating('positive')}
              aria-label="Mark Positive"
              aria-pressed={newItemRating === 'positive'}
              className={`w-9 h-9 rounded-xl font-black text-sm transition-all cursor-pointer ${
                newItemRating === 'positive'
                  ? 'bg-f7-teal text-white shadow-teal-glow'
                  : 'text-ink-3 hover:text-ink hover:bg-surface'
              }`}
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setNewItemRating('neutral')}
              aria-label="Mark Neutral"
              aria-pressed={newItemRating === 'neutral'}
              className={`w-9 h-9 rounded-xl font-black text-sm transition-all cursor-pointer ${
                newItemRating === 'neutral'
                  ? 'bg-f7-gold text-[#173836] shadow-accent-glow'
                  : 'text-ink-3 hover:text-ink hover:bg-surface'
              }`}
            >
              =
            </button>
            <button
              type="button"
              onClick={() => setNewItemRating('negative')}
              aria-label="Mark Negative"
              aria-pressed={newItemRating === 'negative'}
              className={`w-9 h-9 rounded-xl font-black text-sm transition-all cursor-pointer ${
                newItemRating === 'negative'
                  ? 'bg-f7-coral text-white shadow-coral-glow'
                  : 'text-ink-3 hover:text-ink hover:bg-surface'
              }`}
            >
              -
            </button>
          </div>

          <button
            type="submit"
            className="f7-btn f7-btn-gold text-xs px-5 py-2.5 shadow-accent-glow"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Filter by routine */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs text-ink-3 font-bold">Filter Routine:</span>
        {(['all', 'morning', 'day', 'evening'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilterTime(t)}
            aria-pressed={filterTime === t}
            className={`f7-pill capitalize text-xs px-3.5 py-1 ${
              filterTime === t ? 'f7-pill-gold' : ''
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const accentColor = item.rating === 'positive'
            ? 'border-l-[6px] border-l-f7-teal shadow-xs'
            : item.rating === 'negative'
            ? 'border-l-[6px] border-l-f7-coral shadow-xs'
            : 'border-l-[6px] border-l-f7-gold shadow-xs';

          return (
            <div
              key={item.id}
              className={`rounded-2xl bg-surface border-2 border-line ${accentColor} p-4 flex items-center justify-between gap-3.5 hover:bg-surface-2 transition-all`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="text-[11px] uppercase font-black text-ink-3 w-16 flex-shrink-0">
                  {item.timeOfDay}
                </span>
                <span className="text-sm font-bold text-ink truncate">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                {/* Rating toggle buttons */}
                <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-line">
                  <button
                    type="button"
                    onClick={() => onUpdateRating(item.id, 'positive')}
                    title="Mark as positive behavior"
                    aria-label={`Mark "${item.name}" as positive`}
                    className={`w-7 h-7 rounded-lg font-black text-xs transition-all cursor-pointer ${
                      item.rating === 'positive'
                        ? 'bg-f7-teal text-white shadow-xs'
                        : 'text-ink-3 hover:text-ink'
                    }`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateRating(item.id, 'neutral')}
                    title="Mark as neutral routine"
                    aria-label={`Mark "${item.name}" as neutral`}
                    className={`w-7 h-7 rounded-lg font-black text-xs transition-all cursor-pointer ${
                      item.rating === 'neutral'
                        ? 'bg-f7-gold text-[#173836] shadow-xs'
                        : 'text-ink-3 hover:text-ink'
                    }`}
                  >
                    =
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateRating(item.id, 'negative')}
                    title="Mark as negative behavior"
                    aria-label={`Mark "${item.name}" as negative`}
                    className={`w-7 h-7 rounded-lg font-black text-xs transition-all cursor-pointer ${
                      item.rating === 'negative'
                        ? 'bg-f7-coral text-white shadow-xs'
                        : 'text-ink-3 hover:text-ink'
                    }`}
                  >
                    -
                  </button>
                </div>

                {/* Turn into atomic habit button */}
                {item.rating === 'positive' && (
                  <button
                    type="button"
                    onClick={() => onConvertToHabit(item.name)}
                    title="Track this positive behavior as an Atomic Habit"
                    className="hidden sm:inline-flex f7-btn f7-btn-gold text-[11px] py-1 px-3 min-h-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Track</span>
                  </button>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  title="Remove behavior"
                  aria-label={`Remove behavior "${item.name}"`}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-ink-3 hover:text-f7-coral hover:bg-coral-bg cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="rounded-3xl bg-surface border-2 border-line p-8 text-center text-xs font-bold text-ink-3">
            No scorecard entries for this filter. Log your daily automatic behaviors above!
          </div>
        )}
      </div>
    </div>
  );
};
