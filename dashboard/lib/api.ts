// API client for Krishi Sanrakshan FastAPI backend
import { 
  CropImage, 
  DamageAlert, 
  DashboardStats, 
  MapMarker,
  AnalyticsData,
  ImageFilters,
  AIAnalysis,
  DamageType
} from './types'

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'

// Helper to map backend report to frontend CropImage
function mapReportToCropImage(report: any): CropImage {
  const analysis = report.aggregated_analysis || {}
  const ml = analysis.ml_analysis || {}
  const assessment = report.final_assessment || {}

  return {
    id: report.submission_id.toString(),
    farmerId: report.user_id.toString(),
    farmerName: `Farmer ${report.user_id}`, // Placeholder
    cropType: (ml.crop || 'other').toLowerCase() as any,
    growthStage: (report.growth_stage || 'vegetative').toLowerCase() as any,
    latitude: report.latitude,
    longitude: report.longitude,
    imageUrl: `http://localhost:3000/${ml.file_path || ''}`, // Assuming ingestion API serves files
    thumbnailUrl: `http://localhost:3000/${ml.file_path || ''}`,
    capturedAt: report.created_at,
    uploadedAt: report.created_at,
    aiAnalysis: {
      cropHealth: assessment.overall_health_score > 0.8 ? 'healthy' : 
                   assessment.overall_health_score > 0.6 ? 'stressed' :
                   assessment.overall_health_score > 0.4 ? 'damaged' : 'critical',
      confidenceScore: ml.confidence || 0,
      detectedIssues: [ml.disease as DamageType || 'none'],
      recommendations: assessment.recommendations || [],
      processedAt: report.created_at
    },
    location: {
      state: 'Maharashtra', // Default for demo
      district: 'Pune',
      village: 'Khed',
      pincode: '410501'
    }
  }
}

// API client class
class KrishiSanrakshanAPI {
  // Dashboard APIs
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const reports = await this.getCropImages()
      const alerts = await this.getDamageAlerts()
      
      return {
        totalImages: reports.length,
        healthyImages: reports.filter(img => img.aiAnalysis.cropHealth === 'healthy').length,
        damageAlerts: alerts.length,
        pendingReviews: alerts.filter(a => a.status === 'pending').length,
        totalFarmers: new Set(reports.map(img => img.farmerId)).size,
        coverageArea: reports.length * 2.5, // Mock calculation
        recentActivity: [
          {
            id: '1',
            type: 'image_uploaded',
            message: 'New crop image submitted from Pune region',
            timestamp: new Date().toISOString(),
            severity: 'info'
          }
        ]
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Crop Images APIs
  async getCropImages(filters?: ImageFilters): Promise<CropImage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`)
      if (!response.ok) throw new Error('Failed to fetch reports')
      const reports = await response.json()
      let images = reports.map(mapReportToCropImage)
      
      if (filters) {
        if (filters.cropType) images = images.filter((img: CropImage) => img.cropType === filters.cropType)
        if (filters.growthStage) images = images.filter((img: CropImage) => img.growthStage === filters.growthStage)
        if (filters.healthStatus) images = images.filter((img: CropImage) => img.aiAnalysis.cropHealth === filters.healthStatus)
      }
      
      return images
    } catch (error) {
      console.error('Error fetching crop images:', error);
      return [];
    }
  }

  async getCropImageById(id: string): Promise<CropImage | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${id}`)
      if (!response.ok) return null
      const report = await response.json()
      return mapReportToCropImage(report)
    } catch (error) {
      return null
    }
  }

  // Damage Alerts APIs
  async getDamageAlerts(status?: string): Promise<DamageAlert[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts`)
      if (!response.ok) throw new Error('Failed to fetch alerts')
      const alertsData = await response.json()
      
      return alertsData.map((alert: any) => ({
        id: alert.id.toString(),
        cropImageId: alert.submission_id.toString(),
        severity: alert.alert_level.toLowerCase() as any,
        damageType: 'disease', // Default mapping
        affectedArea: 1.2,
        reportedBy: 'AI System',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  async getAlertById(id: string): Promise<DamageAlert | null> {
    const alerts = await this.getDamageAlerts()
    return alerts.find(a => a.id === id) || null
  }

  async updateAlertStatus(id: string, status: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      return response.ok
    } catch (error) {
      console.error('Error updating alert status:', error);
      return false;
    }
  }

  // Map APIs
  async getMapMarkers(filters?: ImageFilters): Promise<MapMarker[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/map`)
      if (!response.ok) throw new Error('Failed to fetch map data')
      const mapData = await response.json()
      
      return mapData.map((item: any) => ({
        id: item.submission_id.toString(),
        position: [item.latitude, item.longitude],
        type: item.overall_health_score > 0.8 ? 'healthy' : 
              item.overall_health_score > 0.6 ? 'stressed' :
              item.overall_health_score > 0.4 ? 'damaged' : 'critical',
        cropType: 'Crop',
        popupContent: {
          farmerName: `User ${item.submission_id}`,
          capturedAt: new Date().toISOString(),
          imageUrl: ''
        }
      }))
    } catch (error) {
      console.error('Error fetching map markers:', error);
      return [];
    }
  }

  // Analytics APIs
  async getAnalyticsData(): Promise<AnalyticsData> {
    const images = await this.getCropImages()
    const healthTrend = [
      { date: '2025-10-01', healthy: 10, stressed: 2, damaged: 1, critical: 0 },
      { date: '2025-10-15', healthy: 15, stressed: 5, damaged: 2, critical: 1 },
      { date: '2025-11-01', healthy: 20, stressed: 8, damaged: 4, critical: 2 },
    ]

    return {
      cropHealthTrend: healthTrend,
      damageDistribution: [
        { type: 'Pest', count: 5, percentage: 50 },
        { type: 'Disease', count: 3, percentage: 30 },
        { type: 'Flood', count: 2, percentage: 20 },
      ],
      regionalStats: [
        { state: 'Maharashtra', totalImages: images.length, damageReports: 5 },
      ],
      cropTypeDistribution: [
        { crop: 'Rice', count: 10 },
        { crop: 'Wheat', count: 8 },
      ]
    }
  }

  async getFilterOptions() {
    return {
      states: ['Maharashtra', 'Punjab', 'Haryana'],
      districts: ['Pune', 'Amritsar', 'Karnal'],
      cropTypes: ['rice', 'wheat', 'cotton', 'sugarcane', 'maize'],
      growthStages: ['sowing', 'vegetative', 'flowering', 'maturity', 'harvest'],
      healthStatuses: ['healthy', 'stressed', 'damaged', 'critical'],
    }
  }
}

export const cropicAPI = new KrishiSanrakshanAPI()
export const krishiSanrakshanAPI = cropicAPI


