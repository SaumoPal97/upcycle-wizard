import { Card, CardContent } from '@/components/ui/card'

interface StyleStepProps {
  style: string
  onUpdate: (style: string) => void
}

const styles = [
  { id: 'modern', label: 'Modern', emoji: '🎯', description: 'Clean lines, minimal' },
  { id: 'rustic', label: 'Rustic', emoji: '🪵', description: 'Natural, weathered charm' },
  { id: 'vintage', label: 'Vintage', emoji: '🕰️', description: 'Classic, timeless appeal' },
  { id: 'industrial', label: 'Industrial', emoji: '🧱', description: 'Raw materials, urban edge' },
  { id: 'scandinavian', label: 'Scandinavian', emoji: '🧼', description: 'Light, functional, cozy' },
  { id: 'eclectic', label: 'Eclectic', emoji: '🌀', description: 'Mixed styles, creative' },
  { id: 'surprise', label: 'Surprise Me', emoji: '🎲', description: 'Let AI choose!' },
]

export function StyleStep({ style, onUpdate }: StyleStepProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Pick your style vibe
        </h2>
        <p className="text-lg text-gray-600">
          What aesthetic speaks to you?
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {styles.map((styleOption) => (
          <Card
            key={styleOption.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              style === styleOption.id
                ? 'ring-2 ring-emerald-500 bg-emerald-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => onUpdate(styleOption.id)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">{styleOption.emoji}</div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">
                {styleOption.label}
              </h3>
              <p className="text-xs text-gray-600">{styleOption.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}