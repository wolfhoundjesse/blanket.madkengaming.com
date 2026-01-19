import { WeatherService } from '@/api/services/weather.service'
import { dailyTemperatureService, temperatureRangeService } from '@/db/db'

async function fetchYesterday() {
  const apiKey = process.env.VISUALCROSSING_API_KEY
  const latitude = process.env.LATITUDE
  const longitude = process.env.LONGITUDE
  const timezone = process.env.TIMEZONE

  if (!apiKey || !latitude || !longitude || !timezone) {
    console.error('Missing required environment variables')
    console.error('Required: VISUALCROSSING_API_KEY, LATITUDE, LONGITUDE, TIMEZONE')
    process.exit(1)
  }

  // Calculate yesterday's date in the configured timezone
  const yesterday = new Date(
    new Date().toLocaleString('en-US', { timeZone: timezone }),
  )
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const weatherService = new WeatherService()

  try {
    console.log(`${new Date().toISOString()}: Fetching temperature data for ${yesterdayStr}...`)

    const days = await weatherService.fetchTemperatureData({
      latitude,
      longitude,
      startDate: yesterdayStr,
      endDate: yesterdayStr,
      apiKey,
    })

    if (days.length === 0) {
      console.log('No data returned from API')
      process.exit(0)
    }

    const day = days[0]
    const year = Number.parseInt(day.datetime.split('-')[0] ?? new Date().getFullYear().toString())
    const roundedTemp = Math.round(day.tempmax)
    const color = await temperatureRangeService.getColorForTemperature(roundedTemp)

    if (!color) {
      console.error(`No color found for temperature ${roundedTemp}`)
      process.exit(1)
    }

    const success = await dailyTemperatureService.insert({
      date: day.datetime,
      high_temperature: roundedTemp,
      color_name: color.color_name,
      color_hex: color.color_hex,
      year,
    })

    if (success) {
      console.log(`Successfully inserted: ${day.datetime}: ${roundedTemp}°F → ${color.color_name}`)
    } else {
      console.log(`Record for ${day.datetime} already exists (skipped)`)
    }

    const latest = await dailyTemperatureService.getLastRecordedDate()
    console.log(`Latest recorded date: ${latest}`)
    console.log(`${new Date().toISOString()}: Successfully completed`)
  } catch (error) {
    console.error(`${new Date().toISOString()}: Error fetching yesterday data:`, error)
    process.exit(1)
  }
}

fetchYesterday()
