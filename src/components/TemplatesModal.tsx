import React from 'react';
import { X, BookOpen, Plus, Check, ArrowRight, Zap, Gift } from 'lucide-react';
import { HabitTemplate } from '../types';
import { HABIT_TEMPLATES } from '../data/initialHabits';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: HabitTemplate) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                James Clear's Atomic Habit Templates
              </h2>
              <p className="text-[11px] text-stone-600 dark:text-stone-400">
                Pre-configured with Habit Stacks and 2-Minute Rules
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

        {/* Templates List */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {HABIT_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.title}
              className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300">
                    {tmpl.identity}
                  </span>
                  <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 capitalize">
                    {tmpl.timeOfDay}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  {tmpl.description}
                </p>

                {/* Stacking snippet */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-700 dark:text-stone-300 pt-1">
                  <div className="flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-amber-500" />
                    <span>Stack: After {tmpl.stackAfter}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <Zap className="w-3 h-3" />
                    <span>2-Min: {tmpl.twoMinuteVersion}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectTemplate(tmpl);
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-500 transition-colors shadow-xs cursor-pointer flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Habit</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
