import { Habit, HabitEntry } from './models/Habit';
import { habitDB } from './services/DatabaseService';

class BackgroundService {
  constructor() {
    this.initializeAlarms();
    this.setupEventListeners();
  }

  private async initializeAlarms() {
    // Create daily alarm for habit checking
    chrome.alarms.create('dailyHabitCheck', {
      periodInMinutes: 1440 // 24 hours
    });

    // Create weekly alarm
    chrome.alarms.create('weeklyHabitCheck', {
      periodInMinutes: 10080 // 7 days
    });

    // Create monthly alarm
    chrome.alarms.create('monthlyHabitCheck', {
      periodInMinutes: 43200 // 30 days
    });
  }

  private setupEventListeners() {
    // Listen for alarm events
    chrome.alarms.onAlarm.addListener(async (alarm) => {
      switch (alarm.name) {
        case 'dailyHabitCheck':
          await this.checkHabits('daily');
          break;
        case 'weeklyHabitCheck':
          await this.checkHabits('weekly');
          break;
        case 'monthlyHabitCheck':
          await this.checkHabits('monthly');
          break;
      }
    });

    // Listen for installation
    chrome.runtime.onInstalled.addListener(() => {
      this.initializeDatabase();
    });
  }

  private async checkHabits(frequency: 'daily' | 'weekly' | 'monthly') {
    try {
      const habits = await habitDB.habits
        .where('frequency')
        .equals(frequency)
        .toArray();

      for (const habit of habits) {
        const today = new Date();
        const entries = await habitDB.habitEntries
          .where('habitId')
          .equals(habit.id!)
          .filter((entry: HabitEntry) => {
            const entryDate = new Date(entry.date);
            return this.isWithinPeriod(entryDate, today, frequency);
          })
          .toArray();

        if (entries.length < habit.targetCount) {
          await this.sendNotification(habit);
        }
      }
    } catch (error) {
      console.error('Error checking habits:', error);
    }
  }

  private isWithinPeriod(entryDate: Date, today: Date, frequency: string): boolean {
    switch (frequency) {
      case 'daily':
        return entryDate.toDateString() === today.toDateString();
      case 'weekly':
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        return entryDate >= weekStart;
      case 'monthly':
        return (
          entryDate.getMonth() === today.getMonth() &&
          entryDate.getFullYear() === today.getFullYear()
        );
      default:
        return false;
    }
  }
private async sendNotification(habit: Habit) {
  const notificationOptions = {
    type: 'basic' as chrome.notifications.TemplateType,
    iconUrl: chrome.runtime.getURL('/icons/icon128.png'),
    title: 'Habit Reminder',
    message: `Don't forget to complete your habit: ${habit.name}`,
    priority: 1,
    requireInteraction: false,
    silent: false
  };

  try {
    await new Promise<void>((resolve) => {
      chrome.notifications.create(
        `habit-${habit.id}`,
        notificationOptions,
        () => resolve()
      );
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

  private async initializeDatabase() {
    try {
      await habitDB.open();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }
}

// Initialize the background service
new BackgroundService();