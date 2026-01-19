import { serve } from 'bun'
import index from '../client/index.html'
import {
  dailyTemperatureService,
  temperatureRangeService,
  lastCompletedRowService,
} from '@/db/db'

const server = serve({
  routes: {
    // Blanket routes
    '/api/blanket': async (req: Request) => {
      const url = new URL(req.url)
      const yearParam = url.searchParams.get('year')

      if (yearParam) {
        const year = Number.parseInt(yearParam)
        if (Number.isNaN(year)) {
          return Response.json({ error: 'Invalid year parameter' }, { status: 400 })
        }
        const temperatures = await dailyTemperatureService.getByYear(year)
        return Response.json(temperatures)
      }

      // Default to current year
      const currentYear = new Date().getFullYear()
      const temperatures = await dailyTemperatureService.getByYear(currentYear)
      return Response.json(temperatures)
    },

    '/api/blanket/latest': {
      async GET() {
        const latest = await dailyTemperatureService.getLatest()
        if (!latest) {
          return Response.json({ error: 'No temperature data found' }, { status: 404 })
        }
        return Response.json(latest)
      },
    },

    // Temperature range routes
    '/api/temperature-ranges': {
      async GET() {
        const ranges = await temperatureRangeService.getAll()
        return Response.json(ranges)
      },
    },

    // Last completed row routes
    '/api/last-completed-row': {
      GET: async () => {
        const row = lastCompletedRowService.get()
        return Response.json(row || { last_knitted_date: null })
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

        lastCompletedRowService.set(last_knitted_date)
        const updated = lastCompletedRowService.get()

        return Response.json(updated || { last_knitted_date: null })
      },
    },

    // Client-side routing
    '/': index,

    // 404 error page
    '/*': {
      async GET() {
        return new Response('<html><body><h1>404 - Page Not Found</h1></body></html>', {
          status: 404,
          headers: { 'Content-Type': 'text/html' },
        })
      },
    },
  },

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
})

console.log(`🚀 Server running at ${server.url}`)
