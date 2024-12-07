// components/mobile/MobileServiceDetails.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Zap, DollarSign, Box, Server, Shield, TrendingUp, Briefcase, Target, ThumbsUp, ThumbsDown } from "lucide-react"
import { Service } from "@/types/service"
import { UsageBasedPricing } from "@/components/pricing/UsageBasedPricing"

interface MobileServiceDetailsProps {
  service: Service
  selectedPlanIndex: number
  onPlanChange: (index: number) => void
}

export function MobileServiceDetails({ service, selectedPlanIndex, onPlanChange }: MobileServiceDetailsProps) {
  const currentPlan = service.enhanced_data.plans[selectedPlanIndex]
  const hasUsageComponents = currentPlan.pricing.usage_components && 
    currentPlan.pricing.usage_components.length > 0

  return (
    <Card className="space-y-4 p-4">
      <CardHeader className="p-0">
        <div className="flex flex-col gap-2">
          <CardTitle className="text-xl font-bold">{service.metadata.service_name}</CardTitle>
          <div className="flex flex-wrap gap-2">
            {service.metadata.pricing_types.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs font-medium capitalize">{type}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Select
              value={selectedPlanIndex.toString()}
              onValueChange={(value) => onPlanChange(parseInt(value))}
            >
              <SelectTrigger className="w-[150px] text-sm">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {service.enhanced_data.plans.map((plan, i) => (
                  <SelectItem key={plan.name} value={i.toString()}>
                    {plan.name} {(!plan.isFreeTier && plan.pricing?.monthly?.base_price) ? `- $${plan.pricing.monthly.base_price}/mo` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full overflow-x-auto whitespace-nowrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="limits">Limits</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <UsageBasedPricing
                  basePrice={currentPlan.pricing.monthly.base_price}
                  usageComponents={currentPlan.pricing.usage_components}
                  isFreeTier={currentPlan.isFreeTier}
                />
              </CardContent>
            </Card>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Billing Cycles</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {service.enhanced_data.service_info.billing_cycles.map(c => (
                  <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-2 text-sm">
            {currentPlan.features.highlighted.map(feature => (
              <div key={feature} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="limits" className="space-y-4 text-sm">
            {currentPlan.limits?.users && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Box className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">User Limits</span>
                </div>
                <div className="text-slate-600">{currentPlan.limits.users.description || `Min: ${currentPlan.limits.users.min || 'N/A'}, Max: ${currentPlan.limits.users.max || 'Unlimited'}`}</div>
              </div>
            )}

            {currentPlan.limits?.storage && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Server className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium">Storage Limits</span>
                </div>
                <div className="text-slate-600">{currentPlan.limits.storage.description || `${currentPlan.limits.storage.amount} ${currentPlan.limits.storage.unit}`}</div>
              </div>
            )}

            {currentPlan.limits?.api && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-red-500" />
                  <span className="font-medium">API Limits</span>
                </div>
                {currentPlan.limits.api.rate?.description && (
                  <div className="text-slate-600 mb-2">
                    <span className="font-medium">Rate:</span> {currentPlan.limits.api.rate.description}
                  </div>
                )}
                {currentPlan.limits.api.quota?.description && (
                  <div className="text-slate-600">
                    <span className="font-medium">Quota:</span> {currentPlan.limits.api.quota.description}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4 text-sm">
            {service.enhanced_data.market_insights && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Target Market</span>
                </div>
                <div className="text-slate-600">
                  {service.enhanced_data.market_insights.target_market}
                </div>
              </div>
            )}

            {service.enhanced_data.market_insights?.common_use_cases?.length && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Use Cases</span>
                </div>
                <ul className="list-disc list-inside text-slate-600">
                  {service.enhanced_data.market_insights.common_use_cases.map(useCase => (
                    <li key={useCase}>{useCase}</li>
                  ))}
                </ul>
              </div>
            )}

            {service.enhanced_data.competitive_positioning && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Market Position</span>
                </div>
                <div className="text-slate-600 mb-2">
                  {service.enhanced_data.competitive_positioning.market_position}
                </div>

                {service.enhanced_data.competitive_positioning.competitive_advantages?.length && (
                  <div>
                    <span className="font-medium text-green-600">Advantages:</span>
                    <ul className="list-disc list-inside text-slate-600">
                      {service.enhanced_data.competitive_positioning.competitive_advantages.map(adv => (
                        <li key={adv}>{adv}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {service.enhanced_data.competitive_positioning.competitive_disadvantages?.length && (
                  <div>
                    <span className="font-medium text-red-600">Disadvantages:</span>
                    <ul className="list-disc list-inside text-slate-600">
                      {service.enhanced_data.competitive_positioning.competitive_disadvantages.map(dis => (
                        <li key={dis}>{dis}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
