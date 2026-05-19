'use client'

import { useEffect, useState } from 'react'
import CropicDashboardLayout from '@/components/layout/CropicDashboardLayout'
import StatsCard from '@/components/cards/StatsCard'
import dynamic from 'next/dynamic'
const CropMap = dynamic(() => import('@/components/maps/CropMap'), { ssr: false })
import MapLegend from '@/components/maps/MapLegend'
import AlertCard from '@/components/cards/AlertCard'
import { 
  PhotoIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  UserGroupIcon,
  MapIcon
} from '@heroicons/react/24/outline'
import { cropicAPI } from '@/lib/api'
import { DashboardStats, MapMarker, DamageAlert } from '@/lib/types'
import { format } from 'date-fns'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [recentAlerts, setRecentAlerts] = useState<DamageAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, markersData, alertsData] = await Promise.all([
          cropicAPI.getDashboardStats(),
          cropicAPI.getMapMarkers(),
          cropicAPI.getDamageAlerts(),
        ])
        
        setStats(statsData)
        setMarkers(markersData)
        setRecentAlerts(alertsData.slice(0, 5))
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) {
    return (
      <CropicDashboardLayout title="Dashboard" currentPage="dashboard">
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </CropicDashboardLayout>
    )
  }

  return (
    <CropicDashboardLayout title="Dashboard" currentPage="dashboard">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Krishi Sanrakshan Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            कृषि संरक्षण - Real-time crop monitoring and analytics for PMFBY
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
          <StatsCard
            title="Total Images"
            value={stats?.totalImages || 0}
            icon={PhotoIcon}
            color="blue"
            trend={{ value: 12, direction: 'up' }}
          />
          <StatsCard
            title="Healthy Crops"
            value={stats?.healthyImages || 0}
            icon={CheckCircleIcon}
            color="green"
            trend={{ value: 8, direction: 'up' }}
          />
          <StatsCard
            title="Damage Alerts"
            value={stats?.damageAlerts || 0}
            icon={ExclamationTriangleIcon}
            color="red"
            trend={{ value: 5, direction: 'down' }}
          />
          <StatsCard
            title="Pending Reviews"
            value={stats?.pendingReviews || 0}
            icon={ClockIcon}
            color="yellow"
          />
          <StatsCard
            title="Total Farmers"
            value={stats?.totalFarmers || 0}
            icon={UserGroupIcon}
            color="purple"
            trend={{ value: 15, direction: 'up' }}
          />
          <StatsCard
            title="Coverage Area"
            value={`${Math.round(stats?.coverageArea || 0)} ha`}
            icon={MapIcon}
            color="blue"
          />
        </div>

        {/* Map and Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Crop Locations Map
              </h2>
              <CropMap markers={markers} height="500px" />
            </div>
          </div>

          {/* Map Legend and Quick Stats */}
          <div className="space-y-6">
            <MapLegend />
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Health Distribution</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Healthy</span>
                  <span className="text-sm font-semibold text-green-600">
                    {Math.round((stats?.healthyImages || 0) / (stats?.totalImages || 1) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">At Risk</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {Math.round((stats?.damageAlerts || 0) / (stats?.totalImages || 1) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Damage Alerts */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Damage Alerts</h2>
              <a href="/alerts" className="text-sm text-green-600 hover:text-green-700 font-medium">
                View all →
              </a>
            </div>
            <div className="space-y-3">
              {recentAlerts.length > 0 ? (
                recentAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent alerts</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {stats?.recentActivity.slice(0, 5).map((activity, idx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {idx !== Math.min(4, (stats?.recentActivity.length || 1) - 1) && (
                        <span
                          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.severity === 'success' ? 'bg-green-500' :
                            activity.severity === 'warning' ? 'bg-yellow-500' :
                            activity.severity === 'error' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}>
                            {activity.type === 'image_uploaded' && <PhotoIcon className="h-4 w-4 text-white" />}
                            {activity.type === 'damage_detected' && <ExclamationTriangleIcon className="h-4 w-4 text-white" />}
                            {activity.type === 'claim_approved' && <CheckCircleIcon className="h-4 w-4 text-white" />}
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-900">{activity.message}</p>
                          </div>
                          <div className="whitespace-nowrap text-right text-xs text-gray-500">
                            {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </CropicDashboardLayout>
  )
}

