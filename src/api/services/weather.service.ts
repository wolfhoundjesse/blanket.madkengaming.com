import type {
  TemperatureDataRequest,
  TemperatureDataResponse,
  VisualCrossingDay,
} from '@/models'

export class WeatherService {
  private baseUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services'

  async fetchTemperatureData(
    request: TemperatureDataRequest,
  ): Promise<VisualCrossingDay[]> {
    const url = `${this.baseUrl}/timeline/${request.latitude},${request.longitude}/${request.startDate}/${request.endDate}?unitGroup=us&include=days&key=${request.apiKey}&contentType=json`

    console.log(
      `Fetching temperature data from ${request.startDate} to ${request.endDate}...`,
    )

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `Weather API request failed: ${response.status} ${response.statusText}`,
      )
    }

    const data = (await response.json()) as TemperatureDataResponse

    return data.days
  }
}
