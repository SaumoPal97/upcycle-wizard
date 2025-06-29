import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface FurnitureTypeStepProps {
  furnitureType: string
  onUpdate: (type: string) => void
}

const furnitureTypes = [
  { id: 'chair', label: 'Chair', emoji: '🪑' },
  { id: 'sofa', label: 'Sofa', emoji: '🛋️' },
  { id: 'bed', label: 'Bed', emoji: '🛏️' },
  { id: 'dresser', label: 'Dresser', emoji: '🗄️' },
  { id: 'cabinet', label: 'Cabinet', emoji: '📦' },
  { id: 'decor', label: 'Decor Piece', emoji: '🪞' },
  { id: 'table', label: 'Table', emoji: '🪑' },
  { id: 'other', label: 'Other', emoji: '➕' },
]

export function FurnitureTypeStep({ furnitureType, onUpdate }: FurnitureTypeStepProps) {
  const [customType, setCustomType] = useState('')

  const handleTypeSelect = (type: string) => {
    if (type === 'other') {
      onUpdate('')
    } else {
      onUpdate(type)
      setCustomType('')
    }
  }

  const handleCustomTypeChange = (value: string) => {
    setCustomType(value)
    onUpdate(value)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          What type of furniture are you upcycling?
        </h2>
        <p className="text-lg text-gray-600">
          Select the category that best describes your piece
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {furnitureTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              furnitureType === type.id || (type.id === 'other' && customType)
                ? 'ring-2 ring-emerald-500 bg-emerald-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => handleTypeSelect(type.id)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">{type.emoji}</div>
              <div className="font-medium text-gray-900">{type.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(furnitureType === 'other' || customType) && (
        <div className="max-w-md mx-auto">
          <Input
            placeholder="Describe your furniture type..."
            value={customType}
            onChange={(e) => handleCustomTypeChange(e.target.value)}
            className="text-center"
          />
        </div>
      )}
    </div>
  )
}