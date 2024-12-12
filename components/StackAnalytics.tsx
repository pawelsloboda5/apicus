// components/StackAnalytics.tsx
"use client"

import { Service } from "@/types/service"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { extractMetricsFromPlan } from "./analytics/utils"
import { ServiceMetric } from "@/types/analytics"
import { motion } from "framer-motion"
import { 
  DollarSign, TrendingUp, AlertTriangle, 
  Users, Database, Zap, Server,
  PieChart, BarChart2, LineChart
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useMemo } from "react"
import { extractServiceMetrics} from "@/utils/metrics"

interface StackAnalyticsProps {
  services: Service[]
  servicePlans: Array<{
    serviceId: string
    planIndex: number
  }>
  simulatedMetrics?: Record<string, number>
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

const COLORS = {
  base: '#3b82f6',
  usage: '#10b981',
  overage: '#ef4444',
  storage: '#8b5cf6',
  users: '#3b82f6',
  api: '#f59e0b',
  other: '#6b7280'
}

export function StackAnalytics({ services, servicePlans, simulatedMetrics = {} }: StackAnalyticsProps) {
  // Calculate detailed cost breakdown for each service
  const costBreakdowns = useMemo(() => services.map<CostBreakdown>(service => {
    const planState = servicePlans.find(sp => sp.serviceId === service._id)
    if (!planState) return {
      serviceName: service.metadata.service_name,
      baseCost: 0,
      usageCost: 0,
      overageCost: 0,
      total: 0
    }

    const currentPlan = service.enhanced_data.plans[planState.planIndex]
    const nextPlan = service.enhanced_data.plans[planState.planIndex + 1]
    const metrics = extractServiceMetrics(service, currentPlan, nextPlan)
    
    const baseCost = currentPlan.pricing?.monthly?.base_price || 0
    
    // Apply simulated values
    const updatedMetrics = metrics.map(metric => ({
      ...metric,
      value: simulatedMetrics[`${service._id}-${metric.id}`] ?? metric.value
    }))

    // Calculate overages for exceeded metrics
    const overageItems = updatedMetrics
      .filter(m => m.currentPlanThreshold && m.value > m.currentPlanThreshold)
      .map(m => ({
        name: m.name,
        cost: nextPlan ? nextPlan.pricing?.monthly?.base_price - baseCost : 0,
        exceeded: m.value - (m.currentPlanThreshold || 0),
        limit: m.currentPlanThreshold || 0,
        unit: m.unit || 'units'
      }))

    const overageCost = overageItems.length > 0 ? 
      (nextPlan?.pricing?.monthly?.base_price || 0) - baseCost : 0

    return {
      serviceName: service.metadata.service_name,
      baseCost,
      usageCost: 0,
      overageCost,
      total: baseCost + overageCost,
      details: {
        usageItems: [],
        overageItems
      }
    }
  }), [services, servicePlans, simulatedMetrics])

  const totalCosts = {
    base: costBreakdowns.reduce((sum, s) => sum + s.baseCost, 0),
    usage: costBreakdowns.reduce((sum, s) => sum + s.usageCost, 0),
    overage: costBreakdowns.reduce((sum, s) => sum + s.overageCost, 0),
    total: costBreakdowns.reduce((sum, s) => sum + s.total, 0)
  }

  // Prepare data for visualizations
  const costDistributionData = [
    { name: 'Base Plans', value: totalCosts.base },
    { name: 'Usage Costs', value: totalCosts.usage },
    { name: 'Overage Costs', value: totalCosts.overage }
  ]

  // Group metrics by type
  const allMetrics = useMemo(() => {
    return services.flatMap(service => {
      const planState = servicePlans.find(sp => sp.serviceId === service._id)
      if (!planState) return []

      const currentPlan = service.enhanced_data.plans[planState.planIndex]
      const nextPlan = service.enhanced_data.plans[planState.planIndex + 1]
      const metrics = extractMetricsFromPlan(service, currentPlan, nextPlan)
      
      // Apply simulated values
      return metrics.map(metric => ({
        ...metric,
        value: simulatedMetrics[metric.id] ?? metric.value
      }))
    })
  }, [services, servicePlans, simulatedMetrics])

  const metricsByType = allMetrics.reduce<Record<string, ServiceMetric[]>>(
    (acc, metric) => {
      const type = metric.type || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(metric)
      return acc
    },
    {}
  )

  return (
    <div className="space-y-6">
      {/* Cost Overview Card */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Cost Summary</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Estimated monthly costs for your tech stack
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                ${Number.isFinite(totalCosts.total) ? totalCosts.total.toFixed(2) : '∞'}
                <span className="text-sm font-normal text-slate-500">/mo</span>
              </div>
              {totalCosts.overage > 0 && (
                <div className="text-sm text-red-600 flex items-center gap-1 justify-end">
                  <AlertTriangle className="h-4 w-4" />
                  ${Number.isFinite(totalCosts.overage) ? totalCosts.overage.toFixed(2) : '∞'} in overage charges
                </div>
              )}
            </div>
          </div>

          {/* Cost Distribution */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-sm font-medium text-blue-700">Base Plans</div>
              <div className="text-xl font-bold text-blue-900 mt-1">
                ${totalCosts.base.toFixed(2)}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <div className="text-sm font-medium text-green-700">Usage-Based</div>
              <div className="text-xl font-bold text-green-900 mt-1">
                ${totalCosts.usage.toFixed(2)}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-100">
              <div className="text-sm font-medium text-red-700">Overage Charges</div>
              <div className="text-xl font-bold text-red-900 mt-1">
                ${totalCosts.overage.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Service Breakdown */}
          <div className="space-y-4">
            {costBreakdowns.map(service => (
              <Collapsible key={service.serviceName}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <Server className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-medium">{service.serviceName}</div>
                        <div className="text-sm text-slate-500">
                          Base Plan + {service.details?.usageItems.length || 0} usage-based features
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${service.total.toFixed(2)}</div>
                      {service.overageCost > 0 && (
                        <div className="text-sm text-red-600">
                          +${service.overageCost.toFixed(2)} overage
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 pb-4">
                    <div className="space-y-4 mt-2 pl-12">
                      {/* Base Cost */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Base Plan</span>
                        <span className="font-medium">${service.baseCost.toFixed(2)}</span>
                      </div>

                      {/* Usage-Based Costs */}
                      {service.details?.usageItems.map((item, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">{item.name}</span>
                            <span className="font-medium">${item.cost.toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.quantity.toLocaleString()} {item.unit} × ${item.rate}/unit
                          </div>
                        </div>
                      ))}

                      {/* Overage Costs */}
                      {service.details?.overageItems.map((item, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-red-600">{item.name} (Overage)</span>
                            <span className="font-medium text-red-600">
                              +${item.cost.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-red-500">
                            Exceeded by {item.exceeded.toLocaleString()} {item.unit}
                            (Limit: {item.limit.toLocaleString()})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </Card>

      {/* Resource Usage Analysis */}
      <Card className="p-6">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="api">API Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {Object.entries(metricsByType).map(([type, metrics]) => {
                const color = COLORS[type as keyof typeof COLORS] || COLORS.other
                const totalUsage = metrics.reduce((sum, m) => sum + m.value, 0)
                const totalLimit = metrics.reduce((sum, m) => sum + (m.currentPlanThreshold || 0), 0)
                const percentage = totalLimit ? (totalUsage / totalLimit) * 100 : 0

                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-2 rounded-lg",
                          type === 'storage' && "bg-purple-100",
                          type === 'users' && "bg-blue-100",
                          type === 'api' && "bg-yellow-100",
                          type === 'other' && "bg-slate-100"
                        )}>
                          {type === 'storage' && <Database className="h-5 w-5" />}
                          {type === 'users' && <Users className="h-5 w-5" />}
                          {type === 'api' && <Zap className="h-5 w-5" />}
                          {type === 'other' && <Server className="h-5 w-5" />}
                        </div>
                        <span className="font-medium capitalize">{type}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          percentage > 90 && "bg-red-50 text-red-700",
                          percentage > 75 && percentage <= 90 && "bg-yellow-50 text-yellow-700",
                          percentage <= 75 && "bg-green-50 text-green-700"
                        )}
                      >
                        {percentage.toFixed(1)}% utilized
                      </Badge>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={cn(
                        "h-2",
                        percentage > 90 && "bg-red-100 [&>div]:bg-red-500",
                        percentage > 75 && percentage <= 90 && "bg-yellow-100 [&>div]:bg-yellow-500",
                        percentage <= 75 && "bg-green-100 [&>div]:bg-green-500"
                      )}
                    />
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="storage">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricsByType.storage || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="serviceName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS.storage} name="Current Usage" />
                  <Bar dataKey="currentPlanThreshold" fill={COLORS.base} name="Limit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricsByType.users || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="serviceName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS.users} name="Current Usage" />
                  <Bar dataKey="currentPlanThreshold" fill={COLORS.base} name="Limit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="api">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricsByType.api || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="serviceName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS.api} name="Current Usage" />
                  <Bar dataKey="currentPlanThreshold" fill={COLORS.base} name="Limit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Cost Optimization Recommendations */}
      {totalCosts.overage > 0 && (
        <Card className="p-6 border-yellow-200 bg-yellow-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1" />
            <div>
              <h4 className="font-medium text-yellow-900">Cost Optimization Opportunities</h4>
              <div className="mt-2 space-y-2">
                {costBreakdowns
                  .filter(s => s.overageCost > 0)
                  .map(service => (
                    <div key={service.serviceName} className="text-sm text-yellow-800">
                      Consider upgrading {service.serviceName} to avoid ${service.overageCost.toFixed(2)} in overage charges
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
} 