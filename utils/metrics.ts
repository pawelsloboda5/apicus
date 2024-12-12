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

    // API Quota
    if (currentPlan.limits.api.quota) {
      metrics.push(createMetric({
        id: `${service._id}-api-quota`,
        name: "API Quota",
        value: 0,
        unit: `requests/${currentPlan.limits.api.quota.period || "month"}`,
        type: METRIC_TYPES.API,
        currentLimit: currentPlan.limits.api.quota.amount,
        nextLimit: nextPlan?.limits?.api?.quota?.amount,
        description: currentPlan.limits.api.quota.description || "Monthly API request quota",
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
      const metricId = limit.name.toLowerCase().replace(/\s+/g, '-')
      const isAiSurveyMetric = metricId.includes('ai-survey')

      // Find the corresponding limit in the next plan
      const nextLimit = nextPlan?.limits?.other_limits?.find(
        (l: any) => l.name === limit.name
      )
      const nextLimitValue = nextLimit ? parseLimit(nextLimit.value).value : null
      const currentLimitValue = value === 'unlimited' ? null : parseFloat(value.toString())
      const nextLimitNumValue = nextLimitValue === 'unlimited' ? null : parseFloat(nextLimitValue?.toString() || '0')

      metrics.push(createMetric({
        id: `${service._id}-${metricId}`,
        name: limit.name,
        value: 0, // Start at 0 for usage metrics
        unit: isAiSurveyMetric ? 'requests/year' : (limit.unit || unit || 'units'),
        type: METRIC_TYPES.OTHER,
        currentLimit: currentLimitValue,
        nextLimit: nextLimitNumValue,
        description: limit.description,
        period: isAiSurveyMetric ? 'year' : period,
        service,
        currentPlan,
        displayValue: isAiSurveyMetric ? formatMetricValue(currentLimitValue || 0) : undefined,
        displayLimit: isAiSurveyMetric ? formatMetricValue(nextLimitNumValue || 0) : undefined
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
  displayValue?: string
  displayLimit?: string
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
  currentPlan,
  displayValue,
  displayLimit
}: MetricParams): UsageMetric {
  const isUnlimited = !currentLimit
  const nextPlanIndex = service.enhanced_data.plans.findIndex(p => p.name === currentPlan.name) + 1
  const nextPlan = service.enhanced_data.plans[nextPlanIndex]
  const currentPrice = currentPlan.pricing?.monthly?.base_price || 0
  const nextPrice = nextPlan?.pricing?.monthly?.base_price || 0
  
  // Calculate the difference between tiers safely
  const tierDifference = (nextLimit ?? currentLimit ?? 0) - (currentLimit ?? 0)
  const overageRate = nextPlan && tierDifference > 0 ? 
    (nextPrice - currentPrice) / tierDifference : 
    0

  return {
    id,
    name,
    value,
    unit,
    type,
    currentPlanThreshold: currentLimit,
    basePrice: currentPrice,
    serviceName: service.metadata.service_name,
    planName: currentPlan.name,
    description,
    period,
    isUnlimited,
    nextPlan: nextPlan ? {
      name: nextPlan.name,
      limit: nextLimit,
      price: nextPrice
    } : undefined,
    costInfo: {
      basePrice: currentPrice,
      includedUnits: currentLimit ?? 0,
      overageRate,
      billingPeriod: 'monthly'
    },
    displayValue,
    displayLimit
  }
}

function parseLimit(value: string | number): { value: number | 'unlimited', unit?: string, period?: string } {
  if (!value || value.toString().toLowerCase() === 'unlimited') {
    return { value: 'unlimited' }
  }

  const strValue = value.toString()
  const match = strValue.match(/^(\d+(?:\.\d+)?)\s*([^/\s]+)?(?:\/(\w+))?$/)
  
  if (match) {
    const numValue = parseFloat(match[1])
    return {
      value: isNaN(numValue) ? 0 : numValue,
      unit: match[2],
      period: match[3]
    }
  }

  const numValue = parseFloat(strValue)
  return {
    value: isNaN(numValue) ? 0 : numValue
  }
}

export function calculateOverageCost(metric: UsageMetric): number {
  if (!metric.currentPlanThreshold || !metric.nextPlan?.limit || !metric.nextPlan.price) return 0
  
  const overageUnits = Math.max(0, metric.value - metric.currentPlanThreshold)
  
  // If exceeding current tier
  if (overageUnits > 0) {
    const nextTierPrice = metric.nextPlan.price
    
    // If value exceeds next tier's limit
    if (metric.value > metric.nextPlan.limit) {
      // Calculate how many tier jumps are needed
      const tierMultiplier = Math.ceil(metric.value / metric.nextPlan.limit)
      return Math.min(nextTierPrice * tierMultiplier, 9999)
    }
    
    // Always return full next tier price when any limit is exceeded
    return nextTierPrice
  }
  
  return 0
}

function formatMetricValue(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`
  }
  return value.toString()
} 