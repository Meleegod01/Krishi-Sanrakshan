'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface RegionalStatsChartProps {
  data: {
    state: string
    totalImages: number
    damageReports: number
  }[]
}

export default function RegionalStatsChart({ data }: RegionalStatsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="state" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalImages" fill="#3b82f6" name="Total Images" />
        <Bar dataKey="damageReports" fill="#ef4444" name="Damage Reports" />
      </BarChart>
    </ResponsiveContainer>
  )
}

