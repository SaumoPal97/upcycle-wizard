import { Card, CardContent } from '@/components/ui/card'

interface ConditionStepProps {
  condition: string
  onUpdate: (condition: string) => void
}

const conditions = [
  {
    id: 'great',
    label: 'Great',
    emoji: '✅',
    description: 'Minimal wear, just needs style refresh',
  },
  {
    id: 'good',
    label: 'Good',
    emoji: '😌',
    description: 'Some minor scratches or fading',
  },
  {
    id: 'worn',
    label: 'Worn',
    emoji: '😬',
    description: 'Noticeable damage but structurally sound',
  },
  {
    id: 'poor',
    label: 'Poor',
    emoji: '🚫',
    description: 'Significant damage, needs major repair',
  },
]

export function ConditionStep({ condition, onUpdate }: ConditionStepProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          What's the current condition?
        </h2>
        <p className="text-lg text-gray-600">
          This helps us recommend the right level of restoration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {conditions.map((conditionOption) => (
          <Card
            key={conditionOption.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              condition === conditionOption.id
                ? 'ring-2 ring-emerald-500 bg-emerald-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => onUpdate(conditionOption.id)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">{conditionOption.emoji}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {conditionOption.label}
              </h3>
              <p className="text-sm text-gray-600">{conditionOption.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}