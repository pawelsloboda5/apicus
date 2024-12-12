import { Service } from "@/types/service"
import { ServiceMetric, UsageMetric } from "@/types/analytics"

export const METRIC_TYPES = {
  USERS: 'users',
  STORAGE: 'storage',
  API: 'api',
  TIME: 'time',
  RATE: 'rate',
  QUOTA: 'quota',
  OTHER: 'other'
} as const

export function extractServiceMetrics(service: Service, currentPlan: any, nextPlan: any): UsageMetric[] {
  const metrics: UsageMetric[] = []

  if (!currentPlan?.limits) return metrics

  // Extract user limits
  if (currentPlan.limits.users) {
    metrics.push(createMetric({
      id: `${service._id}-users`,
      name: "Users",
      value: currentPlan.limits.users.min || 0,
      unit: "users",
      type: METRIC_TYPES.USERS,
      currentLimit: currentPlan.limits.users.max,
      nextLimit: nextPlan?.limits?.users?.max,
      description: currentPlan.limits.users.description || "Team member seats",
      service,
      currentPlan
    }))
  }

  // Extract storage limits
  if (currentPlan.limits.storage) {
    metrics.push(createMetric({
      id: `${service._id}-storage`,
      name: "Storage",
      value: currentPlan.limits.storage.amount || 0,
      unit: currentPlan.limits.storage.unit || "GB",
      type: METRIC_TYPES.STORAGE,
      currentLimit: currentPlan.limits.storage.amount,
      nextLimit: nextPlan?.limits?.storage?.amount,
      description: currentPlan.limits.storage.description || "Storage capacity",
      service,
      currentPlan
    }))
  }

  // Extract API limits
  if (currentPlan.limits.api) {
    // Rate limits
    if (currentPlan.limits.api.rate) {
      metrics.push(createMetric({
        id: `${service._id}-api-rate`,
        name: "API Rate",
        value: 0,
        unit: `requests/${currentPlan.limits.api.rate.period || "second"}`,
        type: METRIC_TYPES.RATE,
        currentLimit: currentPlan.limits.api.rate.amount,
        nextLimit: nextPlan?.limits?.api?.rate?.amount,
        description: currentPlan.limits.api.rate.description || "API request rate",
        period: currentPlan.limits.api.rate.period,
        service,
        currentPlan
      }))
    }

    // Quota limits
    if (currentPlan.limits.api.quota) {
      metrics.push(createMetric({
        id: `${service._id}-api-quota`,
        name: "API Quota",
        value: 0,
        unit: `requests/${currentPlan.limits.api.quota.period || "month"}`,
        type: METRIC_TYPES.QUOTA,
        currentLimit: currentPlan.limits.api.quota.amount,
        nextLimit: nextPlan?.limits?.api?.quota?.amount,
        description: currentPlan.limits.api.quota.description || "API request quota",
        period: currentPlan.limits.api.quota.period,
        service,
        currentPlan
      }))
    }
  }

  // Extract other limits
  if (currentPlan.limits.other_limits) {
    currentPlan.limits.other_limits.forEach((limit: any) => {
      const { value, unit, period } = parseLimit(limit.value)
      
      metrics.push(createMetric({
        id: `${service._id}-${limit.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: limit.name,
        value: value === 'unlimited' ? 0 : value,
        unit: limit.unit || unit,
        type: METRIC_TYPES.OTHER,
        currentLimit: value === 'unlimited' ? null : value,
        nextLimit: null, // Parse from nextPlan if needed
        description: limit.description,
        period,
        service,
        currentPlan
      }))
    })
  }

  return metrics
}

interface MetricParams {
  id: string
  name: string
  value: number
  unit?: string
  type: string
  currentLimit: number | null
  nextLimit: number | null
  description?: string
  period?: string
  service: Service
  currentPlan: any
}

function createMetric({
  id,
  name,
  value,
  unit,
  type,
  currentLimit,
  nextLimit,
  description,
  period,
  service,
  currentPlan
}: MetricParams): UsageMetric {
  const isUnlimited = !currentLimit
  const nextPlanIndex = service.enhanced_data.plans.findIndex(p => p.name === currentPlan.name) + 1
  const nextPlan = service.enhanced_data.plans[nextPlanIndex]
  
  return {
    id,
    name,
    value,
    unit,
    type,
    currentPlanThreshold: currentLimit,
    basePrice: currentPlan.pricing?.monthly?.base_price || 0,
    serviceName: service.metadata.service_name,
    planName: currentPlan.name,
    description,
    period,
    isUnlimited,
    nextPlan: nextPlan ? {
      name: nextPlan.name,
      limit: nextLimit,
      price: nextPlan.pricing?.monthly?.base_price || 0
    } : undefined,
    costInfo: {
      basePrice: currentPlan.pricing?.monthly?.base_price || 0,
      includedUnits: currentLimit || 0,
      overageRate: nextPlan ? 
        (nextPlan.pricing?.monthly?.base_price - currentPlan.pricing?.monthly?.base_price) / 
        (nextLimit! - currentLimit!) : 
        0,
      billingPeriod: 'monthly'
    },
    usageInfo: {
      current: value,
      limit: currentLimit,
      percentage: currentLimit ? (value / currentLimit) * 100 : 0,
      period
    }
  }
}

function parseLimit(value: string): { value: number | 'unlimited', unit?: string, period?: string } {
  if (value.toLowerCase() === 'unlimited') {
    return { value: 'unlimited' }
  }

  const match = value.match(/^(\d+(?:\.\d+)?)\s*([^/\s]+)?(?:\/(\w+))?$/)
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2],
      period: match[3]
    }
  }

  return { value: 0 }
} 

export function calculateOverageCost(metric: UsageMetric): number {
  if (!metric.currentPlanThreshold || !metric.nextPlan) return 0
  
  const overageUnits = Math.max(0, metric.value - metric.currentPlanThreshold)
  
  // If exceeding current tier, charge the difference to next plan
  if (overageUnits > 0) {
    return metric.nextPlan.price - metric.basePrice
  }
  
  return 0
} 