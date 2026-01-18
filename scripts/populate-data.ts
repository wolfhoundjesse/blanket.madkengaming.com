import { WeatherService } from '@/api/services/weather.service'
import { dailyTemperatureService, temperatureRangeService } from '@/db/db'

async function populateData() {
  const apiKey = process.env.VISUALCROSSING_API_KEY
  const latitude = process.env.LATITUDE
  const longitude = process.env.LONGITUDE

  if (!apiKey || !latitude || !longitude) {
    console.error('Missing required environment variables')
    console.error('Required: VISUALCROSSING_API_KEY, LATITUDE, LONGITUDE')
    process.exit(1)
  }

  const weatherService = new WeatherService()

  try {
    console.log('Fetching temperature data for January 1-17, 2026...')

    const days = await weatherService.fetchTemperatureData({
      latitude,
      longitude,
      startDate: '2026-01-01',
      endDate: '2026-01-17',
      apiKey,
    })

    console.log(`Received ${days.length} days of data`)

    let inserted = 0
    for (const day of days) {
      const year = Number.parseInt(day.datetime.split('-')[0] ?? '2026')
      const roundedTemp = Math.round(day.tempmax)
      const color = await temperatureRangeService.getColorForTemperature(
        roundedTemp,
      )

      if (!color) {
        console.warn(`No color found for temperature ${roundedTemp}`)
        continue
      }

      const success = await dailyTemperatureService.insert({
        date: day.datetime,
        high_temperature: roundedTemp,
        color_name: color.color_name,
        color_hex: color.color_hex,
        year,
      })

      if (success) {
        inserted++
        console.log(
          `  ${day.datetime}: ${roundedTemp}°F → ${color.color_name}`,
        )
      }
    }

    console.log(`\nSuccessfully inserted ${inserted} records`)

    const stats = await dailyTemperatureService.getStats()
    console.log(
      `Total records in database: ${stats.total}, Latest: ${stats.latest}`,
    )
  } catch (error) {
    console.error('Error populating data:', error)
    process.exit(1)
  }
}

populateData()
