import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ToolsStepProps {
  tools: string[]
  onUpdate: (tools: string[]) => void
}

const toolOptions = [
  { id: 'drill', label: 'Drill', emoji: '🔧' },
  { id: 'paintbrush', label: 'Paintbrush', emoji: '🖌️' },
  { id: 'sandpaper', label: 'Sandpaper', emoji: '📄' },
  { id: 'screws', label: 'Screws', emoji: '🔩' },
  { id: 'glue', label: 'Wood Glue', emoji: '🧲' },
  { id: 'saw', label: 'Saw', emoji: '🪚' },
  { id: 'screwdriver', label: 'Screwdriver', emoji: '🪛' },
  { id: 'none', label: 'None of these', emoji: '❌' },
]

export function ToolsStep({ tools, onUpdate }: ToolsStepProps) {
  const toggleTool = (toolId: string) => {
    if (toolId === 'none') {
      // If selecting "none", clear all other tools
      onUpdate(['none'])
    } else {
      // If selecting other tools, remove "none"
      const filteredTools = tools.filter(t => t !== 'none')
      const newTools = filteredTools.includes(toolId)
        ? filteredTools.filter(t => t !== toolId)
        : [...filteredTools, toolId]
      onUpdate(newTools)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          What tools do you already have?
        </h2>
        <p className="text-lg text-gray-600">
          We'll recommend projects that work with your available tools
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {toolOptions.map((tool) => (
          <Card
            key={tool.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              tools.includes(tool.id)
                ? 'ring-2 ring-emerald-500 bg-emerald-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => toggleTool(tool.id)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">{tool.emoji}</div>
              <div className="font-medium text-gray-900">{tool.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tools.includes('none') && (
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-blue-800">
            No worries! We'll suggest projects that require minimal tools and include 
            tool recommendations in your guide.
          </p>
        </div>
      )}

      {tools.length > 0 && !tools.includes('none') && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Available tools:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {tools.map((tool) => {
              const toolOption = toolOptions.find(t => t.id === tool)
              return (
                <Badge key={tool} variant="secondary">
                  {toolOption?.emoji} {toolOption?.label}
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}