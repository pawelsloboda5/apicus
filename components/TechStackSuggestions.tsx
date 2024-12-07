// components/TechStackSuggestions.tsx
import { useState } from "react"
import { Service } from "@/types/service"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { 
  DollarSign, 
  Zap, 
  Shuffle, 
  ChevronRight 
} from "lucide-react"

interface TechStackSuggestionsProps {
  availableServices: Service[]
  onStackSelect: (services: Service[]) => void
}

export function TechStackSuggestions({ 
  availableServices, 
  onStackSelect 
}: TechStackSuggestionsProps) {
  const [budget, setBudget] = useState([100])
  const [complexity, setComplexity] = useState([2])

  const generateSuggestedStack = () => {
    // Filter services based on budget and complexity
    const filteredServices = availableServices.filter(service => {
      const lowestPrice = service.enhanced_data.plans[0]?.pricing?.monthly?.base_price || 0
      return lowestPrice <= budget[0]
    })

    // Select random services based on complexity
    const suggestedStack = filteredServices
      .sort(() => Math.random() - 0.5)
      .slice(0, complexity[0])

    return suggestedStack
  }

  return (
    <Card className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Find Your Perfect Tech Stack</h2>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Monthly Budget
              </label>
              <span className="text-sm font-mono">${budget[0]}</span>
            </div>
            <Slider
              value={budget}
              onValueChange={setBudget}
              max={500}
              step={50}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Stack Size
              </label>
              <span className="text-sm font-mono">{complexity[0]} services</span>
            </div>
            <Slider
              value={complexity}
              onValueChange={setComplexity}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          variant="outline"
          className="w-full"
          onClick={() => {
            const stack = generateSuggestedStack()
            onStackSelect(stack)
          }}
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Generate Random Stack
        </Button>
        <Button 
          className="w-full"
          onClick={() => onStackSelect([])}
        >
          <ChevronRight className="h-4 w-4 mr-2" />
          Build Custom Stack
        </Button>
      </div>
    </Card>
  )
} 