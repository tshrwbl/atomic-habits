import { Habit, HabitTemplate, ScorecardItem } from '../types';
import { formatDate } from '../utils/dateUtils';

// Helper to get relative dates for nice pre-loaded streaks
function getDateAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return formatDate(d);
}

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Read 10 Pages of Non-Fiction',
    identity: 'Lifelong Learner',
    timeOfDay: 'morning',
    habitStack: {
      after: 'I brew my morning coffee',
      then: 'I will sit and read',
    },
    twoMinuteVersion: 'Open book and read just 1 page',
    attractiveReward: 'Sip fresh espresso in my favorite armchair',
    completedDates: [
      getDateAgo(4),
      getDateAgo(3),
      getDateAgo(2),
      getDateAgo(1),
    ],
    createdAt: getDateAgo(10),
    betterment: {
      enabled: true,
      baselineValue: 10,
      unit: 'pages',
      period: 'daily',
      ratePercent: 1,
      startDate: getDateAgo(10),
    },
    bettermentLogs: {
      [getDateAgo(4)]: 10.4,
      [getDateAgo(3)]: 10.7,
      [getDateAgo(2)]: 11,
      [getDateAgo(1)]: 11,
    },
  },
  {
    id: 'habit-2',
    title: 'Core & Mobility Movement',
    identity: 'Energized Athlete',
    timeOfDay: 'morning',
    habitStack: {
      after: 'I get out of bed and drink water',
      then: 'I will do bodyweight movement',
    },
    twoMinuteVersion: 'Do 5 pushups and stretch hamstrings',
    attractiveReward: 'Play favorite high-energy music playlist',
    completedDates: [
      getDateAgo(5),
      getDateAgo(4),
      getDateAgo(2),
      getDateAgo(1),
    ],
    createdAt: getDateAgo(14),
    betterment: {
      enabled: true,
      baselineValue: 15,
      unit: 'mins',
      period: 'weekly',
      ratePercent: 1,
      startDate: getDateAgo(14),
    },
    bettermentLogs: {
      [getDateAgo(1)]: 15.3,
    },
  },
  {
    id: 'habit-3',
    title: 'Deep Work Sprint',
    identity: 'Master Craftsperson',
    timeOfDay: 'afternoon',
    habitStack: {
      after: 'I sit at my desk and put on headphones',
      then: 'I will write focused code without distractions',
    },
    twoMinuteVersion: 'Open code editor and clear open tabs',
    attractiveReward: 'Track session on focus dashboard',
    completedDates: [
      getDateAgo(3),
      getDateAgo(2),
      getDateAgo(1),
    ],
    createdAt: getDateAgo(8),
    betterment: {
      enabled: true,
      baselineValue: 45,
      unit: 'mins',
      period: 'monthly',
      ratePercent: 2,
      startDate: getDateAgo(30),
    },
    bettermentLogs: {
      [getDateAgo(1)]: 46,
    },
  },
  {
    id: 'habit-4',
    title: 'Evening Gratitude Journal',
    identity: 'Mindful Thinker',
    timeOfDay: 'evening',
    habitStack: {
      after: 'I brush my teeth before bed',
      then: 'I will write things I was grateful for today',
    },
    twoMinuteVersion: 'Write a single sentence of gratitude',
    attractiveReward: 'Relax in calm dim bedroom lighting',
    completedDates: [
      getDateAgo(2),
      getDateAgo(1),
    ],
    createdAt: getDateAgo(5),
    betterment: {
      enabled: true,
      baselineValue: 3,
      unit: 'sentences',
      period: 'weekly',
      ratePercent: 5,
      startDate: getDateAgo(7),
    },
  },
];

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    title: 'Daily Deep Reading',
    identity: 'Lifelong Learner',
    timeOfDay: 'morning',
    stackAfter: 'I brew my morning coffee',
    twoMinuteVersion: 'Open book and read just 1 page',
    attractiveReward: 'Sip hot coffee in comfortable chair',
    description: 'Compounds knowledge daily with +1% pages per day.',
    betterment: {
      enabled: true,
      baselineValue: 10,
      unit: 'pages',
      period: 'daily',
      ratePercent: 1,
      startDate: getDateAgo(0),
    },
  },
  {
    title: 'Progressive Pushup Challenge',
    identity: 'Strong & Disciplined Athlete',
    timeOfDay: 'morning',
    stackAfter: 'I roll out of bed',
    twoMinuteVersion: 'Drop down and do 2 pushups',
    attractiveReward: 'Check off box with high energy morning music',
    description: 'Increases reps by +1% each day or week.',
    betterment: {
      enabled: true,
      baselineValue: 15,
      unit: 'reps',
      period: 'daily',
      ratePercent: 1,
      startDate: getDateAgo(0),
    },
  },
  {
    title: 'Focused Writing Sprint',
    identity: 'Prolific Writer',
    timeOfDay: 'afternoon',
    stackAfter: 'I open my laptop in the afternoon',
    twoMinuteVersion: 'Write a single paragraph or 50 words',
    attractiveReward: 'Save draft and stretch arms in victory',
    description: 'Expand daily word output smoothly by +1% per day.',
    betterment: {
      enabled: true,
      baselineValue: 200,
      unit: 'words',
      period: 'daily',
      ratePercent: 1,
      startDate: getDateAgo(0),
    },
  },
  {
    title: 'Deep Meditation Practice',
    identity: 'Calm & Present Mind',
    timeOfDay: 'morning',
    stackAfter: 'I finish washing my face',
    twoMinuteVersion: 'Sit quietly and take 5 conscious breaths',
    attractiveReward: 'A feeling of centered clarity for the entire morning',
    description: 'Add +1% meditation time each week.',
    betterment: {
      enabled: true,
      baselineValue: 10,
      unit: 'mins',
      period: 'weekly',
      ratePercent: 1,
      startDate: getDateAgo(0),
    },
  },
  {
    title: 'Morning Sunlight & Walk',
    identity: 'Healthy & Vibrant Person',
    timeOfDay: 'morning',
    stackAfter: 'I step out of the bedroom',
    twoMinuteVersion: 'Step onto the balcony or porch for 2 minutes of fresh air',
    attractiveReward: 'Feel the morning warm sunshine and take deep breaths',
    description: 'Anchor circadian rhythm and boost morning dopamine naturally.',
  },
  {
    title: 'Shutdown Ritual & Desk Clear',
    identity: 'Organized & Peaceful Professional',
    timeOfDay: 'evening',
    stackAfter: 'I close my laptop at the end of the workday',
    twoMinuteVersion: 'Wipe down desk and close all browser tabs',
    attractiveReward: 'A feeling of mental closure and zero work guilt for the evening',
    description: 'Clear boundary separating deep work from evening relaxation.',
  },
  {
    title: 'Floss Daily',
    identity: 'Self-Respecting Caretaker',
    timeOfDay: 'evening',
    stackAfter: 'I set down my toothbrush at night',
    twoMinuteVersion: 'Floss just one tooth',
    attractiveReward: 'Clean mouth feeling before getting into bed',
    description: 'The classic 2-minute rule example from James Clear.',
  },
];

export const INITIAL_SCORECARD: ScorecardItem[] = [
  { id: 'sc-1', name: 'Wake up when alarm rings', rating: 'positive', timeOfDay: 'morning' },
  { id: 'sc-2', name: 'Check phone notifications in bed', rating: 'negative', timeOfDay: 'morning' },
  { id: 'sc-3', name: 'Drink a glass of water', rating: 'positive', timeOfDay: 'morning' },
  { id: 'sc-4', name: 'Brew morning coffee', rating: 'neutral', timeOfDay: 'morning' },
  { id: 'sc-5', name: 'Mindless social media scrolling', rating: 'negative', timeOfDay: 'day' },
  { id: 'sc-6', name: 'Deep work sprint (45 min)', rating: 'positive', timeOfDay: 'day' },
  { id: 'sc-7', name: 'Healthy nutritious lunch', rating: 'positive', timeOfDay: 'day' },
  { id: 'sc-8', name: 'Late night sugary snacking', rating: 'negative', timeOfDay: 'evening' },
  { id: 'sc-9', name: 'Read 10 pages before sleep', rating: 'positive', timeOfDay: 'evening' },
];
