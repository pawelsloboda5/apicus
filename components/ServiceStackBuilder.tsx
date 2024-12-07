"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Service } from "@/types/service"

interface ServiceStackBuilderProps {
  initialServices: Service[]
  onServicesChange: (services: Service[]) => void
}

interface ServiceFilter {
  name: string
  minPrice?: number
  maxPrice?: number
  category?: string
}

export function ServiceStackBuilder({ 
  initialServices,
  onServicesChange 
}: ServiceStackBuilderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [filters, setFilters] = useState<ServiceFilter>({
    name: "",
    minPrice: undefined,
    maxPrice: undefined,
    category: undefined
  })

  const getServicePrice = (service: Service) => {
    try {
      if (!service?.enhanced_data?.plans?.length) return 0;
      
      const prices = service.enhanced_data.plans
        .filter(plan => plan?.pricing?.monthly?.base_price)
        .map(plan => plan.pricing.monthly.base_price);
      
      return prices.length > 0 ? Math.min(...prices) : 0;
    } catch (error) {
      console.error('Error calculating service price:', error);
      return 0;
    }
  };

  const filteredServices = initialServices.filter(service => {
    const price = getServicePrice(service)
    const nameMatch = service.metadata.service_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const minPriceMatch = !filters.minPrice || price >= filters.minPrice
    const maxPriceMatch = !filters.maxPrice || price <= filters.maxPrice
    const categoryMatch = !filters.category || 
      service.metadata.pricing_types.includes(filters.category)

    return nameMatch && minPriceMatch && maxPriceMatch && categoryMatch
  })

  const handleServiceSelect = (service: Service) => {
    const newServices = [...selectedServices, service]
    setSelectedServices(newServices)
    onServicesChange(newServices)
  }

  const handleServiceRemove = (serviceId: string) => {
    const newServices = selectedServices.filter(s => s._id !== serviceId)
    setSelectedServices(newServices)
    onServicesChange(newServices)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search Services</Label>
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name..."
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="w-full p-2 border rounded"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {/* Add your categories here */}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map(service => (
          <div
            key={service._id}
            className="p-4 border rounded shadow hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium">{service.metadata.service_name}</h3>
            <p className="text-sm text-gray-600">
              From ${getServicePrice(service)}/mo
            </p>
            <div className="mt-2 flex gap-2">
              {service.metadata.pricing_types.map(type => (
                <span
                  key={type}
                  className="text-xs px-2 py-1 bg-gray-100 rounded"
                >
                  {type}
                </span>
              ))}
            </div>
            <Button
              className="mt-4 w-full"
              onClick={() => handleServiceSelect(service)}
              disabled={selectedServices.some(s => s._id === service._id)}
            >
              Add to Stack
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
