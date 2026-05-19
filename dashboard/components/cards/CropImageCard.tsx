import { useState } from 'react'
import { MapPinIcon, CalendarIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { CropImage } from '@/lib/types'
import { format } from 'date-fns'

interface CropImageCardProps {
  image: CropImage
  onClick?: () => void
}

const healthColors = {
  healthy: 'bg-green-100 text-green-800 border-green-200',
  stressed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  damaged: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
}

const healthIcons = {
  healthy: CheckCircleIcon,
  stressed: ExclamationCircleIcon,
  damaged: ExclamationCircleIcon,
  critical: ExclamationCircleIcon,
}

export default function CropImageCard({ image, onClick }: CropImageCardProps) {
  const HealthIcon = healthIcons[image.aiAnalysis.cropHealth]
  const [imageError, setImageError] = useState(false)
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden card-hover cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-48 w-full bg-gray-200">
        {!imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.thumbnailUrl || image.imageUrl}
            alt={`${image.cropType} crop`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-100 to-green-200">
            <div className="text-center p-4">
              <svg className="mx-auto h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-green-800 mt-2 font-medium capitalize">{image.cropType}</p>
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${healthColors[image.aiAnalysis.cropHealth]}`}>
            <HealthIcon className="h-3 w-3" />
            {image.aiAnalysis.cropHealth}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {image.cropType}
            </h3>
            <p className="text-sm text-gray-600">{image.farmerName}</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {image.growthStage}
          </span>
        </div>

        <div className="space-y-2 mt-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{image.location.district}, {image.location.state}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{format(new Date(image.capturedAt), 'MMM dd, yyyy HH:mm')}</span>
          </div>
        </div>

        {image.aiAnalysis.detectedIssues.length > 0 && image.aiAnalysis.detectedIssues[0] !== 'none' && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-1">Detected Issues:</p>
            <div className="flex flex-wrap gap-1">
              {image.aiAnalysis.detectedIssues.map((issue, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700"
                >
                  {issue.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Confidence: {(image.aiAnalysis.confidenceScore * 100).toFixed(1)}%</span>
            <span>ID: {image.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

