// Mock data generator using actual crop images from Agricultural-crops dataset
import { CropImage, DamageAlert, DashboardStats, MapMarker, ActivityLog, AnalyticsData } from './types'
import { CROP_TYPES, getCropImages } from './cropImages'

// Indian states and districts with real coordinates for realistic locations
const INDIAN_LOCATIONS = [
  { state: 'Punjab', district: 'Ludhiana', village: 'Khanna', pincode: '141401', lat: 30.7046, lng: 76.2179 },
  { state: 'Haryana', district: 'Karnal', village: 'Gharaunda', pincode: '132114', lat: 29.5371, lng: 76.9715 },
  { state: 'Uttar Pradesh', district: 'Meerut', village: 'Mawana', pincode: '250401', lat: 29.1018, lng: 77.9167 },
  { state: 'Maharashtra', district: 'Nashik', village: 'Sinnar', pincode: '422103', lat: 19.8449, lng: 73.9981 },
  { state: 'Karnataka', district: 'Mysuru', village: 'Nanjangud', pincode: '571301', lat: 12.1176, lng: 76.6847 },
  { state: 'Tamil Nadu', district: 'Coimbatore', village: 'Pollachi', pincode: '642001', lat: 10.6581, lng: 77.0085 },
  { state: 'Andhra Pradesh', district: 'Guntur', village: 'Tenali', pincode: '522201', lat: 16.2428, lng: 80.6433 },
  { state: 'Telangana', district: 'Warangal', village: 'Hanamkonda', pincode: '506001', lat: 18.0087, lng: 79.5757 },
  { state: 'West Bengal', district: 'Hooghly', village: 'Chinsurah', pincode: '712101', lat: 22.9009, lng: 88.3968 },
  { state: 'Bihar', district: 'Patna', village: 'Danapur', pincode: '801503', lat: 25.6349, lng: 85.0471 },
  { state: 'Gujarat', district: 'Ahmedabad', village: 'Dholka', pincode: '382225', lat: 22.7248, lng: 72.4463 },
  { state: 'Rajasthan', district: 'Jaipur', village: 'Sanganer', pincode: '302029', lat: 26.8113, lng: 75.7989 },
  { state: 'Odisha', district: 'Cuttack', village: 'Banki', pincode: '754008', lat: 20.3793, lng: 85.5312 },
  { state: 'Kerala', district: 'Thrissur', village: 'Chalakudy', pincode: '680307', lat: 10.2989, lng: 76.3425 },
  
  // Central India - Madhya Pradesh (More locations)
  { state: 'Madhya Pradesh', district: 'Indore', village: 'Mhow', pincode: '453441', lat: 22.5511, lng: 75.7609 },
  { state: 'Madhya Pradesh', district: 'Bhopal', village: 'Berasia', pincode: '462101', lat: 23.2599, lng: 77.4126 },
  { state: 'Madhya Pradesh', district: 'Jabalpur', village: 'Sihora', pincode: '483225', lat: 23.1815, lng: 79.9864 },
  { state: 'Madhya Pradesh', district: 'Gwalior', village: 'Dabra', pincode: '475110', lat: 26.2183, lng: 78.1828 },
  { state: 'Madhya Pradesh', district: 'Ujjain', village: 'Nagda', pincode: '456331', lat: 23.4584, lng: 75.4176 },
  { state: 'Madhya Pradesh', district: 'Sagar', village: 'Rehli', pincode: '470227', lat: 23.6383, lng: 79.0632 },
  { state: 'Madhya Pradesh', district: 'Dewas', village: 'Bagli', pincode: '455227', lat: 23.0425, lng: 76.3382 },
  { state: 'Madhya Pradesh', district: 'Ratlam', village: 'Jaora', pincode: '457226', lat: 23.6383, lng: 75.1262 },
  
  // Central India - Chhattisgarh (Multiple locations)
  { state: 'Chhattisgarh', district: 'Raipur', village: 'Arang', pincode: '493441', lat: 21.1966, lng: 81.7099 },
  { state: 'Chhattisgarh', district: 'Durg', village: 'Bhilai', pincode: '490001', lat: 21.2094, lng: 81.3892 },
  { state: 'Chhattisgarh', district: 'Bilaspur', village: 'Kota', pincode: '495452', lat: 22.0797, lng: 82.1409 },
  { state: 'Chhattisgarh', district: 'Rajnandgaon', village: 'Dongargaon', pincode: '491441', lat: 21.0893, lng: 80.9512 },
  { state: 'Chhattisgarh', district: 'Korba', village: 'Katghora', pincode: '495445', lat: 22.5021, lng: 82.5414 },
  { state: 'Chhattisgarh', district: 'Raigarh', village: 'Sarangarh', pincode: '496445', lat: 21.5884, lng: 83.0733 },
  { state: 'Chhattisgarh', district: 'Dhamtari', village: 'Kurud', pincode: '493663', lat: 20.8303, lng: 81.6814 },
]

