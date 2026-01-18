import type { ProgressService } from '@/db/services'

export function createProgressRoutes(progressService: ProgressService) {
  return {
    '/api/progress': {
      GET: async () => {
        const progress = progressService.get()
        return Response.json(progress || { last_knitted_date: null })
      },
      PUT: async (req: Request) => {
        const body = await req.json()
        const { last_knitted_date } = body

        if (last_knitted_date !== null && typeof last_knitted_date !== 'string') {
          return Response.json(
            { error: 'last_knitted_date must be a string or null' },
            { status: 400 }
          )
        }

        progressService.set(last_knitted_date)
        const updated = progressService.get()

        return Response.json(updated || { last_knitted_date: null })
      },
    },
  }
}
