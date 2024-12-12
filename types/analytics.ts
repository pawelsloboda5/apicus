import type { Service } from "@/types/service"

export interface ServiceMetric {
  id: string
  name: string
  value: number
  unit?: string
  type: 'users' | 'storage' | 'api' | 'requests' | 'rate' | 'usage' | 'execution' | 'credits' | 'channels' | string
  currentPlanThreshold: number | null
  basePrice: number
  serviceName: string
  planName: string
  costPerUnit?: number
  period?: string
  nextPlan?: {
    name: string
    limit: number | null
    price: number
  }
  priorPlan?: {
    name: string
    limit: number | null
    price: number
  }
  displayConditions?: {
    requiresValue?: boolean
    requiresThreshold?: boolean
    requiresCostPerUnit?: boolean
  }
  description?: string
  isUnlimited?: boolean
  currentLimit?: number | null
  nextTierLimit?: number | null
  serviceSpecific?: {
    description?: string
    warningThreshold?: number
    maxRecommended?: number
  }
}

export interface UsageMetric extends ServiceMetric {
  usageInfo?: {
    current: number
    limit: number | null
    percentage: number
    period?: string
    overageRate?: number
    overageCost?: number
  }
  costInfo?: {
    basePrice: number
    includedUnits: number
    overageRate: number
    billingPeriod: string
  }
}

export interface ServiceMetricsConfig {
  [serviceName: string]: {
    [metricKey: string]: {
      name: string
      unit: string
      type: string
      description?: string
      warningThreshold?: number
      maxRecommended?: number
    }
  }
}

export interface UsageConfigurationProps {
  metrics: ServiceMetric[]
  onMetricChange: (metricName: string, value: number) => void
}

export interface ServiceDetailsProps {
  service: Service
  selectedPlanIndex: number
  onPlanChange: (index: number) => void
  onMetricChange?: (metricId: string, value: number) => void
  simulatedValues?: Record<string, number>
}