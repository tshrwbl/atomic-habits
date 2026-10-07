import React, { useState, useEffect, useId } from 'react';
import { Sparkles, User, Clock, ArrowRight, Zap, Gift, Check, TrendingUp } from 'lucide-react';
import { Habit, TimeOfDay, BettermentPeriod } from '../types';
import { calculateTargetValue } from '../utils/bettermentUtils';
import { getTodayDateString } from '../utils/dateUtils';
import { Modal } from './Modal';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>, existingId?: string) => void;
  editingHabit: Habit | null;
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

/** Small numbered section header used for the 4 Laws */
const LawHeader: React.FC<{
  num: number;
  label: string;
  icon: React.ReactNode;
  tone: string;
  htmlFor?: string;
}> = ({ num, label, icon, tone, htmlFor }) => (
  <label htmlFor={htmlFor} className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
    <span
      className={`w-6 h-6 rounded-lg border-2 text-xs font-black flex items-center justify-center flex-shrink-0 ${tone}`}
      aria-hidden="true"
    >
      {num}
    </span>
    {icon}
    <span>{label}</span>
  </label>
);

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onSaveHabit,
  editingHabit,
}) => {
  const [title, setTitle] = useState('');
  const [identity, setIdentity] = useState('');
  const [customIdentity, setCustomIdentity] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [stackAfter, setStackAfter] = useState('');
  const [twoMinuteVersion, setTwoMinuteVersion] = useState('');
  const [attractiveReward, setAttractiveReward] = useState('');

  // 1% Betterment Engine state
  const [bettermentEnabled, setBettermentEnabled] = useState(true);
  const [bettermentBaseline, setBettermentBaseline] = useState<number>(10);
  const [bettermentUnit, setBettermentUnit] = useState('pages');
  const [bettermentPeriod, setBettermentPeriod] = useState<BettermentPeriod>('daily');
  const [bettermentRate, setBettermentRate] = useState<number>(1);

  // Accessible ids for label/field associations
  const uid = useId();
  const formId = `${uid}-form`;
  const titleId = `${uid}-title`;
  const titleErrId = `${uid}-title-err`;
  const customIdentityId = `${uid}-identity`;
  const identityGroupId = `${uid}-identity-group`;
  const timeGroupId = `${uid}-time-group`;
  const engineTitleId = `${uid}-engine`;
  const periodGroupId = `${uid}-period`;
  const baselineId = `${uid}-baseline`;
  const unitId = `${uid}-unit`;
  const rateGroupId = `${uid}-rate`;
  const stackId = `${uid}-stack`;
  const twoMinId = `${uid}-twomin`;
  const rewardId = `${uid}-reward`;

  const [titleTouched, setTitleTouched] = useState(false);

  useEffect(() => {
    setTitleTouched(false);
    if (editingHabit) {
      setTitle(editingHabit.title);
      setIdentity(editingHabit.identity);
      setCustomIdentity(COMMON_IDENTITIES.includes(editingHabit.identity) ? '' : editingHabit.identity);
      setTimeOfDay(editingHabit.timeOfDay);
      setStackAfter(editingHabit.habitStack?.after || '');
      setTwoMinuteVersion(editingHabit.twoMinuteVersion || '');
      setAttractiveReward(editingHabit.attractiveReward || '');

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
      setTimeOfDay('morning');
      setStackAfter('');
      setTwoMinuteVersion('');
      setAttractiveReward('');
      setBettermentEnabled(true);
      setBettermentBaseline(10);
      setBettermentUnit('pages');
      setBettermentPeriod('daily');
      setBettermentRate(1);
    }
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  // Compounded 1-year preview
  const periodsInYear = bettermentPeriod === 'daily' ? 365 : bettermentPeriod === 'weekly' ? 52 : 12;
  const projectedOneYear = calculateTargetValue(bettermentBaseline || 1, bettermentRate, periodsInYear);

  const hasTitle = title.trim().length > 0;
  const showTitleError = titleTouched && !hasTitle;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleTouched(true);
      return;
    }

    const finalIdentity = customIdentity.trim() || identity || 'Better Self';

    onSaveHabit(
      {
        title: title.trim(),
        identity: finalIdentity,
        timeOfDay,
        habitStack: {
          after: stackAfter.trim() || 'my morning routine',
          then: title.trim(),
        },
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
      editingHabit?.id
    );

    onClose();
  };

  const labelCls = 'block text-xs font-bold text-ink uppercase tracking-wider mb-2';
  const subLabelCls = 'block text-xs font-bold text-ink-2 mb-1.5';
  const helpCls = 'text-xs text-ink-3 font-medium';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingHabit ? 'Edit Atomic Habit' : 'Design an Atomic Habit'}
      subtitle={<>Identity &bull; 4 Laws &bull; 1% Betterment Engine</>}
      icon={<Sparkles className="w-5 h-5 text-ink" />}
      size="max-w-xl"
      footer={
        <>
          {!hasTitle && (
            <span className="mr-auto text-xs font-bold text-ink-3 hidden sm:inline">Add a habit name to save</span>
          )}
          <button type="button" onClick={onClose} className="f7-btn f7-btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            disabled={!hasTitle}
            className="f7-btn f7-btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
            <span>{editingHabit ? 'Save Changes' : 'Create Atomic Habit'}</span>
          </button>
        </>
      }
    >
      {/* Scrollable Form */}
      <form id={formId} onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Habit Name */}
        <div>
          <label htmlFor={titleId} className={labelCls}>
            Habit Name <span className="text-coral" aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id={titleId}
            type="text"
            required
            data-autofocus
            aria-required="true"
            aria-invalid={showTitleError || undefined}
            aria-describedby={showTitleError ? titleErrId : undefined}
            placeholder="e.g. Read 10 Pages of Non-Fiction"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTitleTouched(true)}
            className={`f7-input text-base ${showTitleError ? 'border-coral ring-2 ring-coral/20' : ''}`}
          />
          {showTitleError && (
            <p id={titleErrId} className="mt-1.5 text-xs font-bold text-coral">
              Please give your habit a name.
            </p>
          )}
        </div>

        {/* Desired Identity */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span id={identityGroupId} className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-f7-teal" aria-hidden="true" />
              <span>Identity: "Who do you want to become?"</span>
            </span>
            <span className={`${helpCls} font-bold text-f7-teal-dark`}>Each check-in is a vote</span>
          </div>

          <div role="group" aria-labelledby={identityGroupId} className="flex flex-wrap gap-2 mb-2.5">
            {COMMON_IDENTITIES.slice(0, 4).map((id) => {
              const active = identity === id && !customIdentity;
              return (
                <button
                  type="button"
                  key={id}
                  aria-pressed={active}
                  onClick={() => {
                    setIdentity(id);
                    setCustomIdentity('');
                  }}
                  className={`f7-pill ${active ? 'f7-pill-gold' : ''}`}
                >
                  {id}
                </button>
              );
            })}
          </div>

          <label htmlFor={customIdentityId} className="sr-only">
            Custom identity
          </label>
          <input
            id={customIdentityId}
            type="text"
            placeholder="Or write custom identity (e.g. 'Consistent Runner')"
            value={customIdentity}
            onChange={(e) => {
              setCustomIdentity(e.target.value);
              setIdentity(e.target.value);
            }}
            className="f7-input"
          />
        </div>

        {/* Time of Day */}
        <div>
          <span id={timeGroupId} className={`${labelCls} flex items-center gap-1.5`}>
            <Clock className="w-4 h-4 text-f7-teal" aria-hidden="true" />
            <span>Time of Day</span>
          </span>
          <div role="group" aria-labelledby={timeGroupId} className="grid grid-cols-4 gap-2">
            {(['morning', 'afternoon', 'evening', 'anytime'] as TimeOfDay[]).map((time) => (
              <button
                type="button"
                key={time}
                aria-pressed={timeOfDay === time}
                onClick={() => setTimeOfDay(time)}
                className="f7-pill justify-center capitalize"
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* 1% Betterment Engine Config Section */}
        <section className="bg-surface-2 border-2 border-line rounded-3xl p-4 sm:p-5 space-y-4 shadow-card" aria-labelledby={engineTitleId}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-f7-gold/25 text-f7-teal-dark border-2 border-f7-gold shadow-accent-glow flex items-center justify-center" aria-hidden="true">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 id={engineTitleId} className="text-sm font-black text-ink">
                  1% Betterment Engine
                </h3>
                <p className={helpCls}>
                  Micro-compounding metric growth over chosen time periods
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={bettermentEnabled}
              aria-labelledby={engineTitleId}
              onClick={() => setBettermentEnabled(!bettermentEnabled)}
              className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full border-2 border-line transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-f7-teal ${
                bettermentEnabled ? 'bg-f7-teal' : 'bg-surface-3'
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-card transition-transform ${
                  bettermentEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {bettermentEnabled && (
            <div className="space-y-4 pt-3 border-t-2 border-dashed border-line animate-fade-in">
              {/* Cadence Period Selector */}
              <div>
                <span id={periodGroupId} className={subLabelCls}>
                  Compounding Period
                </span>
                <div role="group" aria-labelledby={periodGroupId} className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'daily', label: 'Daily (+1%/day)' },
                    { id: 'weekly', label: 'Weekly (+1%/wk)' },
                    { id: 'monthly', label: 'Monthly (+1%/mo)' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={bettermentPeriod === p.id}
                      onClick={() => setBettermentPeriod(p.id as BettermentPeriod)}
                      className="f7-pill justify-center text-center text-xs"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Baseline & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={baselineId} className={subLabelCls}>
                    Starting Baseline
                  </label>
                  <input
                    id={baselineId}
                    type="number"
                    step="any"
                    required={bettermentEnabled}
                    value={bettermentBaseline}
                    onChange={(e) => setBettermentBaseline(parseFloat(e.target.value) || 0)}
                    className="f7-input font-bold"
                  />
                </div>

                <div>
                  <label htmlFor={unitId} className={subLabelCls}>
                    Metric Unit
                  </label>
                  <input
                    id={unitId}
                    type="text"
                    placeholder="e.g. pages, mins, reps"
                    value={bettermentUnit}
                    onChange={(e) => setBettermentUnit(e.target.value)}
                    className="f7-input"
                  />
                </div>
              </div>

              {/* Growth Rate */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span id={rateGroupId} className="font-bold text-ink-2">
                    Growth Rate per {bettermentPeriod}
                  </span>
                  <span className="font-black text-f7-teal-dark dark:text-f7-teal-light">+{bettermentRate}%</span>
                </div>
                <div role="group" aria-labelledby={rateGroupId} className="flex items-center gap-2">
                  {[1, 2, 5].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      aria-pressed={bettermentRate === rate}
                      onClick={() => setBettermentRate(rate)}
                      className="f7-pill"
                    >
                      +{rate}%
                    </button>
                  ))}
                </div>
              </div>

              {/* 1-Year Projected Compounding Banner */}
              <div className="p-3.5 rounded-2xl bg-f7-teal-bg dark:bg-f7-teal-bg/15 border-2 border-f7-teal/30 text-xs text-ink-2 shadow-teal-glow" aria-live="polite">
                <div className="font-black text-f7-teal-dark dark:text-f7-teal-light flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>1-Year Compounding Projection:</span>
                </div>
                <div className="mt-1 font-medium">
                  Starting at <strong className="text-ink font-black">{bettermentBaseline} {bettermentUnit}</strong> &rarr; grows to{' '}
                  <strong className="text-ink font-black text-sm">{projectedOneYear} {bettermentUnit}</strong> in 1 year!
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 4 Laws Section */}
        <div className="space-y-5 pt-2 border-t-2 border-dashed border-line">
          <p className="text-xs font-black uppercase tracking-wider text-ink-3">The 4 Laws of Behaviour Change</p>

          {/* 1st Law: Habit Stacking */}
          <div className="space-y-2">
            <LawHeader
              num={1}
              htmlFor={stackId}
              label="Make it Obvious: Habit Stacking (Anchor Habit)"
              icon={<ArrowRight className="w-4 h-4 text-f7-teal" aria-hidden="true" />}
              tone="bg-f7-teal-bg text-f7-teal-dark border-f7-teal"
            />
            <p className={helpCls}>Formula: "After [CURRENT HABIT], I will [NEW HABIT]"</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink-2 flex-shrink-0" aria-hidden="true">
                After I:
              </span>
              <input
                id={stackId}
                type="text"
                placeholder="e.g. pour my morning coffee / close work laptop"
                value={stackAfter}
                onChange={(e) => setStackAfter(e.target.value)}
                className="f7-input"
              />
            </div>
          </div>

          {/* 2nd Law: Make it Attractive */}
          <div className="space-y-2">
            <LawHeader
              num={2}
              htmlFor={rewardId}
              label="Make it Attractive: Temptation Bundling"
              icon={<Gift className="w-4 h-4 text-f7-gold-dark" aria-hidden="true" />}
              tone="bg-f7-gold/25 text-ink border-f7-gold"
            />
            <input
              id={rewardId}
              type="text"
              placeholder="e.g. Listen to favourite podcast while doing it / Enjoy peaceful silence"
              value={attractiveReward}
              onChange={(e) => setAttractiveReward(e.target.value)}
              className="f7-input"
            />
          </div>

          {/* 3rd Law: The 2-Minute Rule */}
          <div className="space-y-2">
            <LawHeader
              num={3}
              htmlFor={twoMinId}
              label="Make it Easy: The 2-Minute Rule Version"
              icon={<Zap className="w-4 h-4 text-coral" aria-hidden="true" />}
              tone="bg-coral-bg text-coral-fg border-f7-coral"
            />
            <p className={helpCls}>
              Downscale to a 2-minute gateway version so you never fail to show up.
            </p>
            <input
              id={twoMinId}
              type="text"
              placeholder="e.g. Read just 1 page / Put on running shoes / Open code editor"
              value={twoMinuteVersion}
              onChange={(e) => setTwoMinuteVersion(e.target.value)}
              className="f7-input"
            />
          </div>

          {/* 4th Law: Make it Satisfying */}
          <div className="space-y-2">
            <LawHeader
              num={4}
              label="Make it Satisfying: Immediate Proof & Streaks"
              icon={<TrendingUp className="w-4 h-4 text-sky" aria-hidden="true" />}
              tone="bg-sky-bg text-sky-fg border-sky"
            />
            <p className={helpCls}>
              Every check-in is logged as an identity vote. The 1% Betterment Engine shows your mathematical compounding over time.
            </p>
          </div>
        </div>
      </form>
    </Modal>
  );
};
