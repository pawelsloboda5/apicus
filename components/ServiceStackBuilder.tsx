"use client"
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

type LimitItem = {
  name: string
  value: string
  description: string
}

type Plan = {
  name: string
  isFreeTier: boolean
  pricing: {
    original: any
    usage_based: any
    custom_pricing: boolean
  }
  limits: {
    users: {
      min: number | null
      max: number | null
      description: string | null
    },
    storage: {
      amount: number | null
      unit: string | null
      description: string | null
    },
    api: {
      rate: {
        amount: number | null
        period: string | null
        description: string | null
      },
      quota: {
        amount: number | null
        period: string | null
        description: string | null
      },
      description: string | null
    },
    other_limits: LimitItem[]
  }
  features: {
    highlighted: string[]
    detailed: string[]
  }
  trial: {
    available: boolean
    duration_days: number | null
    description: string | null
  }
  enhanced_features: any[]
  value_proposition: string
  user_persona: object
}

type ServiceDoc = {
  _id: { $oid: string }
  metadata: {
    service_name: string
    processed_at?: string
    source_id?: string
    model_target?: string
    version?: string
    original_url?: string
    pricing_types?: string[]
    regions?: string[]
    last_updated?: string
  }
  enhanced_data?: {
    service_info?: {
      name?: string
      url?: string
      currency?: string
      pricing_type?: string[]
      billing_cycles?: string[]
      regions?: string[]
      last_updated?: string
    }
    plans?: Plan[]
  }
  // ... other fields
}

export default function ServiceStackBuilder({ initialServices }: { initialServices: ServiceDoc[] }) {
  const [allServices, setAllServices] = useState<ServiceDoc[]>(initialServices || [])
  const [selectedStack, setSelectedStack] = useState<ServiceDoc[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const filteredServices = useMemo(() => {
    if (!searchTerm) return allServices
    return allServices.filter(s => 
      s.metadata.service_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, allServices])

  function addToStack(service: ServiceDoc) {
    if (!selectedStack.find(s => s._id.$oid === service._id.$oid)) {
      setSelectedStack(prev => [...prev, service])
    }
  }

  function removeFromStack(serviceId: string) {
    setSelectedStack(prev => prev.filter(s => s._id.$oid !== serviceId))
  }

  return (
    <div className="flex gap-4">
      <div className="w-1/2">
        <h2 className="font-bold text-xl mb-2">Add Services to Your Stack</h2>
        <Input 
          placeholder="Search services..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        <div className="grid gap-4">
          {filteredServices.map(service => (
            <Card key={service._id.$oid} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{service.metadata.service_name}</h3>
                <p className="text-sm text-gray-600">
                  {service.enhanced_data?.plans?.length || 0} plan(s)
                </p>
              </div>
              <Button onClick={() => addToStack(service)}>Add</Button>
            </Card>
          ))}
        </div>
      </div>

      <div className="w-1/2">
        <h2 className="font-bold text-xl mb-2">Your Stack</h2>
        {selectedStack.length === 0 && <p>No services added yet.</p>}
        <div className="grid gap-4">
          {selectedStack.map(service => {
            const plans = service.enhanced_data?.plans || []
            return (
              <Card key={service._id.$oid} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{service.metadata.service_name}</h3>
                    <p className="text-sm text-gray-700">
                      {plans.length} plan(s)
                    </p>
                  </div>
                  <Button variant="destructive" onClick={() => removeFromStack(service._id.$oid)}>Remove</Button>
                </div>

                {/* Display a summary of the plans */}
                {plans.map((plan, idx) => (
                  <div key={idx} className="mb-4 border p-2 rounded">
                    <h4 className="font-semibold text-md">{plan.name} {plan.isFreeTier ? "(Free)" : "(Paid)"}</h4>
                    <div className="text-sm text-gray-700">
                      {/* Show some limits */}
                      {plan.limits.other_limits.map((limitItem, limitIdx) => (
                        <p key={limitIdx}>{limitItem.name}: {limitItem.value} - {limitItem.description}</p>
                      ))}
                      {/* Highlighted features */}
                      {plan.features.highlighted.length > 0 && (
                        <div className="mt-2">
                          <strong>Features:</strong>
                          <ul className="list-disc list-inside">
                            {plan.features.highlighted.map((feat, fIdx) => (
                              <li key={fIdx}>{feat}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
