import type { Database } from 'bun:sqlite'
import type {
  TemperatureRange,
  TemperatureRangeInsert,
  ColorMapping,
} from '@/models'

export class TemperatureRangeService {
  constructor(private db: Database) {}

  async getAll(): Promise<TemperatureRange[]> {
    return this.db
      .prepare(
        'SELECT * FROM temperature_ranges ORDER BY display_order',
      )
      .all() as TemperatureRange[]
  }

  async getColorForTemperature(temp: number): Promise<ColorMapping> {
    const range = this.db
      .prepare(
        `
        SELECT color_name, color_hex
        FROM temperature_ranges
        WHERE ? >= min_temp AND ? <= max_temp
        ORDER BY display_order
        LIMIT 1
      `,
      )
      .get(temp, temp) as ColorMapping | undefined

    if (!range) {
      // Fallback - should never happen with proper seeding
      return { color_name: 'Unknown', color_hex: '#000000' }
    }

    return range
  }

  async seed(ranges: TemperatureRangeInsert[]): Promise<void> {
    const count = this.db
      .prepare('SELECT COUNT(*) as count FROM temperature_ranges')
      .get() as { count: number }

    if (count.count === 0) {
      console.log('Seeding temperature ranges...')

      const insert = this.db.prepare(`
        INSERT INTO temperature_ranges (min_temp, max_temp, color_name, color_hex, display_order)
        VALUES (?, ?, ?, ?, ?)
      `)

      const transaction = this.db.transaction(() => {
        for (const r of ranges) {
          insert.run(
            r.min_temp,
            r.max_temp,
            r.color_name,
            r.color_hex,
            r.display_order,
          )
        }
      })

      transaction()
      console.log(`  Inserted ${ranges.length} temperature ranges`)
    }
  }
}
