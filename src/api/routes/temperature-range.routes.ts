import type { TemperatureRangeService } from '@/db/services'

export function createTemperatureRangeRoutes(service: TemperatureRangeService) {
  return {
    '/api/temperature-ranges': {
      async GET() {
        const ranges = await service.getAll()
        return Response.json(ranges)
      },
    },

    '/api/temperature-ranges/color/:temp': async (req: Request) => {
      const temp = Number.parseFloat(req.params.temp)
      if (Number.isNaN(temp)) {
        return Response.json(
          { error: 'Invalid temperature parameter' },
          { status: 400 },
        )
      }

      const color = await service.getColorForTemperature(temp)
      return Response.json(color)
    },
  }
}
