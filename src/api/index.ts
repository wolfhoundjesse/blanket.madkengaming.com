import { serve } from 'bun'
import index from '../client/index.html'
import {
  dailyTemperatureService,
  temperatureRangeService,
  progressService,
} from '@/db/db'
import {
  createTemperatureRoutes,
  createTemperatureRangeRoutes,
  createProgressRoutes,
} from './routes'

// Create route handlers
const temperatureRoutes = createTemperatureRoutes(dailyTemperatureService)
const temperatureRangeRoutes = createTemperatureRangeRoutes(temperatureRangeService)
const progressRoutes = createProgressRoutes(progressService)

const server = serve({
  routes: {
    // API routes
    ...temperatureRoutes,
    ...temperatureRangeRoutes,
    ...progressRoutes,

    // Example routes (can be removed)
    '/api/hello': {
      async GET(req) {
        return Response.json({
          message: 'Hello, world!',
          method: 'GET',
        })
      },
      async PUT(req) {
        return Response.json({
          message: 'Hello, world!',
          method: 'PUT',
        })
      },
    },

    '/api/hello/:name': async (req) => {
      const name = req.params.name
      return Response.json({
        message: `Hello, ${name}!`,
      })
    },

    // Serve index.html for all unmatched routes (client-side routing)
    '/*': index,
  },

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
})

console.log(`🚀 Server running at ${server.url}`)
