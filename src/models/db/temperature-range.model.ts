export type TemperatureRange = {
  id: number
  min_temp: number
  max_temp: number
  color_name: string
  color_hex: string
  display_order: number
}

export type TemperatureRangeInsert = Omit<TemperatureRange, 'id'>

export type ColorMapping = {
  color_name: string
  color_hex: string
}
