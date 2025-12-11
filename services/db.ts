
import { Department, ReportDefinition, ReportSubmission, User } from '../types';
import { SEED_DEFINITIONS, SEED_DEPARTMENTS, SEED_SUBMISSIONS, SEED_USERS } from './mockData';

// Giả lập tên các bảng trong PostgreSQL
const DB_KEYS = {
  USERS: 'db_users',
  DEPARTMENTS: 'db_departments',
  DEFINITIONS: 'db_report_definitions',
  SUBMISSIONS: 'db_report_submissions',
};

class LocalDatabase {
  constructor() {
    this.init();
  }

  // Khởi tạo DB nếu chưa có dữ liệu (Seed Data)
  private init() {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      console.log('🌱 Seeding Database...');
      this.save(DB_KEYS.USERS, SEED_USERS);
      this.save(DB_KEYS.DEPARTMENTS, SEED_DEPARTMENTS);
      this.save(DB_KEYS.DEFINITIONS, SEED_DEFINITIONS);
      this.save(DB_KEYS.SUBMISSIONS, SEED_SUBMISSIONS);
    }
  }

  private get<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private save(key: string, data: any[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- QUERY METHODS (Mô phỏng SELECT, INSERT, UPDATE) ---

  // SELECT * FROM table
  async findAll<T>(table: string): Promise<T[]> {
    await this.delay();
    return this.get<T>(table);
  }

  // SELECT * FROM table WHERE id = ?
  async findById<T>(table: string, id: string): Promise<T | undefined> {
    await this.delay();
    const items = this.get<T & { id: string }>(table);
    return items.find(item => item.id === id);
  }

  // INSERT INTO table ...
  async insert<T>(table: string, item: T): Promise<T> {
    await this.delay();
    const items = this.get<T>(table);
    items.push(item);
    this.save(table, items);
    return item;
  }

  // UPDATE table SET ... WHERE id = ?
  async update<T>(table: string, id: string, updates: Partial<T>): Promise<T | null> {
    await this.delay();
    const items = this.get<T & { id: string }>(table);
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updates };
    this.save(table, items);
    return items[index];
  }

  // DELETE FROM table WHERE id = ?
  async delete<T>(table: string, id: string): Promise<boolean> {
    await this.delay();
    let items = this.get<T & { id: string }>(table);
    const initialLength = items.length;
    items = items.filter(i => i.id !== id);
    
    if (items.length !== initialLength) {
      this.save(table, items);
      return true;
    }
    return false;
  }

  // Simulates Network Latency
  private delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const db = new LocalDatabase();
export const TABLES = DB_KEYS;
