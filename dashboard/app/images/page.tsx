'use client'

import { useEffect, useState } from 'react'
import CropicDashboardLayout from '@/components/layout/CropicDashboardLayout'
import CropImageCard from '@/components/cards/CropImageCard'
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { cropicAPI } from '@/lib/api'
import { CropImage, ImageFilters } from '@/lib/types'

export default function CropImagesPage() {
  const [images, setImages] = useState<CropImage[]>([])
  const [filteredImages, setFilteredImages] = useState<CropImage[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [filters, setFilters] = useState<ImageFilters>({
    cropType: '',
    growthStage: '',
    healthStatus: '',
    state: '',
  })

  const [filterOptions, setFilterOptions] = useState({
    cropTypes: [] as string[],
    growthStages: [] as string[],
    healthStatuses: [] as string[],
    states: [] as string[],
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [imagesData, options] = await Promise.all([
          cropicAPI.getCropImages(),
          cropicAPI.getFilterOptions(),
        ])
        
        setImages(imagesData)
        setFilteredImages(imagesData)
        setFilterOptions(options)
      } catch (error) {
        console.error('Error loading images:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  useEffect(() => {
    let filtered = [...images]

    // Apply filters
    if (filters.cropType) {
      filtered = filtered.filter(img => img.cropType === filters.cropType)
    }
    if (filters.growthStage) {
      filtered = filtered.filter(img => img.growthStage === filters.growthStage)
    }
    if (filters.healthStatus) {
      filtered = filtered.filter(img => img.aiAnalysis.cropHealth === filters.healthStatus)
    }
    if (filters.state) {
      filtered = filtered.filter(img => img.location.state === filters.state)
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(img => 
        img.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.location.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.location.state.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredImages(filtered)
  }, [filters, searchTerm, images])

  const handleFilterChange = (key: keyof ImageFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      cropType: '',
      growthStage: '',
      healthStatus: '',
      state: '',
    })
    setSearchTerm('')
  }

  const hasActiveFilters = Object.values(filters).some(v => v) || searchTerm

  if (loading) {
    return (
      <CropicDashboardLayout title="Crop Images" currentPage="images">
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading crop images...</p>
          </div>
        </div>
      </CropicDashboardLayout>
    )
  }

  return (
    <CropicDashboardLayout title="Crop Images" currentPage="images">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Crop Images Gallery</h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse and analyze crop images submitted by farmers
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Search by farmer, crop, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters {hasActiveFilters && `(${Object.values(filters).filter(v => v).length + (searchTerm ? 1 : 0)})`}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Crop Type
                  </label>
                  <select
                    value={filters.cropType}
                    onChange={(e) => handleFilterChange('cropType', e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Crops</option>
                    {filterOptions.cropTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Growth Stage
                  </label>
                  <select
                    value={filters.growthStage}
                    onChange={(e) => handleFilterChange('growthStage', e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Stages</option>
                    {filterOptions.growthStages.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Health Status
                  </label>
                  <select
                    value={filters.healthStatus}
                    onChange={(e) => handleFilterChange('healthStatus', e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Status</option>
                    {filterOptions.healthStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  >
                    <option value="">All States</option>
                    {filterOptions.states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredImages.length}</span> of{' '}
            <span className="font-semibold">{images.length}</span> images
          </p>
        </div>

        {/* Images Grid */}
        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map(image => (
              <CropImageCard
                key={image.id}
                image={image}
                onClick={() => console.log('View details:', image.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">No images found matching your filters</p>
            <button
              onClick={clearFilters}
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

