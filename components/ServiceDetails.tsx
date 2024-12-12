// components/ServiceDetails.tsx
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Service } from "@/types/service"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { extractMetricsFromPlan } from "./analytics/utils"
import { UsageProjections } from "./analytics/UsageProjections"
import { UsageInsightCard } from "./analytics/UsageInsightCard"
import { ServiceMetric, UsageMetric, ServiceMetricsConfig } from "@/types/analytics"
import { useState, useEffect, useMemo } from "react"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { 
  Users, Database, Zap, Server, 
  Clock, AlertCircle, CheckCircle2,
  CreditCard, TrendingUp, Infinity,
  HardDrive, Users2, Gamepad2,
  BarChart3, AlertTriangle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { extractServiceMetrics } from "@/utils/metrics"
import { StackAnalytics } from "@/components/StackAnalytics"
import { ServiceAnalytics } from "@/components/ServiceAnalytics"

interface ServiceDetailsProps {
  service: Service
  selectedPlanIndex: number
  onPlanChange: (index: number) => void
  onMetricChange?: (metricId: string, value: number) => void
  simulatedValues?: Record<string, number>
}

interface PlanFeatureCategory {
  name: string
  icon: JSX.Element
  features: Array<{
    name: string
    description?: string | undefined
  }>
}

// Add type guard
function isValidFeature(feature: any): feature is { name: string; description?: string } {
  return typeof feature === 'object' && feature !== null && typeof feature.name === 'string';
}

// Add this before the MetricCard component
function calculateOverageCost(metric: UsageMetric): number | null {
  if (!metric.currentPlanThreshold) return null
  
  const overageUnits = Math.max(0, metric.value - metric.currentPlanThreshold)
  const rate = metric.costInfo?.overageRate || 
    (metric.nextPlan?.price && metric.nextPlan.limit 
      ? (metric.nextPlan.price - (metric.costInfo?.basePrice || 0)) / 
        (metric.nextPlan.limit - metric.currentPlanThreshold)
      : 0)
  
  return overageUnits * rate
}

interface MetricCardProps {
  metric: UsageMetric
  onValueChange: (value: number) => void
}

function MetricCard({ metric, onValueChange }: MetricCardProps) {
  if (metric.isUnlimited || !metric.currentPlanThreshold) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 hover:bg-white/60 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-slate-900">{metric.name}</h4>
          <Badge variant="secondary" className="bg-blue-50/50 text-blue-700 font-medium border-0">
            {metric.isUnlimited ? "Unlimited" : "Not Specified"}
          </Badge>
        </div>
        <p className="text-sm text-slate-600">
          {metric.description || `No usage limits for ${metric.name.toLowerCase()}`}
        </p>
      </div>
    )
  }

  const maxValue = metric.nextPlan?.limit 
    ? Math.min(metric.nextPlan.limit * 2, Number.MAX_SAFE_INTEGER)
    : metric.currentPlanThreshold * 2

  const percentage = (metric.value / metric.currentPlanThreshold) * 100
  const overageCost = calculateOverageCost(metric)

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 hover:bg-white/60 transition-all">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-slate-900">{metric.name}</h4>
            {metric.description && (
              <p className="text-sm text-slate-600 mt-0.5">{metric.description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              {metric.value.toLocaleString()} / {metric.currentPlanThreshold.toLocaleString()}
              {metric.unit && ` ${metric.unit}`}
            </div>
            <div className={cn(
              "text-xs font-medium",
              percentage > 100 ? "text-red-600" : 
              percentage > 80 ? "text-yellow-600" : 
              "text-green-600"
            )}>
              {percentage.toFixed(1)}% utilized
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Slider
              value={[metric.value]}
              min={0}
              max={maxValue}
              step={1}
              onValueChange={([value]) => onValueChange(value)}
              className={cn(
                "flex-1",
                percentage > 100 ? "[&>div]:bg-red-500" :
                percentage > 80 ? "[&>div]:bg-yellow-500" :
                "[&>div]:bg-blue-500"
              )}
            />
            <Input
              type="number"
              value={metric.value}
              onChange={(e) => onValueChange(Number(e.target.value))}
              className="w-24 border-0 bg-slate-50"
            />
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span>Current Tier: {metric.currentPlanThreshold.toLocaleString()} {metric.unit}</span>
            {metric.nextPlan && (
              <span>Next Tier: {metric.nextPlan.limit?.toLocaleString()} {metric.unit}</span>
            )}
          </div>

          {percentage > 100 && (
            <div className="mt-2 p-3 rounded-lg bg-gradient-to-r from-red-50 to-red-50/50 border-0">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Exceeding Current Tier</p>
                  <p className="text-xs mt-0.5">
                    Consider upgrading to avoid overage charges of ${overageCost?.toFixed(2) || '0.00'}
                    {metric.period && ` per ${metric.period}`}
                  </p>
                </div>
              </div>
            </div>
          )}
          {percentage > 80 && percentage <= 100 && (
            <div className="mt-2 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-50/50 border-0">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <div className="text-sm text-yellow-800">
                  Approaching tier limit - monitor usage closely
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ServiceDetails({ 
  service, 
  selectedPlanIndex,
  onPlanChange,
  onMetricChange,
  simulatedValues = {}
}: ServiceDetailsProps) {
  const [localSimulatedValues, setLocalSimulatedValues] = useState<Record<string, number>>({})
  const currentPlan = service.enhanced_data.plans[selectedPlanIndex]
  const nextPlan = service.enhanced_data.plans[selectedPlanIndex + 1]
  
  // Use useMemo for metrics
  const metrics = useMemo(() => 
    extractServiceMetrics(service, currentPlan, nextPlan), 
    [service, currentPlan, nextPlan]
  )

  // Use useMemo for usageMetrics with corrected value handling
  const usageMetrics = useMemo(() => 
    metrics.map(metric => ({
      ...metric,
      value: simulatedValues[metric.id] ?? localSimulatedValues[metric.id] ?? metric.value,
      usageInfo: {
        current: simulatedValues[metric.id] ?? localSimulatedValues[metric.id] ?? metric.value,
        limit: metric.currentPlanThreshold,
        percentage: metric.currentPlanThreshold ? 
          ((simulatedValues[metric.id] ?? localSimulatedValues[metric.id] ?? metric.value) / metric.currentPlanThreshold) * 100 : 0,
        period: metric.period
      }
    })),
    [metrics, simulatedValues, localSimulatedValues]
  )

  const handleMetricChange = (metricId: string, value: number) => {
    setLocalSimulatedValues(prev => ({
      ...prev,
      [metricId]: value
    }))

    // Emit changes to parent component if provided
    if (onMetricChange) {
      onMetricChange(metricId, value)
    }
  }

  // Group features by category with proper type checking
  const featureCategories = currentPlan.features.categories?.reduce<PlanFeatureCategory[]>((acc, category) => {
    if (!category.name || !Array.isArray(category.features)) return acc;

    let icon: JSX.Element;
    switch (category.name.toLowerCase()) {
      case 'users':
        icon = <Users className="h-5 w-5" />;
        break;
      case 'storage':
        icon = <Database className="h-5 w-5" />;
        break;
      case 'api':
        icon = <Zap className="h-5 w-5" />;
        break;
      default:
        icon = <Server className="h-5 w-5" />;
    }

    // Filter out invalid features
    const validFeatures = category.features
      .filter(isValidFeature)
      .map(feature => ({
        name: feature.name,
        description: feature.description
      }));

    if (validFeatures.length === 0) return acc;

    acc.push({
      name: category.name,
      icon,
      features: validFeatures
    });
    return acc;
  }, []) || [];

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="usage">Usage</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="limits">Limits</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-6">
          {/* Plan Selection */}
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 hover:bg-white/60 transition-all">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{currentPlan.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {currentPlan.pricing?.monthly?.details || `${currentPlan.name} plan`}
                  </p>
                </div>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-right"
                >
                  <div className="text-2xl font-bold">
                    ${currentPlan.pricing?.monthly?.base_price || 0}
                    <span className="text-sm font-normal text-slate-500">/mo</span>
                  </div>
                  {currentPlan.pricing?.annual && (
                    <div className="text-sm text-green-600">
                      Save {currentPlan.pricing.annual.savings_percentage}% annually
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="grid gap-4">
                <h4 className="font-medium">Available Plans</h4>
                <div className="grid gap-2">
                  {service.enhanced_data.plans.map((plan, index) => (
                    <button
                      key={index}
                      onClick={() => onPlanChange(index)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg transition-all bg-white/60 backdrop-blur-sm",
                        index === selectedPlanIndex
                          ? "bg-blue-50/50 ring-1 ring-blue-200 shadow-sm"
                          : "hover:bg-white/80"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          index === selectedPlanIndex ? "bg-blue-100" : "bg-slate-100"
                        )}>
                          {index === selectedPlanIndex ? (
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                          ) : (
                            <CreditCard className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{plan.name}</div>
                          <div className="text-sm text-slate-500">
                            {plan.pricing?.monthly?.details || `${plan.name} tier`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${plan.pricing?.monthly?.base_price || 0}/mo
                        </div>
                        {plan.pricing?.annual && (
                          <div className="text-sm text-green-600">
                            {plan.pricing.annual.savings_percentage}% off annually
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4">
            <h4 className="font-medium">Key Metrics</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {usageMetrics.slice(0, 4).map(metric => (
                <div key={metric.id} 
                  className="bg-white/50 backdrop-blur-sm rounded-lg p-4 hover:bg-white/60 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      metric.type === 'storage' && "bg-purple-100 text-purple-700",
                      metric.type === 'users' && "bg-blue-100 text-blue-700",
                      metric.type === 'api' && "bg-yellow-100 text-yellow-700",
                      metric.type === 'other' && "bg-slate-100 text-slate-700"
                    )}>
                      {metric.type === 'storage' && <Database className="h-5 w-5" />}
                      {metric.type === 'users' && <Users className="h-5 w-5" />}
                      {metric.type === 'api' && <Zap className="h-5 w-5" />}
                      {metric.type === 'other' && <Server className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-sm text-slate-500">
                        {metric.value.toLocaleString()} / {metric.currentPlanThreshold?.toLocaleString() || '∞'} {metric.unit}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="usage" className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 rounded-lg border-0 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-blue-900">Usage Configuration</h3>
          <p className="text-sm text-blue-700/90 mt-1">
            Estimate your usage to see cost projections and plan recommendations
          </p>
        </div>

        <div className="space-y-8">
          {['users', 'storage', 'api', 'other'].map(type => {
            const typeMetrics = usageMetrics.filter(m => m.type === type)
            if (!typeMetrics.length) return null

            return (
              <div key={type} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-lg bg-gradient-to-br",
                    type === 'storage' && "from-purple-100 to-purple-50",
                    type === 'users' && "from-blue-100 to-blue-50",
                    type === 'api' && "from-yellow-100 to-yellow-50",
                    type === 'other' && "from-slate-100 to-slate-50"
                  )}>
                    {type === 'storage' && <Database className="h-5 w-5" />}
                    {type === 'users' && <Users className="h-5 w-5" />}
                    {type === 'api' && <Zap className="h-5 w-5" />}
                    {type === 'other' && <Server className="h-5 w-5" />}
                  </div>
                  <h4 className="font-medium capitalize">{type} Limits</h4>
                </div>

                <div className="grid gap-4">
                  {typeMetrics.map(metric => (
                    <MetricCard
                      key={metric.id}
                      metric={metric}
                      onValueChange={(value) => handleMetricChange(metric.id, value)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Cost Impact Summary */}
        {usageMetrics.some(m => 
          m.currentPlanThreshold && 
          m.value > m.currentPlanThreshold
        ) && (
          <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-amber-600 mt-1" />
              <div>
                <h4 className="font-medium text-amber-900">Usage Exceeds Current Plan</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Your projected usage may result in additional charges. Consider upgrading to a higher tier for better value.
                </p>
              </div>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="features">
        <div className="grid gap-6">
          {featureCategories.map((category, index) => (
            <div key={index} className="bg-white/50 backdrop-blur-sm rounded-lg p-6 hover:bg-white/60 transition-all">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    {category.icon}
                  </div>
                  <h4 className="font-medium">{category.name}</h4>
                </div>
                <div className="grid gap-4">
                  {category.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium">{feature.name}</div>
                        {feature.description && (
                          <div className="text-sm text-slate-600 mt-1">{feature.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="limits">
        <div className="space-y-6">
          {/* Resource Limits */}
          <div className="grid gap-6">
            {currentPlan.limits?.users && (
              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 hover:bg-white/60 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-100/50">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">User Limits</h4>
                    <p className="text-sm text-slate-600">
                      {currentPlan.limits.users.description || "Manage your team size"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-slate-50/50 rounded-lg p-4">
                    <div className="text-sm text-slate-600">Minimum Users</div>
                    <div className="text-lg font-medium">
                      {currentPlan.limits.users.min || "No minimum"}
                    </div>
                  </div>
                  <div className="bg-slate-50/50 rounded-lg p-4">
                    <div className="text-sm text-slate-600">Maximum Users</div>
                    <div className="text-lg font-medium">
                      {currentPlan.limits.users.max || "Unlimited"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Storage */}
            {currentPlan.limits?.storage && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Database className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <h4 className="font-medium">Storage Limits</h4>
                      <p className="text-sm text-slate-500">
                        {currentPlan.limits.storage.description || "Manage your storage capacity"}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50">
                    <div className="text-sm text-slate-600">Storage Capacity</div>
                    <div className="text-lg font-medium">
                      {currentPlan.limits.storage.amount} {currentPlan.limits.storage.unit}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* API Limits */}
            {currentPlan.limits?.api && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-100">
                      <Zap className="h-5 w-5 text-yellow-700" />
                    </div>
                    <div>
                      <h4 className="font-medium">API Limits</h4>
                      <p className="text-sm text-slate-500">
                        Manage your API usage and quotas
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {currentPlan.limits.api.rate && (
                      <div className="p-4 rounded-lg bg-slate-50">
                        <div className="text-sm text-slate-600">Rate Limit</div>
                        <div className="text-lg font-medium">
                          {currentPlan.limits.api.rate.amount} / {currentPlan.limits.api.rate.period}
                        </div>
                        {currentPlan.limits.api.rate.description && (
                          <p className="text-sm text-slate-500 mt-1">
                            {currentPlan.limits.api.rate.description}
                          </p>
                        )}
                      </div>
                    )}

                    {currentPlan.limits.api.quota && (
                      <div className="p-4 rounded-lg bg-slate-50">
                        <div className="text-sm text-slate-600">API Quota</div>
                        <div className="text-lg font-medium">
                          {currentPlan.limits.api.quota.amount} / {currentPlan.limits.api.quota.period}
                        </div>
                        {currentPlan.limits.api.quota.description && (
                          <p className="text-sm text-slate-500 mt-1">
                            {currentPlan.limits.api.quota.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Other Limits */}
            {currentPlan.limits?.other_limits && currentPlan.limits.other_limits.length > 0 && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100">
                      <Server className="h-5 w-5 text-slate-700" />
                    </div>
                    <h4 className="font-medium">Other Limits</h4>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {currentPlan.limits.other_limits.map((limit, index) => (
                      <div key={index} className="p-4 rounded-lg bg-slate-50">
                        <div className="text-sm text-slate-600">{limit.name}</div>
                        <div className="text-lg font-medium">{limit.value}</div>
                        {limit.description && (
                          <p className="text-sm text-slate-500 mt-1">{limit.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="analytics">
        <div className="space-y-6">
          <ServiceAnalytics 
            service={service}
            selectedPlanIndex={selectedPlanIndex}
            simulatedValues={{
              ...Object.entries(localSimulatedValues).reduce((acc, [key, value]) => ({
                ...acc,
                [`${service._id}-${key.split('-')[1] || key}`]: value
              }), {}),
              ...Object.entries(simulatedValues).reduce((acc, [key, value]) => ({
                ...acc,
                [`${service._id}-${key.split('-')[1] || key}`]: value
              }), {})
            }}
          />
        </div>
      </TabsContent>
    </Tabs>
  )
} 