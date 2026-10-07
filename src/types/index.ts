export type TimeOfDay = 'anytime' | 'morning' | 'afternoon' | 'evening';

export interface HabitStack {
  after: string; // The existing anchor habit, e.g. "After I pour my morning coffee"
  then: string;  // The new atomic habit, e.g. "I will read 1 page of a book"
}

export type BettermentPeriod = 'daily' | 'weekly' | 'monthly';

export interface BettermentConfig {
  enabled: boolean;
  baselineValue: number;    // e.g. 10
  unit: string;             // e.g. "pages", "mins", "reps", "km"
  period: BettermentPeriod; // 'daily' | 'weekly' | 'monthly'
  ratePercent: number;      // default 1 (for 1%)
  startDate: string;        // 'YYYY-MM-DD'
}

export interface Habit {
  id: string;
  title: string;
  identity: string; // "Who do you want to become?", e.g. "Lifelong Learner"
  timeOfDay: TimeOfDay;
  habitStack?: HabitStack;
  twoMinuteVersion?: string; // Downscaled version to make starting friction-free
  attractiveReward?: string; // Immediate reward or temptation bundle
  completedDates: string[];  // Format: 'YYYY-MM-DD'
  createdAt: string;
  targetPerWeek?: number;    // Usually 7
  archived?: boolean;
  
  // 1% Betterment Engine
  betterment?: BettermentConfig;
  bettermentLogs?: Record<string, number>; // dateStr -> actual value logged
}

export type ScorecardRating = 'positive' | 'negative' | 'neutral';

export interface ScorecardItem {
  id: string;
  name: string;
  rating: ScorecardRating;
  timeOfDay: 'morning' | 'day' | 'evening';
}

export interface HabitTemplate {
  title: string;
  identity: string;
  timeOfDay: TimeOfDay;
  stackAfter: string;
  twoMinuteVersion: string;
  attractiveReward: string;
  description: string;
  betterment?: BettermentConfig;
}
