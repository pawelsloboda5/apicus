"use client"

import { Service } from "@/types/service"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { extractServiceMetrics } from "@/utils/metrics"
import { ServiceMetric } from "@/types/analytics"
import { 
  AlertTriangle, Users, Database, Zap, Server,
  BarChart2, Activity, Clock, Globe, Shield,
  CpuIcon, NetworkIcon, HardDriveIcon, GitBranchIcon,
  ContainerIcon, CloudIcon, MonitorIcon, CreditCard, TrendingUp, DollarSign
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useMemo } from "react"

interface ServiceAnalyticsProps {
  service: Service
  selectedPlanIndex: number
  simulatedValues: Record<string, number>
}

interface CostBreakdown {
  serviceName: string
  baseCost: number
  usageCost: number
  overageCost: number
  total: number
  details?: {
    usageItems: Array<{
      name: string
      cost: number
      unit: string
      quantity: number
      rate: number
    }>
    overageItems: Array<{
      name: string
      cost: number
      exceeded: number
      limit: number
      unit: string
    }>
  }
}

const METRIC_CATEGORIES = {
  compute: {
    icon: <CpuIcon className="h-5 w-5" />,
    color: '#3b82f6',
    label: 'Compute Resources'
  },
  storage: {
    icon: <HardDriveIcon className="h-5 w-5" />,
    color: '#8b5cf6',
    label: 'Storage & Data'
  },
  network: {
    icon: <NetworkIcon className="h-5 w-5" />,
    color: '#10b981',
    label: 'Network & CDN'
  },
  api: {
    icon: <Globe className="h-5 w-5" />,
    color: '#f59e0b',
    label: 'API & Integration'
  },
  security: {
    icon: <Shield className="h-5 w-5" />,
    color: '#ef4444',
    label: 'Security & Compliance'
  },
  monitoring: {
    icon: <Activity className="h-5 w-5" />,
    color: '#6366f1',
    label: 'Monitoring & Logs'
  }
}

