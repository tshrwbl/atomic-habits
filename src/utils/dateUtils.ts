export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateString(): string {
  return formatDate(new Date());
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

export interface DayInfo {
  dateStr: string;
  dayName: string; // "M", "T", "W"
  dayNumber: number;
  isToday: boolean;
  isFuture: boolean;
}

export function getPastDays(count = 7): DayInfo[] {
  const days: DayInfo[] = [];
  const today = new Date();
  const todayStr = formatDate(today);

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = formatDate(d);
    
    // Short weekday name
    const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    
    days.push({
      dateStr,
      dayName,
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
      isFuture: false,
    });
  }

  return days;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  missedYesterday: boolean;
  needsRescueToday: boolean; // Missed yesterday and not yet completed today -> NEVER MISS TWICE!
  totalCompletions: number;
}

export function calculateStreak(completedDates: string[]): StreakInfo {
  const set = new Set(completedDates);
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const completedToday = set.has(today);
  const completedYesterday = set.has(yesterday);
  const totalCompletions = completedDates.length;

  let currentStreak = 0;
  
  // Starting point for streak check
  let checkDate = new Date();
  if (!completedToday) {
    // If not done today, streak may be active through yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const str = formatDate(checkDate);
    if (set.has(str)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak
  const sortedDates = [...completedDates]
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort();

  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const parts = dateStr.split('-').map(Number);
    const currentDate = new Date(parts[0], parts[1] - 1, parts[2]);

    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = currentDate;
  }

  const missedYesterday = !completedYesterday;
  // If user completed prior days or has ongoing habits, and missed yesterday, they are in danger of breaking the "Never Miss Twice" rule!
  const needsRescueToday = !completedToday && missedYesterday && totalCompletions > 0;

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    completedToday,
    missedYesterday,
    needsRescueToday,
    totalCompletions,
  };
}

/**
 * Returns time of day based on current local hour:
 * < 12pm -> 'morning'
 * 12pm - 6pm (12 - 18) -> 'afternoon'
 * post 6pm (>= 18) -> 'evening'
 */
export function getCurrentTimeOfDayFilter(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

export function getTimeOfDayDescription(time: 'morning' | 'afternoon' | 'evening'): string {
  switch (time) {
    case 'morning':
      return 'Morning';
    case 'afternoon':
      return 'Afternoon';
    case 'evening':
      return 'Evening';
  }
}
