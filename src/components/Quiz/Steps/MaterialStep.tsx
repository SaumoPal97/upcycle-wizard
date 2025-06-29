import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MaterialStepProps {
  materials: string[]
  onUpdate: (materials: string[]) => void
}

const materialOptions = [
  { id: 'wood', label: 'Wood', emoji: '🪵' },
  { id: 'fabric', label: 'Fabric', emoji: '🧵' },
  { id: 'metal', label: 'Metal', emoji: '🪙' },
  { id: 'glass', label: 'Glass', emoji: '🧊' },
  { id: 'particleboard', label: 'Particleboard', emoji: '🧱' },
  { id: 'mixed', label: 'Mixed Materials', emoji: '🧩' },
]

export function MaterialStep({ materials, onUpdate }: MaterialStepProps) {
  const toggleMaterial = (materialId: string) => {
    const newMaterials = materials.includes(materialId)
      ? materials.filter(m => m !== materialId)
      : [...materials, materialId]
    onUpdate(newMaterials)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          What materials is your furniture made of?
        </h2>
        <p className="text-lg text-gray-600">
          Select all that apply - this helps us suggest the right techniques
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {materialOptions.map((material) => (
          <Card
            key={material.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              materials.includes(material.id)
                ? 'ring-2 ring-emerald-500 bg-emerald-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => toggleMaterial(material.id)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">{material.emoji}</div>
              <div className="font-medium text-gray-900">{material.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {materials.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Selected materials:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {materials.map((material) => {
              const materialOption = materialOptions.find(m => m.id === material)
              return (
                <Badge key={material} variant="secondary">
                  {materialOption?.emoji} {materialOption?.label}
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {materials.length === 0 && (
        <div className="text-center text-red-600 text-sm">
          Please select at least one material to continue
        </div>
      )}
    </div>
  )
}