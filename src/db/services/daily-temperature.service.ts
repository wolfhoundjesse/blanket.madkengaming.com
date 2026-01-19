import type { Database } from 'bun:sqlite'
import type {
  DailyTemperature,
  DailyTemperatureInsert,
} from '@/models'

export class DailyTemperatureService {
  constructor(private db: Database) {}

  async getAll(): Promise<DailyTemperature[]> {
    return this.db
      .prepare('SELECT * FROM daily_temperatures ORDER BY date')
      .all() as DailyTemperature[]
  }

  async getByYear(year: number): Promise<DailyTemperature[]> {
    return this.db
      .prepare('SELECT * FROM daily_temperatures WHERE year = ? ORDER BY date')
      .all(year) as DailyTemperature[]
  }

  async getLatest(): Promise<DailyTemperature | null> {
    const row = this.db
      .prepare('SELECT * FROM daily_temperatures ORDER BY date DESC LIMIT 1')
      .get() as DailyTemperature | undefined
    return row || null
  }

  async getLastRecordedDate(): Promise<string | null> {
    const row = this.db
      .prepare('SELECT MAX(date) as lastDate FROM daily_temperatures')
      .get() as { lastDate: string | null }
    return row.lastDate
  }

  async insert(record: DailyTemperatureInsert): Promise<boolean> {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO daily_temperatures (date, high_temperature, color_name, color_hex, year)
      VALUES (?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      record.date,
      record.high_temperature,
      record.color_name,
      record.color_hex,
      record.year,
    )
    return result.changes > 0
  }
}