const FARMER_NAMES = [
  'Ramesh Kumar', 'Suresh Patel', 'Vijay Singh', 'Rajesh Sharma', 'Mohan Reddy',
  'Krishna Rao', 'Anil Kumar', 'Prakash Joshi', 'Mahesh Yadav', 'Dinesh Verma',
  'Ravi Desai', 'Santosh Naik', 'Ganesh Patil', 'Vikram Choudhary', 'Amit Pandey',
]

const GROWTH_STAGES = ['sowing', 'vegetative', 'flowering', 'maturity', 'harvest'] as const
const HEALTH_STATUS = ['healthy', 'stressed', 'damaged', 'critical'] as const
const DAMAGE_TYPES = [
  'lodging', 'flood_inundation', 'water_stress', 'pest_infestation', 
  'disease', 'drought', 'hail_damage', 'wind_damage', 'none'
] as const

// Generate random date within last 30 days
function randomDate(daysBack: number = 30): string {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack))
  return date.toISOString()
}

// Generate coordinates near actual Indian agricultural regions
function randomIndianCoordinates(): [number, number] {
  // Pick a random base location from actual Indian cities/regions
  const baseLocation = INDIAN_LOCATIONS[Math.floor(Math.random() * INDIAN_LOCATIONS.length)]
  
  // Add small random offset (within ~50km radius) to create variation
  const latOffset = (Math.random() - 0.5) * 0.5  // ~50km variation
  const lngOffset = (Math.random() - 0.5) * 0.5  // ~50km variation
  
  return [
    baseLocation.lat + latOffset,
    baseLocation.lng + lngOffset
  ]
}

// Generate mock crop images using actual dataset images
export function generateMockCropImages(count: number = 60): CropImage[] {
  const images: CropImage[] = []
  
  // Use 2 images per crop type
  CROP_TYPES.forEach((cropType, cropIndex) => {
    const cropImages = getCropImages(cropType)
    
    // Generate 2 mock entries for each crop
    for (let i = 0; i < 2 && i < cropImages.length; i++) {
      const location = INDIAN_LOCATIONS[Math.floor(Math.random() * INDIAN_LOCATIONS.length)]
      const [lat, lng] = randomIndianCoordinates()
      const capturedAt = randomDate(30)
      const healthStatus = HEALTH_STATUS[Math.floor(Math.random() * HEALTH_STATUS.length)]
      
      // Determine issues based on health status
      let detectedIssues: any[] = ['none']
      if (healthStatus === 'stressed') {
        detectedIssues = [DAMAGE_TYPES[Math.floor(Math.random() * 4) + 2]] // water_stress, pest, disease, drought
      } else if (healthStatus === 'damaged') {
        detectedIssues = [DAMAGE_TYPES[Math.floor(Math.random() * 3)]] // lodging, flood, water_stress
      } else if (healthStatus === 'critical') {
        detectedIssues = [
          DAMAGE_TYPES[Math.floor(Math.random() * 4)],
          DAMAGE_TYPES[Math.floor(Math.random() * 4) + 2]
        ]
      }
      
      const image: CropImage = {
        id: `crop-${cropIndex * 2 + i + 1}`,
        farmerId: `farmer-${Math.floor(Math.random() * 100)}`,
        farmerName: FARMER_NAMES[Math.floor(Math.random() * FARMER_NAMES.length)],
        cropType: cropType as any,
        growthStage: GROWTH_STAGES[Math.floor(Math.random() * GROWTH_STAGES.length)],
        latitude: lat,
        longitude: lng,
        imageUrl: cropImages[i],
        thumbnailUrl: cropImages[i],
        capturedAt,
        uploadedAt: capturedAt,
        aiAnalysis: {
          cropHealth: healthStatus,
          confidenceScore: 0.75 + Math.random() * 0.24, // 75-99%
          detectedIssues,
          recommendations: healthStatus === 'healthy' 
            ? ['Continue current practices', 'Monitor regularly']
            : ['Immediate inspection recommended', 'Consider pest control measures'],
          processedAt: capturedAt,
        },
        location,
      }
      
      images.push(image)
    }
  })
  
  return images.slice(0, count)
}

