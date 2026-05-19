'use client'

import { useEffect, useState } from 'react'
import CropicDashboardLayout from '@/components/layout/CropicDashboardLayout'
import AlertCard from '@/components/cards/AlertCard'
import { FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { cropicAPI } from '@/lib/api'
import { DamageAlert } from '@/lib/types'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<DamageAlert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<DamageAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  const loadData = async () => {
    try {
      const alertsData = await cropicAPI.getDamageAlerts()
      setAlerts(alertsData)
      setFilteredAlerts(alertsData)
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = [...alerts]

    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => alert.status === statusFilter)
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter)
    }

    // Sort by severity and date
    filtered.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
      if (severityDiff !== 0) return severityDiff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    setFilteredAlerts(filtered)
  }, [statusFilter, severityFilter, alerts])

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    pending: alerts.filter(a => a.status === 'pending').length,
    reviewing: alerts.filter(a => a.status === 'reviewing').length,
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Damage Type', 'Severity', 'Status', 'Affected Area (ha)', 'Claim Amount', 'Reported By', 'Date']
    const rows = filteredAlerts.map(alert => [
      alert.id,
      alert.damageType,
      alert.severity,
      alert.status,
      alert.affectedArea,
      alert.claimAmount || 'N/A',
      alert.reportedBy,
      new Date(alert.createdAt).toLocaleDateString(),
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cropic-alerts-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <CropicDashboardLayout title="Damage Alerts" currentPage="alerts">
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading alerts...</p>
          </div>
        </div>
      </CropicDashboardLayout>
    )
  }

  return (
    <CropicDashboardLayout title="Damage Alerts" currentPage="alerts">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Damage Alerts</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor and manage crop damage reports and insurance claims
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Alerts</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4">
            <p className="text-sm text-red-600">Critical</p>
            <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
          </div>
          <div className="bg-orange-50 rounded-lg shadow p-4">
            <p className="text-sm text-orange-600">High</p>
            <p className="text-2xl font-bold text-orange-900">{stats.high}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-blue-600">Reviewing</p>
            <p className="text-2xl font-bold text-blue-900">{stats.reviewing}</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredAlerts.length}</span> of{' '}
            <span className="font-semibold">{alerts.length}</span> alerts
          </p>
        </div>

        {/* Alerts List */}
        {filteredAlerts.length > 0 ? (
          <div className="space-y-4">
            {filteredAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onView={() => console.log('View alert:', alert.id)}
                onStatusUpdate={loadData}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">No alerts found matching your filters</p>
            <button
              onClick={() => {
                setStatusFilter('all')
                setSeverityFilter('all')
              }}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </CropicDashboardLayout>
  )
}

