import { BettermentConfig, BettermentPeriod, Habit } from '../types';
import { getTodayDateString } from './dateUtils';

/**
 * Calculates the number of periods (days, weeks, or months) between two dates.
 */
export function calculateElapsedPeriods(
  startDateStr: string,
  targetDateStr: string,
  period: BettermentPeriod
): number {
  const start = new Date(startDateStr);
  const target = new Date(targetDateStr);

  const diffMs = target.getTime() - start.getTime();
  if (diffMs <= 0) return 0;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  switch (period) {
    case 'daily':
      return diffDays;
    case 'weekly':
      return Math.floor(diffDays / 7);
    case 'monthly':
      return Math.floor(diffDays / 30.4375);
    default:
      return diffDays;
  }
}

/**
 * Calculates the compounded target value after a given number of periods:
 * Target = Baseline * (1 + rate / 100) ^ periods
 */
export function calculateTargetValue(
  baseline: number,
  ratePercent: number,
  periods: number
): number {
  if (periods <= 0) return baseline;
  const growthFactor = Math.pow(1 + ratePercent / 100, periods);
  return Number((baseline * growthFactor).toFixed(2));
}

export interface BettermentSnapshot {
  enabled: boolean;
  baseline: number;
  unit: string;
  period: BettermentPeriod;
  ratePercent: number;
  periodsElapsed: number;
  periodLabel: string;
  currentTarget: number;
  actualLoggedToday: number | null;
  percentGrowth: number; // e.g. +7.4%
  projectedOneYear: number;
}

export function getBettermentSnapshot(
  habit: Habit,
  dateStr = getTodayDateString()
): BettermentSnapshot | null {
  if (!habit.betterment || !habit.betterment.enabled) {
    return null;
  }

  const { baselineValue, unit, period, ratePercent, startDate } = habit.betterment;
  const periodsElapsed = calculateElapsedPeriods(startDate || habit.createdAt, dateStr, period);
  const currentTarget = calculateTargetValue(baselineValue, ratePercent, periodsElapsed);
  const actualLoggedToday = habit.bettermentLogs?.[dateStr] ?? null;

  const percentGrowth = Number(
    (((currentTarget - baselineValue) / baselineValue) * 100).toFixed(1)
  );

  // 1-year periods count
  const periodsInYear = period === 'daily' ? 365 : period === 'weekly' ? 52 : 12;
  const projectedOneYear = calculateTargetValue(baselineValue, ratePercent, periodsInYear);

  let periodLabel = '';
  switch (period) {
    case 'daily':
      periodLabel = `Day ${periodsElapsed + 1}`;
      break;
    case 'weekly':
      periodLabel = `Week ${periodsElapsed + 1}`;
      break;
    case 'monthly':
      periodLabel = `Month ${periodsElapsed + 1}`;
      break;
  }

  return {
    enabled: true,
    baseline: baselineValue,
    unit,
    period,
    ratePercent,
    periodsElapsed,
    periodLabel,
    currentTarget,
    actualLoggedToday,
    percentGrowth,
    projectedOneYear,
  };
}

export interface TrajectoryPoint {
  periodIndex: number;
  label: string;
  projected: number;
  actual?: number;
}

export function getBettermentTrajectory(habit: Habit, pointsCount = 6): TrajectoryPoint[] {
  if (!habit.betterment || !habit.betterment.enabled) return [];

  const { baselineValue, ratePercent, period, startDate } = habit.betterment;
  const currentElapsed = calculateElapsedPeriods(startDate || habit.createdAt, getTodayDateString(), period);

  // Intervals to project
  const step = Math.max(1, Math.round(currentElapsed / 3) || 1);
  const points: TrajectoryPoint[] = [];

  // Baseline point
  points.push({
    periodIndex: 0,
    label: period === 'daily' ? 'Day 1' : period === 'weekly' ? 'Wk 1' : 'Mo 1',
    projected: baselineValue,
  });

  // Intermediate & Future points
  const steps = [
    Math.max(1, Math.floor(currentElapsed / 2)),
    currentElapsed,
    currentElapsed + (period === 'daily' ? 7 : period === 'weekly' ? 4 : 2),
    currentElapsed + (period === 'daily' ? 30 : period === 'weekly' ? 12 : 6),
    period === 'daily' ? 365 : period === 'weekly' ? 52 : 12,
  ];

  const uniqueSteps = Array.from(new Set(steps)).filter(s => s > 0).sort((a, b) => a - b);

  uniqueSteps.slice(0, pointsCount - 1).forEach((p) => {
    let lbl = '';
    if (period === 'daily') lbl = `Day ${p}`;
    else if (period === 'weekly') lbl = `Wk ${p}`;
    else lbl = `Mo ${p}`;

    points.push({
      periodIndex: p,
      label: lbl,
      projected: calculateTargetValue(baselineValue, ratePercent, p),
    });
  });

  return points;
}
