import './index.css'
import { useEffect, useState } from 'react'

type DailyTemperature = {
  date: string
  high_temperature: number
  color_name: string
  color_hex: string
  year: number
}

type Progress = {
  last_knitted_date: string | null
}

function App() {
  const [temperatures, setTemperatures] = useState<DailyTemperature[]>([])
  const [progress, setProgress] = useState<Progress>({ last_knitted_date: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [tempResponse, progressResponse] = await Promise.all([
          fetch('/api/blanket'),
          fetch('/api/last-completed-row'),
        ])

        if (!tempResponse.ok) {
          throw new Error('Failed to fetch temperatures')
        }
        if (!progressResponse.ok) {
          throw new Error('Failed to fetch progress')
        }

        const tempData = await tempResponse.json()
        const progressData = await progressResponse.json()

        setTemperatures(tempData)
        setProgress(progressData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const parseLocalDate = (dateString: string) => {
    const parts = dateString.split('-').map(Number)
    const year = parts[0] ?? 0
    const month = parts[1] ?? 1
    const day = parts[2] ?? 1
    return new Date(year, month - 1, day)
  }

  const getOrdinalDay = (date: string) => {
    const day = parseLocalDate(date).getDate()
    const suffix = ['th', 'st', 'nd', 'rd']
    const v = day % 100
    return day + (suffix[(v - 20) % 10] ?? suffix[v] ?? suffix[0] ?? 'th')
  }

  const getMonthYear = (date: string) => {
    return parseLocalDate(date).toLocaleDateString('en-US', {
      month: 'long',
    })
  }

  const shouldShowMonthRow = (index: number) => {
    if (index === 0) return true
    const currentDate = temperatures[index]?.date
    const previousDate = temperatures[index - 1]?.date
    if (!currentDate || !previousDate) return false
    const currentMonth = parseLocalDate(currentDate).getMonth()
    const previousMonth = parseLocalDate(previousDate).getMonth()
    return currentMonth !== previousMonth
  }

  const getTextColorForBackground = (hexColor: string) => {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  const isRowKnitted = (date: string) => {
    if (!progress.last_knitted_date) return false
    return date <= progress.last_knitted_date
  }

  const handleRowClick = async (date: string) => {
    const newLastKnittedDate =
      progress.last_knitted_date === date ? null : date

    try {
      const response = await fetch('/api/last-completed-row', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ last_knitted_date: newLastKnittedDate }),
      })

      if (!response.ok) {
        throw new Error('Failed to update progress')
      }

      const updated = await response.json()
      setProgress(updated)
    } catch (err) {
      console.error('Error updating progress:', err)
    }
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-lg'>Loading temperature data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-lg text-red-500'>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto max-w-2xl py-10'>
      <h1 className='mb-6 text-3xl font-bold'>2026 Temperature Blanket</h1>

      <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow'>
        <div className='overflow-x-auto'>
          <table className='w-full caption-bottom text-sm'>
            <thead className='border-b bg-gray-50'>
              <tr>
                <th className='h-10 px-4 text-left align-middle font-medium text-gray-700'>
                  Date
                </th>
                <th className='h-10 px-4 text-left align-middle font-medium text-gray-700'>
                  High
                </th>
                <th className='h-10 px-4 text-left align-middle font-medium text-gray-700'>
                  Yarn Color
                </th>
              </tr>
            </thead>
            <tbody>
              {temperatures.map((temp, index) => {
                const knitted = isRowKnitted(temp.date)
                const textColor = knitted
                  ? getTextColorForBackground(temp.color_hex)
                  : undefined

                return (
                  <>
                    {shouldShowMonthRow(index) && (
                      <tr key={`month-${temp.date}`}>
                        <td
                          colSpan={3}
                          className='bg-gray-100 p-3 text-center font-semibold text-gray-700'
                        >
                          {getMonthYear(temp.date)}
                        </td>
                      </tr>
                    )}
                    <tr
                      key={temp.date}
                      onClick={() => handleRowClick(temp.date)}
                      className='cursor-pointer border-b transition-colors hover:opacity-80'
                      style={{
                        backgroundColor: knitted ? temp.color_hex : undefined,
                        color: textColor,
                      }}
                    >
                      <td className='p-4 align-middle font-medium'>
                        {getOrdinalDay(temp.date)}
                      </td>
                      <td className='p-4 align-middle'>{temp.high_temperature}°F</td>
                      <td className='p-4 align-middle'>
                        <div className='flex items-center gap-2'>
                          <div
                            className='h-6 w-12 rounded border border-gray-300'
                            style={{ backgroundColor: temp.color_hex }}
                          />
                          <span>{temp.color_name}</span>
                        </div>
                      </td>
                    </tr>
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default App
