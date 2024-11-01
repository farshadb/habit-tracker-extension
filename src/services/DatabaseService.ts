import Dexie from 'dexie';
import { Habit, HabitEntry } from '../models/Habit';

class HabitDatabase extends Dexie {
  habits: Dexie.Table<Habit, number>;
  entries: Dexie.Table<HabitEntry, number>;

  constructor() {
    super('HabitTrackerDB');
    this.version(1).stores({
      habits: '++id, name, frequency',
      entries: '++id, habitId, date'
    });

    this.habits = this.table('habits');
    this.entries = this.table('entries');
  }

  async addHabit(habit: Habit): Promise<number> {
    return this.habits.add(habit);
  }

  async logHabitEntry(entry: HabitEntry): Promise<number> {
    return this.entries.add(entry);
  }
}

export const habitDB = new HabitDatabase();