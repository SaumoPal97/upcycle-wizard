import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface ColorStepProps {
  colorVibe: string
  customColor?: string
  onUpdate: (colorVibe: string, customColor?: string) => void
}

const colorVibes = [
  { id: 'natural-wood', label: 'Natural Wood', color: '#8B4513', description: 'Warm wood tones' },
  { id: 'light-neutrals', label: 'Light Neutrals', color: '#F5F5F5', description: 'Whites, beiges, grays' },
  { id: 'bold-colors', label: 'Bold Colors', color: '#FF6B6B', description: 'Vibrant, eye-catching' },
  { id: 'black-white', label: 'Black & White', color: '#000000', description: 'Classic monochrome' },
  { id: 'pastels', label: 'Pastels', color: '#FFB3E6', description: 'Soft, dreamy colors' },
  { id: 'custom', label: 'Custom', color: '#6B73FF', description: 'Pick your own' },
]

export function ColorStep({ colorVibe, customColor, onUpdate }: ColorStepProps) {
  const [inputColor, setInputColor] = useState(customColor || '#6B73FF')

  const handleColorSelect = (vibeId: string) => {
    if (vibeId === 'custom') {
      onUpdate(vibeId, inputColor)
    } else {
      onUpdate(vibeId)
    }
  }

  const handleCustomColorChange = (color: string) => {
    setInputColor(color)
    if (colorVibe === 'custom') {
      onUpdate('custom', color)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          What's your color vibe?
        </h2>
        <p className="text-lg text-gray-600">
          Choose a color palette that fits your space
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {colorVibes.map((vibe) => (
          <Card
            key={vibe.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              colorVibe === vibe.id
                ? 'ring-2 ring-emerald-500 bg-emerald-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => handleColorSelect(vibe.id)}
          >
            <CardContent className="p-6 text-center">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-gray-200"
                style={{ backgroundColor: vibe.id === 'custom' ? inputColor : vibe.color }}
              />
              <h3 className="font-bold text-gray-900 mb-1">{vibe.label}</h3>
              <p className="text-sm text-gray-600">{vibe.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {colorVibe === 'custom' && (
        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-4">
            <Input
              type="color"
              value={inputColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="w-16 h-12 p-1 border-2"
            />
            <Input
              type="text"
              placeholder="#6B73FF"
              value={inputColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      )}
    </div>
  )
}