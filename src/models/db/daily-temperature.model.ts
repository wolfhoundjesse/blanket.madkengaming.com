export type DailyTemperature = {
  date: string
  high_temperature: number
  color_name: string
  color_hex: string
  year: number
  created_at: string
}

export type DailyTemperatureInsert = Omit<DailyTemperature, 'created_at'>
