import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface RecyclablesStepProps {
  recyclables: string[]
  customRecyclables?: string
  onUpdate: (recyclables: string[], customRecyclables?: string) => void
}

const recyclableOptions = [
  { id: 'glass-bottles', label: 'Glass Bottles', emoji: '🍾' },
  { id: 'metal-cans', label: 'Metal Cans', emoji: '🥫' },
  { id: 'cardboard', label: 'Cardboard', emoji: '📦' },
  { id: 'fabric-scraps', label: 'Fabric Scraps', emoji: '🧵' },
  { id: 'old-hardware', label: 'Old Hardware', emoji: '🔩' },
  { id: 'magazines', label: 'Magazines', emoji: '📰' },
  { id: 'rope-twine', label: 'Rope/Twine', emoji: '🪢' },
  { id: 'ceramic-tiles', label: 'Ceramic Tiles', emoji: '🔲' },
]

export function RecyclablesStep({ 
  recyclables, 
  customRecyclables, 
  onUpdate 
}: RecyclablesStepProps) {
  const toggleRecyclable = (recyclableId: string) => {
    const newRecyclables = recyclables.includes(recyclableId)
      ? recyclables.filter(r => r !== recyclableId)
      : [...recyclables, recyclableId]
    onUpdate(newRecyclables, customRecyclables)
  }

  const handleCustomChange = (value: string) => {
    onUpdate(recyclables, value)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Got recyclables to incorporate?
        </h2>
        <p className="text-lg text-emerald-600 font-medium mb-2">
          Let's make your project even more eco-friendly
        </p>
        <p className="text-gray-600">
          Select any materials you'd like to creatively reuse
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {recyclableOptions.map((recyclable) => (
          <Card
            key={recyclable.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              recyclables.includes(recyclable.id)
                ? 'ring-2 ring-emerald-500 bg-emerald-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => toggleRecyclable(recyclable.id)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">{recyclable.emoji}</div>
              <div className="font-medium text-gray-900">{recyclable.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-md mx-auto mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Other materials you'd like to use:
        </label>
        <Input
          placeholder="e.g., old CDs, wine corks, buttons..."
          value={customRecyclables || ''}
          onChange={(e) => handleCustomChange(e.target.value)}
        />
      </div>

      {(recyclables.length > 0 || customRecyclables) && (
        <div className="text-center">
          <p className="text-sm text-emerald-600 font-medium mb-2">Materials to incorporate:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {recyclables.map((recyclable) => {
              const recyclableOption = recyclableOptions.find(r => r.id === recyclable)
              return (
                <Badge key={recyclable} variant="secondary" className="bg-emerald-100 text-emerald-800">
                  {recyclableOption?.emoji} {recyclableOption?.label}
                </Badge>
              )
            })}
            {customRecyclables && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                ✨ {customRecyclables}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}