'use client'

import { useEffect, useState } from 'react'
import CropicDashboardLayout from '@/components/layout/CropicDashboardLayout'
import CropHealthChart from '@/components/charts/CropHealthChart'
import DamageDistributionChart from '@/components/charts/DamageDistributionChart'
import RegionalStatsChart from '@/components/charts/RegionalStatsChart'
import CropTypeDistributionChart from '@/components/charts/CropTypeDistributionChart'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { cropicAPI } from '@/lib/api'
import { AnalyticsData } from '@/lib/types'

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await cropicAPI.getAnalyticsData()
        setAnalyticsData(data)
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const exportReport = () => {
    // Create a comprehensive report
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalCrops: analyticsData?.cropTypeDistribution.reduce((sum, c) => sum + c.count, 0),
        totalRegions: analyticsData?.regionalStats.length,
        totalDamageTypes: analyticsData?.damageDistribution.length,
      },
      cropHealthTrend: analyticsData?.cropHealthTrend,
      damageDistribution: analyticsData?.damageDistribution,
      regionalStats: analyticsData?.regionalStats,
      cropTypeDistribution: analyticsData?.cropTypeDistribution,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cropic-analytics-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  if (loading) {
    return (
      <CropicDashboardLayout title="Analytics" currentPage="analytics">
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </CropicDashboardLayout>
    )
  }

  if (!analyticsData) {
    return (
      <CropicDashboardLayout title="Analytics" currentPage="analytics">
        <div className="p-8">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </CropicDashboardLayout>
    )
  }

  return (
    <CropicDashboardLayout title="Analytics" currentPage="analytics">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Comprehensive insights and trends analysis
            </p>
          </div>
          <button
            onClick={exportReport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <p className="text-sm opacity-90">Total Crop Images</p>
            <p className="text-3xl font-bold mt-2">
              {analyticsData.cropTypeDistribution.reduce((sum, c) => sum + c.count, 0)}
            </p>
            <p className="text-xs mt-2 opacity-75">Across all regions</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <p className="text-sm opacity-90">Crop Types</p>
            <p className="text-3xl font-bold mt-2">
              {analyticsData.cropTypeDistribution.length}
            </p>
            <p className="text-xs mt-2 opacity-75">Different varieties monitored</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <p className="text-sm opacity-90">Damage Types</p>
            <p className="text-3xl font-bold mt-2">
              {analyticsData.damageDistribution.length}
            </p>
            <p className="text-xs mt-2 opacity-75">Issues detected</p>
          </div>
        </div>

        {/* Crop Health Trend */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Crop Health Trend (Last 30 Days)
          </h2>
          <CropHealthChart data={analyticsData.cropHealthTrend} />
        </div>

        {/* Two Column Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Damage Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Damage Type Distribution
            </h2>
            {analyticsData.damageDistribution.length > 0 ? (
              <DamageDistributionChart data={analyticsData.damageDistribution} />
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">No damage data available</p>
            )}
          </div>

          {/* Damage Summary Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Damage Statistics
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.damageDistribution.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                        {item.type}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {item.count}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {item.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Regional Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Regional Statistics
          </h2>
          <RegionalStatsChart data={analyticsData.regionalStats} />
        </div>

        {/* Crop Type Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Crop Type Distribution (Top 15)
          </h2>
          <CropTypeDistributionChart data={analyticsData.cropTypeDistribution} />
        </div>

        {/* Regional Table */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            State-wise Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Images
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Damage Reports
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Damage Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.regionalStats.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.state}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {item.totalImages}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {item.damageReports}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (item.damageReports / item.totalImages) > 0.5
                          ? 'bg-red-100 text-red-800'
                          : (item.damageReports / item.totalImages) > 0.25
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {((item.damageReports / item.totalImages) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CropicDashboardLayout>
  )
}

