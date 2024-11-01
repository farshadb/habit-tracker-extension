export interface Habit {
  id?: number;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: Date;
}

export interface HabitEntry {
  id?: number;
  habitId: number;
  date: Date;
  completed: boolean;
}