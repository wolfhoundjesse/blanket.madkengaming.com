export type VisualCrossingDay = {
  datetime: string
  tempmax: number
  tempmin: number
  temp: number
  precip: number
  precipprob: number
  snow: number
  snowdepth: number
  sunrise: string
  sunset: string
}

export type TemperatureDataResponse = {
  days: VisualCrossingDay[]
  latitude: number
  longitude: number
  resolvedAddress: string
  timezone: string
}

export type TemperatureDataRequest = {
  latitude: string
  longitude: string
  startDate: string
  endDate: string
  apiKey: string
}