export function ServiceAnalytics({ service, selectedPlanIndex, simulatedValues }: ServiceAnalyticsProps): JSX.Element {
  const currentPlan = service.enhanced_data.plans[selectedPlanIndex]
  const nextPlan = service.enhanced_data.plans[selectedPlanIndex + 1]
  const priorPlan = service.enhanced_data.plans[selectedPlanIndex - 1]

  // Calculate metrics using extractServiceMetrics like StackAnalytics
  const allMetrics = useMemo(() => {
    const metrics = extractServiceMetrics(service, currentPlan, nextPlan)
    return metrics.map(metric => ({
      ...metric,
      value: simulatedValues[`${service._id}-${metric.id.split('-')[1]}`] ?? metric.value
    }))
  }, [service, currentPlan, nextPlan, simulatedValues])

  // Group metrics by type like StackAnalytics
  const metricsByType = useMemo(() => 
    allMetrics.reduce<Record<string, ServiceMetric[]>>((acc, metric) => {
      const type = metric.type || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(metric)
      return acc
    }, {}),
    [allMetrics]
  )

  // Calculate costs using same logic as StackAnalytics
  const costBreakdown = useMemo(() => {
    const baseCost = currentPlan.pricing?.monthly?.base_price || 0
    
    // Filter metrics that have exceeded their thresholds
    const overageMetrics = allMetrics.filter(metric => 
      metric.currentPlanThreshold && metric.value > metric.currentPlanThreshold
    )
    
    // Calculate usage-based costs
    const usageItems = allMetrics
      .filter(metric => metric.costPerUnit && metric.value > 0)
      .map(metric => {
        const usedUnits = Math.min(metric.value, metric.currentPlanThreshold || 0)
        const rate = metric.costPerUnit || 0
        return {
          name: metric.name,
          cost: usedUnits * rate,
          unit: metric.unit || 'units',
          quantity: usedUnits,
          rate
        }
      })
    
    const usageCost = usageItems.reduce((sum, item) => sum + item.cost, 0)
    
    // Calculate overage costs - only charge one tier up if any metric exceeds its limit
    const overageItems = overageMetrics.map(metric => {
      const exceeded = metric.value - (metric.currentPlanThreshold || 0)
      return {
        name: metric.name,
        cost: 0, // We'll set the actual cost below
        exceeded,
        limit: metric.currentPlanThreshold || 0,
        unit: metric.unit || 'units'
      }
    })

    // If any metric exceeds its limit, charge one tier up
    const overageCost = overageMetrics.length > 0 && nextPlan
      ? nextPlan.pricing?.monthly?.base_price - baseCost
      : 0

    // Distribute the overage cost among the exceeded metrics for display purposes
    const overageItemsWithCost = overageItems.map(item => ({
      ...item,
      cost: overageMetrics.length > 0 ? overageCost / overageMetrics.length : 0
    }))

    return {
      serviceName: service.metadata.service_name,
      baseCost,
      usageCost,
      overageCost,
      total: baseCost + usageCost + overageCost,
      details: {
        usageItems,
        overageItems: overageItemsWithCost
      }
    }
  }, [service, currentPlan, nextPlan, allMetrics])

  return (
    <div className="space-y-8">
      {/* Top Summary Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Cost Overview Card - Spans 4 columns on large screens */}
        <Card className="lg:col-span-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Total Cost</h3>
              <div className="mt-2 text-3xl font-bold text-blue-700">
                ${costBreakdown.total.toFixed(2)}
                <span className="text-sm font-normal text-blue-600">/mo</span>
              </div>
              {costBreakdown.overageCost > 0 && (
                <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  +${costBreakdown.overageCost.toFixed(2)} overage
                </div>
              )}
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/80 shadow-sm">
              <div className="text-blue-600 text-sm">Base Plan</div>
              <div className="font-semibold text-lg">${costBreakdown.baseCost.toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-lg bg-white/80 shadow-sm">
              <div className="text-blue-600 text-sm">Usage Cost</div>
              <div className="font-semibold text-lg">${(costBreakdown.usageCost + costBreakdown.overageCost).toFixed(2)}</div>
            </div>
          </div>
        </Card>

        {/* Resource Overview Cards - Spans 8 columns on large screens */}
        <div className="lg:col-span-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Object.entries(metricsByType).map(([type, metrics]) => {
            const category = METRIC_CATEGORIES[type as keyof typeof METRIC_CATEGORIES]
            if (!category) return null

            const totalUsage = metrics.reduce((sum, m) => sum + m.value, 0)
            const totalLimit = metrics.reduce((sum, m) => sum + (m.currentPlanThreshold || 0), 0)
            const percentage = totalLimit ? (totalUsage / totalLimit) * 100 : 0

            return (
              <Card key={type} className="relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-2 rounded-lg",
                      `bg-${type}-100`
                    )}>
                      {category.icon}
                    </div>
                    <h3 className="font-medium text-sm">{category.label}</h3>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-600">Utilization</span>
                      <span className={cn(
                        "font-medium",
                        percentage > 90 ? "text-red-600" :
                        percentage > 75 ? "text-yellow-600" :
                        "text-green-600"
                      )}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={cn(
                        "h-1.5",
                        percentage > 90 ? "bg-red-100 [&>div]:bg-red-500" :
                        percentage > 75 ? "bg-yellow-100 [&>div]:bg-yellow-500" :
                        "bg-blue-100 [&>div]:bg-blue-500"
                      )}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-slate-500">Current</div>
                      <div className="font-medium mt-0.5">{totalUsage.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Limit</div>
                      <div className="font-medium mt-0.5">{totalLimit.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                
                {/* Background Pattern */}
                <div 
                  className="absolute inset-0 opacity-[0.03]" 
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l7.9-7.9h-.828zm5.656 0L19.515 8.485 17.343 10.657 28 0h-2.83zM32.656 0L26.172 6.485 24 8.657 34.657 0h-2zM44.97 0L40.5 4.472 42.672 6.644l6.644-6.644h-2.83zM39.313 0L42.97 3.657 40.8 5.828 34.156 0h2.83zM56 0L58.172 2.172 56 4.344V0zM0 2.172L2.172 0h2.172L0 4.344V2.172zM8.485 0h2.172L14.828 4.17 10.657 8.343 8.485 0zm17.657 0h2.172L34.656 6.343 30.485 10.514 26.142 0zM46.828 0h2.172L56 6.344 51.828 10.514 46.828 0zM2.172 0L0 5.172V0h2.172zM0 8.485L5.172 0h2.172L0 14.657V8.485zm0 5.657L8.485 0h2.172L0 20.314v-6.172zm0 5.657L14.142 0h2.172L0 25.97v-6.17zm0 5.657L19.8 0h2.172L0 31.627v-6.17zm0 5.657L25.456 0h2.172L0 37.285v-6.17zm0 5.657L31.113 0h2.172L0 42.942v-6.17zm0 5.657L36.77 0h2.172L0 48.6v-6.17zm0 5.657L42.428 0h2.172L0 54.257v-6.17zm0 5.657L48.085 0h2.172L0 59.914v-6.17zm0 5.657L53.742 0h2.172L0 60v-4.343zM60 14.828L45.172 0h-2.172L60 8.657v6.17zm0-5.656L39.515 0h-2.172L60 2.828v6.344zm0-5.657L33.858 0h-2.172L60 0v3.515zm0 17.142L50.828 0h-2.172L60 20.485v-5.656zM39.515 0L60 26.172v5.657L33.858 0h5.657zm11.313 0L60 31.828v5.657L45.172 0h5.656zm5.657 0L60 37.485v5.657L50.828 0h5.657zm-22.627 0L60 43.142v5.657L39.515 0h5.656zm11.313 0L60 48.8v5.657L45.172 0h5.656zm5.657 0L60 54.456v5.657L50.828 0h5.657zm-22.627 0L60 60v-5.657L39.515 0h5.656z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`
                  }}
                />
              </Card>
            )
          })}
        </div>
      </div>

      {/* Detailed Analysis Tabs */}
      <Card className="p-6">
        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="inline-flex h-auto p-1 bg-slate-100 rounded-lg space-x-2">
            <TabsTrigger value="metrics" className="px-4 py-2 rounded-md data-[state=active]:bg-white">
              <Activity className="h-4 w-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="resources" className="px-4 py-2 rounded-md data-[state=active]:bg-white">
              <CpuIcon className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="costs" className="px-4 py-2 rounded-md data-[state=active]:bg-white">
              <DollarSign className="h-4 w-4 mr-2" />
              Cost Analysis
            </TabsTrigger>
            <TabsTrigger value="optimization" className="px-4 py-2 rounded-md data-[state=active]:bg-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Optimization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics">
            <div className="space-y-8">
              {/* Metric Groups */}
              {Object.entries(metricsByType).map(([type, metrics]) => (
                <div key={type} className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2 text-lg">
                    {METRIC_CATEGORIES[type as keyof typeof METRIC_CATEGORIES]?.icon}
                    {METRIC_CATEGORIES[type as keyof typeof METRIC_CATEGORIES]?.label}
                  </h4>
                  
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {metrics.map(metric => {
                      const percentage = metric.currentPlanThreshold 
                        ? (metric.value / metric.currentPlanThreshold) * 100 
                        : 0

                      return (
                        <Card key={metric.id} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-medium">{metric.name}</h5>
                              <p className="text-sm text-slate-600 mt-0.5">{metric.description}</p>
                            </div>
                            <Badge variant={percentage > 90 ? "destructive" : "secondary"}>
                              {percentage.toFixed(1)}%
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <Progress 
                              value={percentage}
                              className={cn(
                                "h-1.5",
                                percentage > 90 ? "bg-red-100 [&>div]:bg-red-500" :
                                percentage > 75 ? "bg-yellow-100 [&>div]:bg-yellow-500" :
                                "bg-blue-100 [&>div]:bg-blue-500"
                              )}
                            />
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">
                                {metric.displayValue || metric.value.toLocaleString()} / {metric.displayLimit || metric.currentPlanThreshold?.toLocaleString() || '∞'} {metric.unit}
                              </span>
                              {percentage > 90 && (
                                <span className="text-red-600 flex items-center gap-1">
                                  <AlertTriangle className="h-4 w-4" />
                                  Critical
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div className="space-y-6">
              {['compute', 'storage', 'network'].map(type => (
                <div key={type} className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    {METRIC_CATEGORIES[type as keyof typeof METRIC_CATEGORIES]?.icon}
                    {METRIC_CATEGORIES[type as keyof typeof METRIC_CATEGORIES]?.label}
                  </h4>
                  
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metricsByType[type] || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          fill={METRIC_CATEGORIES[type as keyof typeof METRIC_CATEGORIES]?.color} 
                          stroke={METRIC_CATEGORIES[type as keyof typeof METRIC_CATEGORIES]?.color}
                          fillOpacity={0.2}
                          name="Usage" 
                        />
                        <Area
                          type="monotone"
                          dataKey="currentPlanThreshold"
                          stroke="#94a3b8"
                          strokeDasharray="5 5"
                          fill="none"
                          name="Limit"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="costs">
            <div className="space-y-6">
              {/* Cost Breakdown */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-white">
                      <CreditCard className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium">Base Cost</div>
                      <div className="text-2xl font-bold">${costBreakdown.baseCost.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    Fixed monthly cost for the current plan
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-white">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Usage Cost</div>
                      <div className="text-2xl font-bold">${costBreakdown.usageCost.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    Variable costs based on resource usage
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-red-50 to-orange-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-white">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">Overage Cost</div>
                      <div className="text-2xl font-bold">${costBreakdown.overageCost.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    Additional charges for exceeding limits
                  </div>
                </Card>
              </div>

              {/* Cost Details */}
              <Card className="p-6">
                <h4 className="font-medium mb-4">Cost Details</h4>
                <div className="space-y-4">
                  {costBreakdown.details?.overageItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-slate-600">
                          Exceeded by {item.exceeded.toLocaleString()} {item.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600">+${item.cost.toFixed(2)}</div>
                        <div className="text-sm text-slate-600">
                          Limit: {item.limit.toLocaleString()} {item.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="optimization">
            <div className="space-y-6">
              {/* Optimization Recommendations */}
              {costBreakdown.overageCost > 0 && (
                <div className="grid gap-4">
                  {costBreakdown.details?.overageItems.map((item, i) => (
                    <Card key={i} className="p-6 border-yellow-200">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-yellow-100">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-900">
                            Optimize {item.name} Usage
                          </h4>
                          <p className="mt-1 text-sm text-yellow-700">
                            Current usage exceeds plan limits by {item.exceeded.toLocaleString()} {item.unit}, 
                            resulting in ${item.cost.toFixed(2)} overage charges.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-yellow-50">
                              Upgrade Plan
                            </Badge>
                            <Badge variant="outline" className="bg-yellow-50">
                              Optimize Usage
                            </Badge>
                            <Badge variant="outline" className="bg-yellow-50">
                              Set Alerts
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Resource Efficiency */}
              <Card className="p-6">
                <h4 className="font-medium mb-4">Resource Efficiency</h4>
                <div className="space-y-4">
                  {Object.entries(metricsByType).map(([type, metrics]) => {
                    const totalUsage = metrics.reduce((sum, m) => sum + m.value, 0)
                    const totalLimit = metrics.reduce((sum, m) => sum + (m.currentPlanThreshold || 0), 0)
                    const percentage = totalLimit ? (totalUsage / totalLimit) * 100 : 0

                    return (
                      <div key={type} className="p-4 rounded-lg bg-slate-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {METRIC_CATEGORIES[type as keyof typeof METRIC_CATEGORIES]?.icon}
                            <span className="font-medium">
                              {METRIC_CATEGORIES[type as keyof typeof METRIC_CATEGORIES]?.label}
                            </span>
                          </div>
                          <Badge 
                            variant={
                              percentage > 90 ? "destructive" :
                              percentage > 75 ? "outline" :
                              percentage < 30 ? "secondary" :
                              "default"
                            }
                          >
                            {percentage > 90 ? "Critical" :
                             percentage > 75 ? "Warning" :
                             percentage < 30 ? "Underutilized" :
                             "Optimal"}
                          </Badge>
                        </div>
                        <Progress 
                          value={percentage}
                          className={cn(
                            "h-2",
                            percentage > 90 ? "bg-red-100 [&>div]:bg-red-500" :
                            percentage > 75 ? "bg-yellow-100 [&>div]:bg-yellow-500" :
                            percentage < 30 ? "bg-slate-100 [&>div]:bg-slate-500" :
                            "bg-green-100 [&>div]:bg-green-500"
                          )}
                        />
                        <div className="mt-2 text-sm text-slate-600">
                          {percentage > 90 ? "Consider upgrading to avoid performance issues" :
                           percentage > 75 ? "Monitor usage closely" :
                           percentage < 30 ? "Resources may be over-provisioned" :
                           "Resource utilization is optimal"}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
