'use client'

import { useEffect, useState } from 'react'
import CropicDashboardLayout from '@/components/layout/CropicDashboardLayout'
import dynamic from 'next/dynamic'
const CropMap = dynamic(() => import('@/components/maps/CropMap'), { ssr: false })
import { cropicAPI } from '@/lib/api'
import { MapMarker } from '@/lib/types'

export default function RegionsPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedState, setSelectedState] = useState<string>('all')
  const [filterOptions, setFilterOptions] = useState<{ states: string[] }>({ states: [] })

  useEffect(() => {
    async function loadData() {
      try {
        const [markersData, options] = await Promise.all([
          cropicAPI.getMapMarkers(),
          cropicAPI.getFilterOptions(),
        ])
        
        setMarkers(markersData)
        setFilterOptions(options)
      } catch (error) {
        console.error('Error loading regions data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const filteredMarkers = selectedState === 'all' 
    ? markers 
    : markers.filter(m => {
        // This would need the full crop image data, for now we'll show all
        return true
      })

  if (loading) {
    return (
      <CropicDashboardLayout title="Regions" currentPage="regions">
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading regions...</p>
          </div>
        </div>
      </CropicDashboardLayout>
    )
  }

  return (
    <CropicDashboardLayout title="Regions" currentPage="regions">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Regional Overview</h1>
          <p className="mt-1 text-sm text-gray-600">
            Geographic distribution of crop monitoring
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="all">All States</option>
                {filterOptions.states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Crop Locations Map
          </h2>
          <CropMap markers={filteredMarkers} height="700px" />
          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredMarkers.length}</span> locations
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Locations</h3>
            <p className="text-3xl font-bold text-gray-900">{markers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">States Covered</h3>
            <p className="text-3xl font-bold text-gray-900">{filterOptions.states.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Healthy Crops</h3>
            <p className="text-3xl font-bold text-green-600">
              {markers.filter(m => m.type === 'healthy').length}
            </p>
          </div>
        </div>
      </div>
    </CropicDashboardLayout>
  )
}

