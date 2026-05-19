export default function MapLegend() {
  const legendItems = [
    { label: 'Healthy', color: 'bg-green-500', count: 0 },
    { label: 'Stressed', color: 'bg-yellow-500', count: 0 },
    { label: 'Damaged', color: 'bg-orange-500', count: 0 },
    { label: 'Critical', color: 'bg-red-500', count: 0 },
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Map Legend</h3>
      <div className="space-y-2">
        {legendItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${item.color} border-2 border-white shadow`} />
            <span className="text-sm text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

