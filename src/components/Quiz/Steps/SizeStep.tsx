import { Card, CardContent } from '@/components/ui/card'

interface SizeStepProps {
  size: string
  onUpdate: (size: string) => void
}

const sizes = [
  {
    id: 'small',
    label: 'Small',
    emoji: '📏',
    description: 'e.g., stool, side table, small decor',
  },
  {
    id: 'medium',
    label: 'Medium',
    emoji: '🪑',
    description: 'e.g., nightstand, desk chair, lamp',
  },
  {
    id: 'large',
    label: 'Large',
    emoji: '🛋️',
    description: 'e.g., dresser, bookshelf, dining table',
  },
]

export function SizeStep({ size, onUpdate }: SizeStepProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          How big is your furniture piece?
        </h2>
        <p className="text-lg text-gray-600">
          This helps us recommend appropriate techniques and materials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sizes.map((sizeOption) => (
          <Card
            key={sizeOption.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              size === sizeOption.id
                ? 'ring-2 ring-emerald-500 bg-emerald-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => onUpdate(sizeOption.id)}
          >
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">{sizeOption.emoji}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {sizeOption.label}
              </h3>
              <p className="text-gray-600">{sizeOption.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}