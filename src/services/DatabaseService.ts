import Dexie, { Table } from 'dexie';
import { Habit, HabitEntry } from '../models/Habit';

export class HabitDatabase extends Dexie {
  habits!: Table<Habit>;
  habitEntries!: Table<HabitEntry>;

  constructor() {
    super('HabitTrackerDB');
    this.version(1).stores({
      habits: '++id, name, frequency, targetCount, createdAt',
      habitEntries: '++id, habitId, date, completed'
    });
  }

   async addHabit(habit: Habit): Promise<void> {
    try {
      await this.habits.add(habit);
      console.log('Habit added successfully:', habit);
    } catch (error) {
      console.error('Failed to add habit:', error);
    }
  }
}

export const habitDB = new HabitDatabase();