// Generate damage alerts from crop images
export function generateMockAlerts(cropImages: CropImage[]): DamageAlert[] {
  return cropImages
    .filter(img => img.aiAnalysis.cropHealth !== 'healthy')
    .map((img, idx) => ({
      id: `alert-${idx + 1}`,
      cropImageId: img.id,
      cropImage: img,
      severity: img.aiAnalysis.cropHealth === 'critical' ? 'critical' :
                img.aiAnalysis.cropHealth === 'damaged' ? 'high' :
                img.aiAnalysis.cropHealth === 'stressed' ? 'medium' : 'low',
      damageType: img.aiAnalysis.detectedIssues[0],
      affectedArea: 0.5 + Math.random() * 4.5, // 0.5 to 5 hectares
      reportedBy: img.farmerName,
      status: ['pending', 'reviewing', 'approved', 'rejected'][Math.floor(Math.random() * 4)] as any,
      claimAmount: Math.floor(Math.random() * 100000) + 20000,
      createdAt: img.capturedAt,
      updatedAt: img.capturedAt,
    }))
}

// Generate map markers from crop images
export function generateMapMarkers(cropImages: CropImage[]): MapMarker[] {
  return cropImages.map(img => ({
    id: img.id,
    position: [img.latitude, img.longitude],
    type: img.aiAnalysis.cropHealth,
    cropType: img.cropType,
    popupContent: {
      farmerName: img.farmerName,
      capturedAt: img.capturedAt,
      imageUrl: img.imageUrl,
    },
  }))
}

// Generate dashboard statistics
export function generateDashboardStats(cropImages: CropImage[]): DashboardStats {
  const healthyImages = cropImages.filter(img => img.aiAnalysis.cropHealth === 'healthy').length
  const damageAlerts = cropImages.filter(img => img.aiAnalysis.cropHealth !== 'healthy').length
  const pendingReviews = Math.floor(damageAlerts * 0.6)
  
  const recentActivity: ActivityLog[] = cropImages.slice(0, 10).map((img, idx) => ({
    id: `activity-${idx}`,
    type: img.aiAnalysis.cropHealth === 'healthy' ? 'image_uploaded' : 'damage_detected',
    message: `${img.farmerName} uploaded ${img.cropType} image from ${img.location.district}`,
    timestamp: img.capturedAt,
    severity: img.aiAnalysis.cropHealth === 'healthy' ? 'success' : 
              img.aiAnalysis.cropHealth === 'stressed' ? 'warning' : 'error',
  }))
  
  return {
    totalImages: cropImages.length,
    healthyImages,
    damageAlerts,
    pendingReviews,
    totalFarmers: new Set(cropImages.map(img => img.farmerId)).size,
    coverageArea: cropImages.length * 2.5, // Assume 2.5 hectares per image
    recentActivity,
  }
}

// Generate analytics data
export function generateAnalyticsData(cropImages: CropImage[]): AnalyticsData {
  // Crop health trend over last 30 days
  const cropHealthTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split('T')[0],
      healthy: Math.floor(Math.random() * 20) + 10,
      stressed: Math.floor(Math.random() * 10) + 2,
      damaged: Math.floor(Math.random() * 5) + 1,
      critical: Math.floor(Math.random() * 3),
    }
  })
  
  // Damage distribution
  const damageMap = new Map<string, number>()
  cropImages.forEach(img => {
    img.aiAnalysis.detectedIssues.forEach(issue => {
      if (issue !== 'none') {
        damageMap.set(issue, (damageMap.get(issue) || 0) + 1)
      }
    })
  })
  
  const totalDamage = Array.from(damageMap.values()).reduce((a, b) => a + b, 0)
  const damageDistribution = Array.from(damageMap.entries()).map(([type, count]) => ({
    type: type.replace(/_/g, ' '),
    count,
    percentage: (count / totalDamage) * 100,
  }))
  
  // Regional stats
  const regionMap = new Map<string, { total: number; damaged: number }>()
  cropImages.forEach(img => {
    const state = img.location.state
    const current = regionMap.get(state) || { total: 0, damaged: 0 }
    regionMap.set(state, {
      total: current.total + 1,
      damaged: current.damaged + (img.aiAnalysis.cropHealth !== 'healthy' ? 1 : 0),
    })
  })
  
  const regionalStats = Array.from(regionMap.entries()).map(([state, data]) => ({
    state,
    totalImages: data.total,
    damageReports: data.damaged,
  }))
  
  // Crop type distribution
  const cropTypeMap = new Map<string, number>()
  cropImages.forEach(img => {
    cropTypeMap.set(img.cropType, (cropTypeMap.get(img.cropType) || 0) + 1)
  })
  
  const cropTypeDistribution = Array.from(cropTypeMap.entries()).map(([crop, count]) => ({
    crop,
    count,
  }))
  
  return {
    cropHealthTrend,
    damageDistribution,
    regionalStats,
    cropTypeDistribution,
  }
}

