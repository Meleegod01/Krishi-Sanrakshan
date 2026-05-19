// Crop Image Data Structure
export interface CropImage {
  id: string
  farmerId: string
  farmerName: string
  cropType: 'rice' | 'wheat' | 'cotton' | 'sugarcane' | 'maize' | 'pulses' | 'other'
  growthStage: 'sowing' | 'vegetative' | 'flowering' | 'maturity' | 'harvest'
  latitude: number
  longitude: number
  imageUrl: string
  thumbnailUrl: string
  capturedAt: string
  uploadedAt: string
  aiAnalysis: AIAnalysis
  location: {
    state: string
    district: string
    village: string
    pincode: string
  }
}

// AI Analysis Results
export interface AIAnalysis {
  cropHealth: 'healthy' | 'stressed' | 'damaged' | 'critical'
  confidenceScore: number
  detectedIssues: DamageType[]
  recommendations: string[]
  processedAt: string
}

// Damage Types
export type DamageType = 
  | 'lodging'
  | 'flood_inundation'
  | 'water_stress'
  | 'pest_infestation'
  | 'disease'
  | 'drought'
  | 'hail_damage'
  | 'wind_damage'
  | 'none'

// Alert/Damage Report
export interface DamageAlert {
  id: string
  cropImageId: string
  cropImage?: CropImage
  severity: 'low' | 'medium' | 'high' | 'critical'
  damageType: DamageType
  affectedArea: number // in hectares
  reportedBy: string
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
  claimAmount?: number
  createdAt: string
  updatedAt: string
}

// Dashboard Statistics
export interface DashboardStats {
  totalImages: number
  healthyImages: number
  damageAlerts: number
  pendingReviews: number
  totalFarmers: number
  coverageArea: number // in hectares
  recentActivity: ActivityLog[]
}

// Activity Log
export interface ActivityLog {
  id: string
  type: 'image_uploaded' | 'damage_detected' | 'claim_approved' | 'claim_rejected'
  message: string
  timestamp: string
  severity: 'info' | 'warning' | 'error' | 'success'
}

// Map Marker Data
export interface MapMarker {
  id: string
  position: [number, number] // [lat, lng]
  type: 'healthy' | 'stressed' | 'damaged' | 'critical'
  cropType: string
  popupContent: {
    farmerName: string
    capturedAt: string
    imageUrl: string
  }
}

// Filter Options
export interface ImageFilters {
  cropType?: string
  growthStage?: string
  healthStatus?: string
  dateFrom?: string
  dateTo?: string
  state?: string
  district?: string
}

// Analytics Data
export interface AnalyticsData {
  cropHealthTrend: {
    date: string
    healthy: number
    stressed: number
    damaged: number
    critical: number
  }[]
  damageDistribution: {
    type: string
    count: number
    percentage: number
  }[]
  regionalStats: {
    state: string
    totalImages: number
    damageReports: number
  }[]
  cropTypeDistribution: {
    crop: string
    count: number
  }[]
}

