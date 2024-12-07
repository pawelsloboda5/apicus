// components/ServiceDetails.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Box, 
  CircleDollarSign, 
  Clock, 
  Server, 
  Shield, 
  Zap,
  CheckCircle2,
  Target, 
  TrendingUp, 
  ThumbsUp, 
  ThumbsDown, 
  Briefcase,
  BarChart3
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Service } from "@/types/service"

interface ServiceDetailsProps {
  service: Service
  selectedPlanIndex: number
  onPlanChange: (index: number) => void
}

export function ServiceDetails({ 
  service, 
  selectedPlanIndex, 
  onPlanChange,
}: ServiceDetailsProps) {
  const currentPlan = service.enhanced_data.plans[selectedPlanIndex]

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{service.metadata.service_name}</CardTitle>
            <p className="text-sm text-slate-600">
              Currently viewing {currentPlan.name} plan
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={selectedPlanIndex.toString()}
              onValueChange={(value) => onPlanChange(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {service.enhanced_data.plans.map((plan, index) => (
                  <SelectItem key={plan.name} value={index.toString()}>
                    {plan.name}
                    {!plan.isFreeTier && plan.pricing?.monthly?.base_price 
                      ? ` - $${plan.pricing.monthly.base_price}/mo` 
                      : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              {service.metadata.pricing_types.map(type => (
                <Badge key={type} variant="secondary">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="limits">Limits</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CircleDollarSign className="h-4 w-4 text-blue-500" />
                    <h3 className="font-medium">Pricing</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Base Price</span>
                      <div className="text-2xl font-bold font-mono">
                        {currentPlan.name.toLowerCase() === 'free' 
                          ? 'Free'
                          : currentPlan.pricing?.monthly?.base_price 
                            ? <>
                                ${currentPlan.pricing.monthly.base_price}
                                <span className="text-sm font-normal text-slate-500">/mo</span>
                              </>
                            : 'N/A'
                        }
                      </div>
                    </div>
                    {currentPlan.pricing.annual && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Annual Savings</span>
                        <span className="font-medium text-green-600">
                          {currentPlan.pricing.annual.savings_percentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <h3 className="font-medium">Billing Cycles</h3>
                  </div>
                  <div className="flex gap-2">
                    {service.enhanced_data.service_info.billing_cycles.map(cycle => (
                      <Badge key={cycle} variant="secondary">
                        {cycle}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {currentPlan.pricing.usage_components && currentPlan.pricing.usage_components.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <h3 className="font-medium">Additional Usage Costs</h3>
                  </div>
                  <div className="space-y-3">
                    {currentPlan.pricing.usage_components.map(component => (
                      <div key={component.name} className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">{component.name}</span>
                        <span className="text-sm font-medium">
                          ${component.price_per_unit}/{component.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-6">
                  <div className="text-center text-slate-500">
                    No additional usage-based charges
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  {currentPlan.features.highlighted.map(feature => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="limits">
            <div className="grid gap-4 md:grid-cols-2">
              {currentPlan.limits?.users && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Box className="h-4 w-4 text-purple-500" />
                      <h3 className="font-medium">User Limits</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      {currentPlan.limits?.users.description || 
                       `Min: ${currentPlan.limits?.users.min || 'N/A'}, Max: ${currentPlan.limits?.users.max || 'Unlimited'}`}
                    </p>
                  </CardContent>
                </Card>
              )}

              {currentPlan.limits?.storage && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="h-4 w-4 text-indigo-500" />
                      <h3 className="font-medium">Storage Limits</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      {currentPlan.limits?.storage.description || 
                       `${currentPlan.limits?.storage.amount} ${currentPlan.limits?.storage.unit}`}
                    </p>
                  </CardContent>
                </Card>
              )}

              {currentPlan.limits?.api && (
                <Card className="md:col-span-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-4 w-4 text-red-500" />
                      <h3 className="font-medium">API Limits</h3>
                    </div>
                    <div className="space-y-4">
                      {currentPlan.limits.api.rate.description && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Rate Limits</h4>
                          <p className="text-sm text-slate-600">{currentPlan.limits.api.rate.description}</p>
                        </div>
                      )}
                      {currentPlan.limits.api.quota.description && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Quota Limits</h4>
                          <p className="text-sm text-slate-600">{currentPlan.limits.api.quota.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid gap-4">
              {/* Market Insights Section */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Target Market */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="h-5 w-5 text-blue-500" />
                        <h3 className="font-medium">Target Market</h3>
                      </div>
                      <p className="text-sm text-slate-600">
                        {service.enhanced_data.market_insights?.target_market}
                      </p>
                    </div>

                    {/* Common Use Cases */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="h-5 w-5 text-purple-500" />
                        <h3 className="font-medium">Common Use Cases</h3>
                      </div>
                      <ul className="grid gap-2">
                        {service.enhanced_data.market_insights?.common_use_cases?.map((useCase) => (
                          <li key={useCase} className="flex items-start gap-2 text-sm text-slate-600">
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5" />
                            {useCase}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Growth Trends */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <h3 className="font-medium">Market Trends</h3>
                      </div>
                      <p className="text-sm text-slate-600">
                        {service.enhanced_data.market_insights?.growth_trends}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Competitive Analysis Section */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Market Position */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="h-5 w-5 text-indigo-500" />
                        <h3 className="font-medium">Market Position</h3>
                      </div>
                      <p className="text-sm text-slate-600">
                        {service.enhanced_data.competitive_positioning?.market_position}
                      </p>
                    </div>

                    {/* Competitive Advantages */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ThumbsUp className="h-5 w-5 text-green-500" />
                        <h3 className="font-medium">Competitive Advantages</h3>
                      </div>
                      <ul className="grid gap-2">
                        {service.enhanced_data.competitive_positioning?.competitive_advantages?.map((advantage) => (
                          <li key={advantage} className="flex items-start gap-2 text-sm text-slate-600">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5" />
                            {advantage}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Competitive Disadvantages */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ThumbsDown className="h-5 w-5 text-red-500" />
                        <h3 className="font-medium">Competitive Disadvantages</h3>
                      </div>
                      <ul className="grid gap-2">
                        {service.enhanced_data.competitive_positioning?.competitive_disadvantages?.map((disadvantage) => (
                          <li key={disadvantage} className="flex items-start gap-2 text-sm text-slate-600">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5" />
                            {disadvantage}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 