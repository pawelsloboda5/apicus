// components/ServiceDetails.tsx
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Service } from "@/types/service"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { 
  Users, Database, Zap, Server, 
  AlertCircle, CheckCircle2,
  CreditCard, TrendingUp,
  HardDrive, AlertTriangle,
  Shield, Box, 
  FileText, Mail, MessageSquare, BellRing, 
  Gauge, Cpu, Network, Lock, Key, Search,
  BarChart4, LineChart, Share2,
  Info, Building2, Target, Coins,
  Globe,
  Webhook,
  Workflow
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { extractServiceMetrics } from "@/utils/metrics"
import { ServiceAnalytics } from "@/components/ServiceAnalytics"
import { UsageMetric } from "@/types/analytics"

interface ServiceDetailsProps {
  service: Service
  selectedPlanIndex: number
  onPlanChange: (index: number) => void
  onMetricChange?: (metricId: string, value: number) => void
  simulatedValues?: Record<string, number>
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

function getFeatureIcon(featureName: string): JSX.Element {
  const name = featureName.toLowerCase()
  if (name.includes('storage')) return <Database className="h-4 w-4" />
  if (name.includes('user')) return <Users className="h-4 w-4" />
  if (name.includes('api')) return <Webhook className="h-4 w-4" />
  if (name.includes('security')) return <Shield className="h-4 w-4" />
  if (name.includes('backup')) return <HardDrive className="h-4 w-4" />
  if (name.includes('analytics')) return <BarChart4 className="h-4 w-4" />
  if (name.includes('monitoring')) return <Gauge className="h-4 w-4" />
  if (name.includes('notification')) return <BellRing className="h-4 w-4" />
  if (name.includes('integration')) return <Workflow className="h-4 w-4" />
  if (name.includes('report')) return <FileText className="h-4 w-4" />
  if (name.includes('email')) return <Mail className="h-4 w-4" />
  if (name.includes('chat')) return <MessageSquare className="h-4 w-4" />
  if (name.includes('performance')) return <Cpu className="h-4 w-4" />
  if (name.includes('network')) return <Network className="h-4 w-4" />
  if (name.includes('authentication')) return <Lock className="h-4 w-4" />
  if (name.includes('search')) return <Search className="h-4 w-4" />
  if (name.includes('chart')) return <LineChart className="h-4 w-4" />
  if (name.includes('access')) return <Key className="h-4 w-4" />
  if (name.includes('sharing')) return <Share2 className="h-4 w-4" />
  return <Box className="h-4 w-4" />
}

// Update the utility function with proper typing
const isValidArray = <T,>(arr: T[] | undefined | null): arr is T[] => {
  return Array.isArray(arr) && arr.length > 0
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

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="usage">Usage</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="limits">Limits</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="insights">Insights</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-6">
          {/* Service Info */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-lg font-semibold">{service.metadata.service_name}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Last updated: {service.metadata.last_updated || 'N/A'}
                  </p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium">Pricing Types</div>
                    <div className="flex gap-2 mt-1">
                      {service.metadata.pricing_types.map((type, i) => (
                        <Badge key={i} variant="secondary">{type}</Badge>
                      ))}
                    </div>
                  </div>
                  {service.metadata.regions && (
                    <div>
                      <div className="text-sm font-medium">Available Regions</div>
                      <div className="flex gap-2 mt-1">
                        {service.metadata.regions.map((region, i) => (
                          <Badge key={i} variant="outline">{region}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {service.enhanced_data.service_info.url && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Globe className="h-4 w-4" />
                    <a href={service.enhanced_data.service_info.url} target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </Card>

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
        <div className="space-y-8">
          {/* Current Plan Features */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Current Plan Features
            </h3>
            <p className="text-sm text-blue-700 mb-6">
              Features included in your {currentPlan.name} plan
            </p>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {currentPlan.features.categories?.map((category, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm hover:shadow-md transition-all">
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        category.name.toLowerCase().includes('security') ? "bg-red-100" :
                        category.name.toLowerCase().includes('storage') ? "bg-purple-100" :
                        category.name.toLowerCase().includes('api') ? "bg-yellow-100" :
                        "bg-blue-100"
                      )}>
                        {getFeatureIcon(category.name)}
                      </div>
                      <h4 className="font-medium">{category.name}</h4>
                    </div>
                    
                    <div className="space-y-2">
                      {category.features?.map((feature, featureIndex) => (
                        <div key={featureIndex} 
                          className="flex items-start gap-2 p-2 rounded-md hover:bg-slate-50 transition-colors"
                        >
                          <div className="mt-1">
                            {getFeatureIcon(feature.name || 'default')}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{feature.name}</div>
                            {feature.description && (
                              <div className="text-xs text-slate-600 mt-0.5">{feature.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Next Tier Features */}
          {nextPlan && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Available in {nextPlan.name}
                  </h3>
                  <p className="text-sm text-green-700">
                    Additional features youll get by upgrading
                  </p>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  Next Tier
                </Badge>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {nextPlan.features.categories?.map((category, index) => {
                  // Filter to show only new features not in current plan
                  const currentFeatures = new Set(
                    currentPlan.features.categories
                      ?.find(c => c.name === category.name)
                      ?.features?.map(f => f.name) || []
                  )
                  const newFeatures = category.features?.filter(f => !currentFeatures.has(f.name))
                  if (!newFeatures?.length) return null

                  return (
                    <Card key={index} className="bg-white/80 backdrop-blur-sm hover:shadow-md transition-all">
                      <div className="p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            category.name.toLowerCase().includes('security') ? "bg-red-100" :
                            category.name.toLowerCase().includes('storage') ? "bg-purple-100" :
                            category.name.toLowerCase().includes('api') ? "bg-yellow-100" :
                            "bg-green-100"
                          )}>
                            {getFeatureIcon(category.name)}
                          </div>
                          <h4 className="font-medium">{category.name}</h4>
                        </div>
                        
                        <div className="space-y-2">
                          {newFeatures.map((feature, featureIndex) => (
                            <div key={featureIndex} 
                              className="flex items-start gap-2 p-2 rounded-md hover:bg-slate-50 transition-colors"
                            >
                              <div className="mt-1">
                                {getFeatureIcon(feature.name || 'default')}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{feature.name}</div>
                                {feature.description && (
                                  <div className="text-xs text-slate-600 mt-0.5">{feature.description}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Previous Tier Features */}
          {selectedPlanIndex > 0 && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Included Base Features
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Core features available in all plans
              </p>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {service.enhanced_data.plans[0].features.categories?.map((category, index) => (
                  <Card key={index} className="bg-white/90 backdrop-blur-sm">
                    <div className="p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100">
                          {getFeatureIcon(category.name)}
                        </div>
                        <h4 className="font-medium">{category.name}</h4>
                      </div>
                      
                      <div className="space-y-2">
                        {category.features?.map((feature, featureIndex) => (
                          <div key={featureIndex} 
                            className="flex items-start gap-2 p-2 rounded-md"
                          >
                            <div className="mt-1">
                              {getFeatureIcon(feature.name || 'default')}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{feature.name}</div>
                              {feature.description && (
                                <div className="text-xs text-slate-600 mt-0.5">{feature.description}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
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

      <TabsContent value="insights">
        <div className="space-y-6">
          {/* Market Insights */}
          {service.enhanced_data.market_insights && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold">Market Insights</h3>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {service.enhanced_data.market_insights.target_market && (
                  <div>
                    <div className="text-sm font-medium mb-2">Target Market</div>
                    <p className="text-sm text-slate-600">
                      {service.enhanced_data.market_insights.target_market}
                    </p>
                  </div>
                )}

                {service.enhanced_data.market_insights.common_use_cases && (
                  <div>
                    <div className="text-sm font-medium mb-2">Common Use Cases</div>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      {service.enhanced_data.market_insights.common_use_cases.map((useCase, i) => (
                        <li key={i}>{useCase}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {service.enhanced_data.market_insights.growth_trends && (
                  <div className="sm:col-span-2">
                    <div className="text-sm font-medium mb-2">Growth Trends</div>
                    <p className="text-sm text-slate-600">
                      {service.enhanced_data.market_insights.growth_trends}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Competitive Analysis */}
          {service.enhanced_data.competitive_positioning && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold">Competitive Analysis</h3>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {service.enhanced_data.competitive_positioning.direct_competitors && (
                  <div>
                    <div className="text-sm font-medium mb-2">Direct Competitors</div>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      {service.enhanced_data.competitive_positioning.direct_competitors.map((competitor, i) => (
                        <li key={i}>{competitor}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {service.enhanced_data.competitive_positioning?.competitive_advantages && 
                  isValidArray(service.enhanced_data.competitive_positioning.competitive_advantages) && (
                  <div>
                    <div className="text-sm font-medium mb-2 text-green-700">Advantages</div>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      {service.enhanced_data.competitive_positioning.competitive_advantages.map((advantage, i) => (
                        <li key={i}>{advantage}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {service.enhanced_data.competitive_positioning?.competitive_disadvantages && 
                  isValidArray(service.enhanced_data.competitive_positioning.competitive_disadvantages) && (
                  <div>
                    <div className="text-sm font-medium mb-2 text-red-700">Disadvantages</div>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      {service.enhanced_data.competitive_positioning.competitive_disadvantages.map((disadvantage, i) => (
                        <li key={i}>{disadvantage}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {service.enhanced_data.competitive_positioning.market_position && (
                  <div>
                    <div className="text-sm font-medium mb-2">Market Position</div>
                    <p className="text-sm text-slate-600">
                      {service.enhanced_data.competitive_positioning.market_position}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Additional Information */}
          {service.enhanced_data.additional_info && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-100">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold">Additional Information</h3>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Billing Terms */}
                {service.enhanced_data.additional_info.billing_terms && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Billing Frequency</div>
                      <div className="flex gap-2">
                        {service.enhanced_data.additional_info.billing_terms.billing_frequency?.map((freq, i) => (
                          <Badge key={i} variant="outline">{freq}</Badge>
                        ))}
                      </div>
                    </div>

                    {service.enhanced_data.additional_info.billing_terms.minimum_commitment && (
                      <div>
                        <div className="text-sm font-medium mb-2">Minimum Commitment</div>
                        <p className="text-sm text-slate-600">
                          {service.enhanced_data.additional_info.billing_terms.minimum_commitment.amount} {service.enhanced_data.additional_info.billing_terms.minimum_commitment.duration}
                        </p>
                      </div>
                    )}

                    {service.enhanced_data.additional_info.billing_terms.payment_methods && (
                      <div>
                        <div className="text-sm font-medium mb-2">Payment Methods</div>
                        <div className="flex gap-2">
                          {service.enhanced_data.additional_info.billing_terms.payment_methods.map((method, i) => (
                            <Badge key={i} variant="secondary">{method}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Cancellation Terms */}
                {service.enhanced_data.additional_info.cancellation_terms && (
                  <div className="space-y-4">
                    {service.enhanced_data.additional_info.cancellation_terms.notice_period && (
                      <div>
                        <div className="text-sm font-medium mb-2">Notice Period</div>
                        <p className="text-sm text-slate-600">
                          {service.enhanced_data.additional_info.cancellation_terms.notice_period}
                        </p>
                      </div>
                    )}

                    {service.enhanced_data.additional_info.cancellation_terms.refund_policy && (
                      <div>
                        <div className="text-sm font-medium mb-2">Refund Policy</div>
                        <p className="text-sm text-slate-600">
                          {service.enhanced_data.additional_info.cancellation_terms.refund_policy}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Notes */}
                {service.enhanced_data.additional_info.notes && (
                  <div className="sm:col-span-2">
                    <div className="text-sm font-medium mb-2">Additional Notes</div>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      {service.enhanced_data.additional_info.notes.map((note, i) => (
                        <li key={i}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Discounts */}
          {service.enhanced_data.discounts && service.enhanced_data.discounts.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Coins className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="font-semibold">Available Discounts</h3>
              </div>

              <div className="grid gap-4">
                {service.enhanced_data.discounts.map((discount, i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{discount.type}</div>
                        <p className="text-sm text-slate-600 mt-1">{discount.description}</p>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        {discount.amount}
                      </Badge>
                    </div>
                    {discount.conditions && (
                      <div className="mt-2 text-xs text-slate-500">
                        Conditions: {discount.conditions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
} 