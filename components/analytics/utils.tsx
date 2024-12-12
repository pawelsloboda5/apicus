import { Service } from "@/types/service"
import { ServiceMetric } from "@/types/analytics"

export function extractMetricsFromPlan(
  service: Service,
  currentPlan: Service["enhanced_data"]["plans"][0],
  nextPlan?: Service["enhanced_data"]["plans"][0],
  priorPlan?: Service["enhanced_data"]["plans"][0]
): ServiceMetric[] {
  const metrics: ServiceMetric[] = []
  
  if (!currentPlan) return metrics

  // Helper function to create metric
  const createMetric = (
    id: string,
    name: string,
    value: number | string,
    type: string,
    unit: string,
    threshold: number | null,
    description?: string
  ): ServiceMetric => ({
    id: `${service._id}-${id}`,
    name,
    value: typeof value === 'string' ? parseFloat(value) || 0 : value,
    type,
    unit,
    currentPlanThreshold: threshold,
    basePrice: currentPlan.pricing.monthly?.base_price || 
              currentPlan.pricing.original?.amount || 0,
    serviceName: service.metadata.service_name,
    planName: currentPlan.name,
    description,
    nextPlan: nextPlan ? {
      name: nextPlan.name,
      limit: null, // Will be set based on type
      price: nextPlan.pricing.monthly?.base_price || 
             nextPlan.pricing.original?.amount || 0
    } : undefined,
    priorPlan: priorPlan ? {
      name: priorPlan.name,
      limit: null, // Will be set based on type
      price: priorPlan.pricing.monthly?.base_price || 
             priorPlan.pricing.original?.amount || 0
    } : undefined
  })

  // Extract standard limits
  if (currentPlan.limits?.users) {
    metrics.push(createMetric(
      'users',
      'Users',
      currentPlan.limits.users.min || 0,
      'users',
      'users',
      currentPlan.limits.users.max,
      currentPlan.limits.users.description || undefined
    ))
  }

  if (currentPlan.limits?.storage) {
    metrics.push(createMetric(
      'storage',
      'Storage',
      currentPlan.limits.storage.amount || 0,
      'storage',
      currentPlan.limits.storage.unit || 'GB',
      currentPlan.limits.storage.amount,
      currentPlan.limits.storage.description || undefined
    ))
  }

  // Extract API limits
  if (currentPlan.limits?.api) {
    if (currentPlan.limits.api.rate?.amount) {
      metrics.push(createMetric(
        'api-rate',
        'API Rate',
        currentPlan.limits.api.rate.amount,
        'api',
        'requests/' + (currentPlan.limits.api.rate.period || 'sec'),
        currentPlan.limits.api.rate.amount,
        currentPlan.limits.api.rate.description || undefined
      ))
    }

    if (currentPlan.limits.api.quota?.amount) {
      metrics.push(createMetric(
        'api-quota',
        'API Quota',
        currentPlan.limits.api.quota.amount,
        'api',
        'requests/' + (currentPlan.limits.api.quota.period || 'month'),
        currentPlan.limits.api.quota.amount,
        currentPlan.limits.api.quota.description || undefined
      ))
    }
  }

  // Extract other limits
  if (currentPlan.limits?.other_limits) {
    currentPlan.limits.other_limits.forEach((limit, index) => {
      // Try to parse numeric values from the limit value
      const numericValue = parseFloat(limit.value.replace(/[^0-9.]/g, ''))
      const unit = limit.value.replace(/[0-9.]/g, '').trim()
      
      if (!isNaN(numericValue)) {
        metrics.push(createMetric(
          `other-${index}`,
          limit.name,
          numericValue,
          'other',
          unit || 'units',
          numericValue,
          limit.description || undefined
        ))
      }
    })
  }

  // Extract usage-based pricing
  if (currentPlan.pricing.usage_components) {
    currentPlan.pricing.usage_components.forEach((component, index) => {
      metrics.push(createMetric(
        `usage-${index}`,
        component.name,
        0, // Current value starts at 0
        'usage',
        component.unit,
        null,
        `$${component.price_per_unit} per ${component.unit}`
      ))
    })
  }

  return metrics.filter((metric, index, self) => 
    // Remove duplicates based on id and type
    index === self.findIndex(m => m.id === metric.id && m.type === metric.type)
  )
}
