import type { DailyTemperatureService } from '@/db/services'

export function createTemperatureRoutes(service: DailyTemperatureService) {
  return {
    '/api/temperatures': {
      async GET() {
        const temperatures = await service.getAll()
        return Response.json(temperatures)
      },
    },

    '/api/temperatures/year/:year': async (req: Request) => {
      const year = Number.parseInt(req.params.year)
      if (Number.isNaN(year)) {
        return Response.json({ error: 'Invalid year parameter' }, { status: 400 })
      }

      const temperatures = await service.getByYear(year)
      return Response.json(temperatures)
    },

    '/api/temperatures/stats': {
      async GET() {
        const stats = await service.getStats()
        return Response.json(stats)
      },
    },
  }
}
