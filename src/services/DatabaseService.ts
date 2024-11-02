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
}

export const habitDB = new HabitDatabase();