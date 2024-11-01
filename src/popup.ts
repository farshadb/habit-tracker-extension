import { habitDB } from './services/DatabaseService';
import { format } from 'date-fns';
import { Habit } from './models/Habit';

class HabitTrackerPopup {
  private habitList: HTMLElement;
  private addHabitButton: HTMLButtonElement;

  constructor() {
    this.habitList = document.getElementById('habit-list')!;
    this.addHabitButton = document.getElementById('add-habit') as HTMLButtonElement;
    
    this.initializeEventListeners();
    this.loadHabits();
  }

  private initializeEventListeners(): void {
    this.addHabitButton.addEventListener('click', () => this.openOptionsPage());
  }

  private async loadHabits(): Promise<void> {
    const habits = await habitDB.habits.toArray();
    this.renderHabits(habits);
  }

  private renderHabits(habits: Habit[]): void {
    this.habitList.innerHTML = habits.map(habit => `
      <div class="habit-item">
        <span>${habit.name}</span>
        <button data-habit-id="${habit.id}">Complete</button>
      </div>
    `).join('');
  }

  private openOptionsPage(): void {
    chrome.runtime.openOptionsPage();
  }
}

new HabitTrackerPopup();