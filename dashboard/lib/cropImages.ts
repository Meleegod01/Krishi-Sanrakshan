// Crop image paths configuration
// This maps crop types to their local images from the Agricultural-crops dataset

export const CROP_TYPES = [
  'almond',
  'banana',
  'cardamom',
  'cherry',

  'coffee-plant',
  'cotton',
  'cucumber',
  'fox-nut',
  'gram',
  'jowar',
  'jute',
  'lemon',
  'maize',
  'mustard-oil',
  'papaya',
  'pearl-millet',
  'pineapple',
  'rice',
  'soyabean',
  'sugarcane',
  'sunflower',
  'tea',
  'tobacco-plant',
  'tomato',
  'mung',
  'wheat',
] as const

export type CropType = typeof CROP_TYPES[number]

// Mapping of standardized crop names to folder names
export const CROP_FOLDER_MAP: Record<string, string> = {
  'almond': 'almond',
  'banana': 'banana',
  'cardamom': 'cardamom',
  'chilli': 'chilli',
  'clove': 'clove',
  'coconut': 'coconut',
  'coffee-plant': 'Coffee-plant',
  'cotton': 'cotton',
  'cucumber': 'Cucumber',
  'fox-nut': 'Fox_nut(Makhana)',
  'gram': 'gram',
  'jowar': 'jowar',
  'jute': 'jute',
  'lemon': 'Lemon',
  'maize': 'maize',
  'mustard-oil': 'mustard-oil',
  'olive-tree': 'Olive-tree',
  'papaya': 'papaya',
  'pearl-millet': 'Pearl_millet(bajra)',
  'pineapple': 'pineapple',
  'rice': 'rice',
  'soyabean': 'soyabean',
  'sugarcane': 'sugarcane',
  'sunflower': 'sunflower',
  'tea': 'tea',
  'tobacco-plant': 'Tobacco-plant',
  'tomato': 'tomato',
  'mung': 'mung',
  'wheat': 'wheat',
}

// Get image paths for a specific crop (using best quality images from 4-10)
export function getCropImages(cropType: string): string[] {
  const folderName = CROP_FOLDER_MAP[cropType.toLowerCase()]
  if (!folderName) return []

  // Use images 4-10 as they are the best quality
  // Select 2 different images per crop type (deterministic based on crop name)
  const imageNumbers = [4, 5, 6, 7, 8, 9, 10,11]
  
  // Use crop type hash to pick consistent images for each crop
  const hash = cropType.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const index1 = hash % imageNumbers.length
  const index2 = (hash * 2 + 3) % imageNumbers.length
  
  // Ensure we get 2 different images
  const num1 = imageNumbers[index1]
  const num2 = imageNumbers[index2 !== index1 ? index2 : (index2 + 1) % imageNumbers.length]
  
  return [
    `/Agricultural-crops/${folderName}/image (${num1}).jpg`,
    `/Agricultural-crops/${folderName}/image (${num2}).jpg`,
  ]
}

// Get all crop images for dashboard display (2 per crop type)
export function getAllCropSamples(): Record<string, string[]> {
  const samples: Record<string, string[]> = {}
  
  CROP_TYPES.forEach(crop => {
    samples[crop] = getCropImages(crop)
  })
  
  return samples
}

