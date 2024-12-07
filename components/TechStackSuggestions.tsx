"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { DollarSign, Zap, Shuffle, ChevronRight } from "lucide-react"
import { Service } from "@/types/service"

interface TechStackSuggestionsProps {
  availableServices: Service[]
  onStackSelect: (services: Service[]) => void
}

export function TechStackSuggestions({ availableServices, onStackSelect }: TechStackSuggestionsProps) {
  const [budget, setBudget] = useState([100])
  const [complexity, setComplexity] = useState([2])

  const generateSuggestedStack = () => {
    // Filter services within budget
    const affordableServices = availableServices.filter(service => {
      const lowestPrice = Math.min(
        ...service.enhanced_data.plans
          .filter(plan => plan?.pricing?.monthly?.base_price)
          .map(plan => plan.pricing.monthly.base_price)
      )
      return lowestPrice <= budget[0]
    })

    // Randomly select services based on complexity
    const shuffled = [...affordableServices].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, complexity[0])
  }

  return (
    <Card className="mx-4 sm:mx-auto sm:max-w-xl p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Find Your Perfect Tech Stack</h2>
        
        <div className="space-y-6">
          {/* Budget Slider */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                Monthly Budget
              </label>
              <span className="text-sm font-mono text-slate-600">${budget[0]}</span>
            </div>
            <Slider
              value={budget}
              onValueChange={setBudget}
              max={500}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>$0</span>
              <span>$500</span>
            </div>
          </div>

          {/* Stack Size Slider */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Stack Size
              </label>
              <span className="text-sm font-mono text-slate-600">{complexity[0]} services</span>
            </div>
            <Slider
              value={complexity}
              onValueChange={setComplexity}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>1 service</span>
              <span>5 services</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
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

      <div className="text-center text-sm text-slate-500">
        <p>You can always modify your stack later</p>
      </div>
    </Card>
  )
} 