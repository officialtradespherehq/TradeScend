"use client"

import { useEffect, useState } from "react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { useTheme } from "next-themes"

export default function TradingChart({
  className = "",
  height = 200,
}: {
  className?: string
  height?: number
}) {
  const { theme } = useTheme()
  const [data, setData] = useState<Array<{ time: string; value: number }>>([])

  // Generate random price data
  const generateChartData = (length = 50, volatility = 0.1) => {
    const newData = []
    let price = 100

    for (let i = 0; i < length; i++) {
      const change = (Math.random() - 0.5) * 2 * volatility * price
      price = Math.max(price + change, 1) // Ensure price never goes below 1
      
      // Create time labels (last 24 hours in 30-minute intervals)
      const time = new Date()
      time.setHours(time.getHours() - (length - i) * 0.5)
      const timeLabel = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      
      newData.push({
        time: timeLabel,
        value: Number(price.toFixed(2))
      })
    }

    return newData
  }

  useEffect(() => {
    setData(generateChartData(48, 0.03)) // 24 hours of data points
  }, [])

  return (
    <div className={`w-full h-[${height}px] ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={theme === 'dark' ? '#22c55e' : '#16a34a'}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={theme === 'dark' ? '#22c55e' : '#16a34a'}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme === 'dark' ? '#333333' : '#dddddd'}
            vertical={false}
          />
          <XAxis
            dataKey="time"
            stroke={theme === 'dark' ? '#888888' : '#666666'}
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke={theme === 'dark' ? '#888888' : '#666666'}
            tick={{ fontSize: 12 }}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
            labelStyle={{
              color: theme === 'dark' ? '#d1d5db' : '#374151',
              marginBottom: '0.25rem'
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={theme === 'dark' ? '#22c55e' : '#16a34a'}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}