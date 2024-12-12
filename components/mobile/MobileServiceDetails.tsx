// components/mobile/MobileServiceDetails.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Service } from "@/types/service"
import { UsageBasedPricing } from "@/components/pricing/UsageBasedPricing"

interface MobileServiceDetailsProps {
  service: Service
  selectedPlanIndex: number
  onPlanChange: (index: number) => void
}

export function MobileServiceDetails({ service, selectedPlanIndex, onPlanChange }: MobileServiceDetailsProps) {
  const currentPlan = service.enhanced_data.plans[selectedPlanIndex]

  return (
    <Card>
      <CardContent className="p-4">
        <Select
          value={selectedPlanIndex.toString()}
          onValueChange={(value) => onPlanChange(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent>
            {service.enhanced_data.plans.map((plan, i) => (
              <SelectItem key={plan.name} value={i.toString()}>
                {plan.name} {(!plan.is_free_tier && plan.pricing?.monthly?.base_price) ? `- $${plan.pricing.monthly.base_price}/mo` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-4">
          <UsageBasedPricing
            basePrice={currentPlan.pricing.monthly.base_price}
            usageComponents={currentPlan.pricing.usage_components}
            isFreeTier={currentPlan.is_free_tier}
          />
        </div>
      </CardContent>
    </Card>
  )
}
