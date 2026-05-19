'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface CropTypeDistributionChartProps {
  data: {
    crop: string
    count: number
  }[]
}

export default function CropTypeDistributionChart({ data }: CropTypeDistributionChartProps) {
  // Sort by count and take top 15
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 15)

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={sortedData} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis dataKey="crop" type="category" width={100} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#22c55e" name="Number of Images" />
      </BarChart>
    </ResponsiveContainer>
  )
}

