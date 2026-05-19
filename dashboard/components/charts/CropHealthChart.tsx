'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CropHealthChartProps {
  data: {
    date: string
    healthy: number
    stressed: number
    damaged: number
    critical: number
  }[]
}

export default function CropHealthChart({ data }: CropHealthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        />
        <Legend />
        <Line type="monotone" dataKey="healthy" stroke="#22c55e" strokeWidth={2} name="Healthy" />
        <Line type="monotone" dataKey="stressed" stroke="#eab308" strokeWidth={2} name="Stressed" />
        <Line type="monotone" dataKey="damaged" stroke="#f97316" strokeWidth={2} name="Damaged" />
        <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} name="Critical" />
      </LineChart>
    </ResponsiveContainer>
  )
}

