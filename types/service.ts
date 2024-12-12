export interface Service {
  _id: string
  metadata: {
    service_name: string
    pricing_types: string[]
    enhancement_version?: string
    last_updated?: string
    model_target?: string
    original_url?: string
    regions?: string[]
    processed_at?: string
    version?: string
  }
  enhanced_data: {
    service_info: {
      currency: string
      billing_cycles: string[]
      name?: string
      last_updated?: string
      pricing_type?: string[]
      regions?: string[]
      url?: string
    }
    plans: Array<{
      name: string
      is_free_tier?: boolean
      features: {
        categories?: Array<{
          name: string
          features: Array<{
            name?: string
            description?: string
          }>
        }>
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
        other_limits?: Array<{
          name: string
          value: string
          description: string
        }>
      }
      pricing: {
        monthly: {
          base_price: number
          currency: string
          details: string
          minimum_users?: number
          per_user_price?: number
        }
        annual?: {
          base_price: number
          currency: string
          details: string
          minimum_users?: number
          per_user_price?: number
          savings_percentage: number
        }
        usage_components?: Array<{
          name: string
          price_per_unit: number
          unit: string
        }>
        original?: {
          amount: number
          currency: string
          period: string
        }
        usage_based?: any
        custom_pricing?: boolean
        add_ons?: any[]
      }
      trial?: {
        available: boolean
        description: string
        duration_days: number | null
      }
    }>
    market_insights?: {
      target_market?: string
      common_use_cases?: string[]
      growth_trends?: string
    }
    competitive_positioning?: {
      direct_competitors?: string[]
      competitive_advantages?: string[]
      competitive_disadvantages?: string[]
      market_position?: string
    }
    additional_info?: {
      billing_terms?: {
        billing_frequency?: string[]
        minimum_commitment?: {
          amount: number | null
          duration: string | null
        }
        payment_methods?: string[]
      }
      cancellation_terms?: {
        notice_period: string | null
        refund_policy: string | null
      }
      contact_sales?: boolean
      custom_plans?: boolean
      notes?: string[]
      volume_discounts?: any[]
    }
    discounts?: Array<{
      type: string
      amount: string
      description: string
      conditions: string
    }>
    enhanced_analysis?: {
      clear_value_propositions?: boolean
      differentiation_between_tiers?: boolean
      standardized_feature_descriptions?: boolean
      standardized_terminology?: boolean
    }
  }
}

export interface SelectedService extends Service {
  selectedPlanIndex: number
} 