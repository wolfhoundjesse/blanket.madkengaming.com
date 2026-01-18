import type { Database } from 'bun:sqlite'

export type Progress = {
  id: number
  last_knitted_date: string | null
  updated_at: string
}

export class ProgressService {
  constructor(private db: Database) {}

  get(): Progress | null {
    const stmt = this.db.query<Progress, []>(`
      SELECT id, last_knitted_date, updated_at
      FROM progress
      WHERE id = 1
    `)
    return stmt.get()
  }

  set(date: string | null): void {
    const existing = this.get()

    if (existing) {
      const stmt = this.db.query(`
        UPDATE progress
        SET last_knitted_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `)
      stmt.run(date)
    } else {
      const stmt = this.db.query(`
        INSERT INTO progress (id, last_knitted_date, updated_at)
        VALUES (1, ?, CURRENT_TIMESTAMP)
      `)
      stmt.run(date)
    }
  }
}
