export interface Service {
  _id: string
  metadata: {
    service_name: string
    pricing_types: string[]
  }
  enhanced_data: {
    service_info: {
      currency: string
      billing_cycles: string[]
    }
    plans: Array<{
      name: string
      isFreeTier?: boolean
      pricing: {
        monthly: {
          base_price: number
          details: string
        }
        annual?: {
          savings_percentage: number
        }
        usage_components?: Array<{
          name: string
          price_per_unit: number
          unit: string
        }>
      }
      features: {
        highlighted: string[]
      }
      limits?: {
        users?: {
          min: number | null
          max: number | null
          description: string | null
        }
        storage?: {
          amount: number | null
          unit: string | null
          description: string | null
        }
        api?: {
          rate: {
            amount: number | null
            period: string | null
            description: string | null
          }
          quota: {
            amount: number | null
            period: string | null
            description: string | null
          }
        }
      }
    }>
    market_insights?: {
      target_market?: string
      common_use_cases?: string[]
      growth_trends?: string
    }
    competitive_positioning?: {
      competitive_advantages?: string[]
      competitive_disadvantages?: string[]
      market_position?: string
    }
  }
}

export interface SelectedService extends Service {
  selectedPlanIndex: number
} 