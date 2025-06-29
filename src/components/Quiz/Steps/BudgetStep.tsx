import { Slider } from '@/components/ui/slider'

interface BudgetStepProps {
  budget: number | null
  onUpdate: (budget: number) => void
}

export function BudgetStep({ budget, onUpdate }: BudgetStepProps) {
  const currentBudget = budget ?? 100

  const formatBudget = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`
    }
    return `$${value}`
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          What's your add-on budget?
        </h2>
        <p className="text-lg text-gray-600">
          How much would you like to spend on new materials and supplies?
        </p>
      </div>

      <div className="bg-white rounded-lg p-8 shadow-sm border">
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-emerald-600 mb-2">
            {formatBudget(currentBudget)}
          </div>
          <p className="text-gray-600">Total budget for materials</p>
        </div>

        <div className="space-y-6">
          <Slider
            value={[currentBudget]}
            onValueChange={(value) => onUpdate(value[0])}
            max={5000}
            min={0}
            step={50}
            className="w-full"
          />

          <div className="flex justify-between text-sm text-gray-500">
            <span>$0</span>
            <span>$2.5k</span>
            <span>$5k+</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900">Budget-Friendly</div>
            <div className="text-sm text-gray-600">$0 - $100</div>
            <div className="text-xs text-gray-500 mt-1">Basic materials only</div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="font-medium text-emerald-900">Moderate</div>
            <div className="text-sm text-emerald-700">$100 - $500</div>
            <div className="text-xs text-emerald-600 mt-1">Quality upgrades</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-900">Premium</div>
            <div className="text-sm text-blue-700">$500+</div>
            <div className="text-xs text-blue-600 mt-1">High-end materials</div>
          </div>
        </div>
      </div>
    </div>
  )
}