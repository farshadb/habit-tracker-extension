import { Habit, HabitEntry } from './models/Habit';
import { habitDB } from './services/DatabaseService';
import { format } from 'date-fns';

class HabitTrackerPopup {
  private habitList: HTMLElement;
  private addHabitButton: HTMLButtonElement;

  constructor() {
    this.habitList = document.getElementById('habit-list')!;
    this.addHabitButton = document.getElementById('add-habit')! as HTMLButtonElement;
    
    this.initializeEventListeners();
    this.loadHabits();
  }

  private initializeEventListeners(): void {
    this.addHabitButton.addEventListener('click', () => this.openOptionsPage());
    this.habitList.addEventListener('click', (e) => this.handleHabitClick(e));
  }

  private async loadHabits(): Promise<void> {
    const habits = await habitDB.habits.toArray();
    const today = new Date();
    
    const habitsWithProgress = await Promise.all(
      habits.map(async (habit) => {
        const entries = await this.getHabitEntries(habit, today);
        return {
          ...habit,
          progress: entries.length,
          isCompleted: entries.length >= habit.targetCount
        };
      })
    );
    
    this.renderHabits(habitsWithProgress);
  }

  private async getHabitEntries(habit: Habit, date: Date): Promise<HabitEntry[]> {
    const startDate = this.getStartDate(date, habit.frequency);
    
    return await habitDB.habitEntries
      .where('habitId')
      .equals(habit.id!)
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= date;
      })
      .toArray();
  }

  private getStartDate(date: Date, frequency: string): Date {
    const startDate = new Date(date);
    switch (frequency) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate.setDate(date.getDate() - date.getDay());
        break;
      case 'monthly':
        startDate.setDate(1);
        break;
    }
    return startDate;
  }

  private renderHabits(habits: (Habit & { progress: number, isCompleted: boolean })[]): void {
    this.habitList.innerHTML = habits.map(habit => `
      <div class="habit-item ${habit.isCompleted ? 'completed' : ''}" data-habit-id="${habit.id}">
        <div class="habit-info">
          <h3>${habit.name}</h3>
          <p>${habit.description || ''}</p>
          <div class="progress-bar">
            <div class="progress" style="width: ${(habit.progress / habit.targetCount) * 100}%"></div>
          </div>
          <p class="progress-text">${habit.progress}/${habit.targetCount} ${habit.frequency}</p>
        </div>
        <button class="complete-button" data-habit-id="${habit.id}" ${habit.isCompleted ? 'disabled' : ''}>
          ${habit.isCompleted ? '✓' : 'Complete'}
        </button>
      </div>
    `).join('');
  }

  private async handleHabitClick(e: MouseEvent): Promise<void> {
    const target = e.target as HTMLElement;
    if (target.classList.contains('complete-button')) {
      const habitId = Number(target.getAttribute('data-habit-id'));
      await this.completeHabit(habitId);
      await this.loadHabits(); // Refresh the display
    }
  }

  private async completeHabit(habitId: number): Promise<void> {
    const entry: HabitEntry = {
      habitId,
      date: new Date(),
      completed: true
    };
    
    await habitDB.habitEntries.add(entry);
  }

  private openOptionsPage(): void {
    chrome.runtime.openOptionsPage();
  }
}

// Initialize the popup
new HabitTrackerPopup();