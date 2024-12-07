"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface UsageComponent {
  name: string
  price_per_unit: number
  unit: string
}

interface UsageBasedPricingProps {
  basePrice: number
  usageComponents?: UsageComponent[]
  isFreeTier?: boolean
}

export function UsageBasedPricing({ 
  basePrice, 
  usageComponents, 
  isFreeTier 
}: UsageBasedPricingProps) {
  return (
    <div className="space-y-4">
      {/* Base Price Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm text-slate-600">Base Price</div>
          <div className="text-2xl font-bold font-mono">
            {isFreeTier ? 'Free' : `$${basePrice}`}
            <span className="text-sm font-normal text-slate-500">/mo</span>
          </div>
        </div>
        {usageComponents && usageComponents.length > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Usage Based
          </Badge>
        )}
      </div>

      {/* Usage Components */}
      {usageComponents && usageComponents.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium flex items-center gap-2">
            Additional Usage Costs
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Charges based on your usage</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="grid gap-2">
            {usageComponents.map((component, index) => (
              <Card key={index}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">{component.name}</div>
                      <div className="text-xs text-slate-500">
                        Per {component.unit}
                      </div>
                    </div>
                    <div className="text-sm font-mono">
                      ${component.price_per_unit}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 