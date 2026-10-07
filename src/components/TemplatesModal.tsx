import React from 'react';
import { BookOpen, Plus, ArrowRight, Zap } from 'lucide-react';
import { HabitTemplate } from '../types';
import { HABIT_TEMPLATES } from '../data/initialHabits';
import { Modal } from './Modal';

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="James Clear's Atomic Habit Templates"
      subtitle="Curated battle-tested routines with Habit Stacks and 2-Minute Rules"
      icon={<BookOpen className="w-5 h-5 text-ink" />}
      size="max-w-2xl"
    >
      {/* Templates List */}
      <ul className="space-y-3.5">
        {HABIT_TEMPLATES.map((tmpl) => (
          <li
            key={tmpl.title}
            className="p-4 sm:p-5 rounded-3xl border-2 border-line border-l-[6px] border-l-f7-gold bg-surface hover:shadow-accent-glow hover:border-line-strong transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="f7-chip bg-f7-teal-bg text-f7-teal-dark border border-f7-teal/30">
                  {tmpl.identity}
                </span>
                <span className="text-xs font-bold text-ink-3 capitalize tracking-wide">
                  {tmpl.timeOfDay}
                </span>
              </div>

              <h3 className="text-sm font-black text-ink">{tmpl.title}</h3>
              <p className="text-xs text-ink-2 font-medium leading-relaxed">{tmpl.description}</p>

              {/* Stacking snippet */}
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-ink-2 pt-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <ArrowRight className="w-3.5 h-3.5 text-f7-teal" aria-hidden="true" />
                  <span>Stack: After {tmpl.stackAfter}</span>
                </div>
                <div className="flex items-center gap-1.5 text-f7-teal-dark dark:text-f7-teal-light font-bold">
                  <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>2-Min: {tmpl.twoMinuteVersion}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectTemplate(tmpl);
                onClose();
              }}
              aria-label={`Add habit template: ${tmpl.title}`}
              className="f7-btn f7-btn-gold px-4 py-2 text-xs flex-shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" aria-hidden="true" />
              <span>Add Habit</span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
};
