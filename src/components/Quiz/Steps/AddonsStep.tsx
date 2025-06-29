import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AddonsStepProps {
  addons: string[]
  onUpdate: (addons: string[]) => void
}

const addonOptions = [
  { id: 'paint-stain', label: 'Paint/Stain', emoji: '🖌️' },
  { id: 'new-legs', label: 'New Legs', emoji: '🪑' },
  { id: 'new-fabric', label: 'New Fabric', emoji: '🧵' },
  { id: 'knobs', label: 'Knobs/Hardware', emoji: '🔲' },
  { id: 'decals', label: 'Decals/Stencils', emoji: '🖼️' },
  { id: 'storage', label: 'Storage Add-on', emoji: '📦' },
  { id: 'minimal', label: 'Keep it minimal', emoji: '➖' },
]

export function AddonsStep({ addons, onUpdate }: AddonsStepProps) {
  const toggleAddon = (addonId: string) => {
    if (addonId === 'minimal') {
      // If selecting minimal, clear all other addons
      onUpdate(['minimal'])
    } else {
      // If selecting other addons, remove minimal
      const filteredAddons = addons.filter(a => a !== 'minimal')
      const newAddons = filteredAddons.includes(addonId)
        ? filteredAddons.filter(a => a !== addonId)
        : [...filteredAddons, addonId]
      onUpdate(newAddons)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          What add-ons would you like?
        </h2>
        <p className="text-lg text-gray-600">
          Select any enhancements you're interested in
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {addonOptions.map((addon) => (
          <Card
            key={addon.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              addons.includes(addon.id)
                ? 'ring-2 ring-emerald-500 bg-emerald-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => toggleAddon(addon.id)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">{addon.emoji}</div>
              <div className="font-medium text-gray-900">{addon.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {addons.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Selected add-ons:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {addons.map((addon) => {
              const addonOption = addonOptions.find(a => a.id === addon)
              return (
                <Badge key={addon} variant="secondary">
                  {addonOption?.emoji} {addonOption?.label}
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}