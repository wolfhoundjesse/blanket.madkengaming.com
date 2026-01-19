import { Database } from 'bun:sqlite'
import type { TemperatureRangeInsert } from '@/models'
import {
  DailyTemperatureService,
  TemperatureRangeService,
  LastCompletedRowService,
} from './services'

const db = new Database('db.sqlite', { create: true, strict: true })

// Initialize database tables
function initDb() {
  db.run(`
    CREATE TABLE IF NOT EXISTS temperature_ranges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      min_temp INTEGER NOT NULL,
      max_temp INTEGER NOT NULL,
      color_name TEXT NOT NULL,
      color_hex TEXT NOT NULL,
      display_order INTEGER NOT NULL,
      UNIQUE(min_temp, max_temp)
    );

    CREATE TABLE IF NOT EXISTS daily_temperatures (
      date TEXT PRIMARY KEY,
      high_temperature INTEGER NOT NULL,
      color_name TEXT NOT NULL,
      color_hex TEXT NOT NULL,
      year INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      last_knitted_date TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_year ON daily_temperatures(year);
    CREATE INDEX IF NOT EXISTS idx_date ON daily_temperatures(date);
  `)

  seedTemperatureRanges()
}

// Seed initial temperature ranges
async function seedTemperatureRanges() {
  const rangeService = new TemperatureRangeService(db)

  const ranges: TemperatureRangeInsert[] = [
    { min_temp: 100, max_temp: 999, color_name: 'Bright Orange', color_hex: '#FF6600', display_order: 1 },
    { min_temp: 90, max_temp: 99, color_name: 'Yellow', color_hex: '#FFD700', display_order: 2 },
    { min_temp: 79, max_temp: 89, color_name: 'Pink', color_hex: '#FF69B4', display_order: 3 },
    { min_temp: 68, max_temp: 78, color_name: 'Turquoise', color_hex: '#40E0D0', display_order: 4 },
    { min_temp: 55, max_temp: 67, color_name: 'Purple', color_hex: '#800080', display_order: 5 },
    { min_temp: 45, max_temp: 54, color_name: 'Light Pink', color_hex: '#FFB6C1', display_order: 6 },
    { min_temp: 34, max_temp: 44, color_name: 'Dark Green', color_hex: '#006400', display_order: 7 },
    { min_temp: 22, max_temp: 33, color_name: 'Light Purple', color_hex: '#9370DB', display_order: 8 },
    { min_temp: 1, max_temp: 21, color_name: 'Blue', color_hex: '#0000FF', display_order: 9 },
    { min_temp: -999, max_temp: 0, color_name: 'Light Blue', color_hex: '#ADD8E6', display_order: 10 },
  ]

  await rangeService.seed(ranges)
}

// Initialize on module load
initDb()

// Export services
export const temperatureRangeService = new TemperatureRangeService(db)
export const dailyTemperatureService = new DailyTemperatureService(db)
export const lastCompletedRowService = new LastCompletedRowService(db)

// Export database instance for advanced use cases
export default db
