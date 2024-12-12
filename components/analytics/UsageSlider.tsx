import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ServiceMetric } from "@/types/analytics"
import { useState } from "react"
import { motion } from "framer-motion"

interface UsageSliderProps {
  metric: ServiceMetric
  onChange: (value: number) => void
  className?: string
}

export function UsageSlider({ metric, onChange, className }: UsageSliderProps) {
  const [value, setValue] = useState(metric.value)
  const maxValue = metric.nextPlan?.limit || (metric.currentPlanThreshold ?? 0) * 2 || metric.value * 2

  const handleSliderChange = (newValue: number[]) => {
    setValue(newValue[0])
    onChange(newValue[0])
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value)
    if (!isNaN(newValue) && newValue >= 0) {
      setValue(newValue)
      onChange(newValue)
    }
  }

  // Calculate the cost implications
  const calculateCost = (usage: number) => {
    if (!metric.costPerUnit) return null
    
    let baseCost = metric.basePrice
    if (usage > (metric.currentPlanThreshold || 0)) {
      baseCost = metric.nextPlan?.price || baseCost
    }
    
    const overageUsage = Math.max(0, usage - (metric.currentPlanThreshold || 0))
    const overage = overageUsage * (metric.costPerUnit || 0)
    
    return baseCost + overage
  }

  const cost = calculateCost(value)
  const isOverLimit = metric.currentPlanThreshold && value > metric.currentPlanThreshold

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium text-slate-900">
            Simulate {metric.name}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={value}
              onChange={handleInputChange}
              className="w-24 text-right"
              min={0}
              max={maxValue}
            />
            <span className="text-sm text-slate-500">{metric.unit}</span>
          </div>
        </div>

        <Slider
          value={[value]}
          min={0}
          max={maxValue}
          step={1}
          onValueChange={handleSliderChange}
          className="py-4"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-slate-500">Current Plan Limit</Label>
            <p className="text-sm font-medium text-slate-700">
              {metric.currentPlanThreshold || "Unlimited"} {metric.unit}
            </p>
          </div>
          {metric.nextPlan && (
            <div>
              <Label className="text-sm text-slate-500">Next Tier Limit</Label>
              <p className="text-sm font-medium text-slate-700">
                {metric.nextPlan.limit || "Unlimited"} {metric.unit}
              </p>
            </div>
          )}
        </div>

        {cost !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-slate-50 rounded-lg"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Estimated Cost</span>
                <span className="font-semibold text-slate-900">
                  ${cost.toFixed(2)}
                </span>
              </div>
              {isOverLimit && (
                <p className="text-sm text-yellow-600">
                  This usage would exceed your current plan limit
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  )
}
