"use client"

import { useState, useMemo } from "react"
import { Service } from "@/types/service"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Plus,
  Tag,
  DollarSign,
  X,
  Zap,
  Server,
  Shield,
  Users
} from "lucide-react"

interface MobileServiceDiscoveryProps {
  availableServices: Service[]
  selectedServices: Service[]
  onAddService: (service: Service) => void
}

type PriceRange = 'all' | 'free' | '1-50' | '51-200' | '201-500' | '500+'
type ServiceCategory = 'all' | 'hosting' | 'database' | 'analytics' | 'monitoring' | 'security'

const getCategoryIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'hosting':
      return <Server className="h-4 w-4 text-blue-500" />
    case 'security':
      return <Shield className="h-4 w-4 text-green-500" />
    case 'analytics':
      return <Zap className="h-4 w-4 text-yellow-500" />
    case 'collaboration':
      return <Users className="h-4 w-4 text-purple-500" />
    default:
      return null
  }
}

export function MobileServiceDiscovery({
  availableServices,
  selectedServices,
  onAddService
}: MobileServiceDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState<PriceRange>('all')
  const [category, _setCategory] = useState<ServiceCategory>('all')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  // Extract unique features from all services
  const allFeatures = useMemo(() => {
    const features = new Set<string>()
    availableServices.forEach(service => {
      service.enhanced_data.plans.forEach(plan => {
        plan.features.highlighted.forEach(feature => features.add(feature))
      })
    })
    return Array.from(features)
  }, [availableServices])

  // Filter services based on all criteria
  const filteredServices = useMemo(() => {
    return availableServices.filter(service => {
      const isAlreadySelected = selectedServices.some(s => s._id === service._id)
      if (isAlreadySelected) return false

      // Search filter
      const matchesSearch = service.metadata.service_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      // Price range filter
      const basePrice = service.enhanced_data.plans[0]?.pricing?.monthly?.base_price ?? 0
      const matchesPrice = priceRange === 'all' ||
        (priceRange === 'free' && basePrice === 0) ||
        (priceRange === '1-50' && basePrice > 0 && basePrice <= 50) ||
        (priceRange === '51-200' && basePrice > 50 && basePrice <= 200) ||
        (priceRange === '201-500' && basePrice > 200 && basePrice <= 500) ||
        (priceRange === '500+' && basePrice > 500)
      if (!matchesPrice) return false

      // Feature filter - match any selected feature
      if (selectedFeatures.length > 0) {
        const serviceFeatures = service.enhanced_data.plans.reduce(
          (acc, plan) => [...acc, ...plan.features.highlighted], [] as string[]
        )
        const hasAnyFeature = selectedFeatures.some(f => serviceFeatures.includes(f))
        if (!hasAnyFeature) return false
      }

      return true
    })
  }, [availableServices, selectedServices, searchQuery, priceRange, selectedFeatures])

  // Get matching features for a service
  const getMatchingFeatures = (service: Service) => {
    const serviceFeatures = service.enhanced_data.plans.reduce(
      (acc, plan) => [...acc, ...plan.features.highlighted], [] as string[]
    )
    return selectedFeatures.filter(f => serviceFeatures.includes(f))
  }

  return (
    <div className="space-y-4 pb-16">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search services..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={priceRange} onValueChange={(value: PriceRange) => setPriceRange(value)}>
              <SelectTrigger className="w-[140px]">
                <DollarSign className="h-4 w-4 mr-1" />
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="1-50">$1 - $50</SelectItem>
                <SelectItem value="51-200">$51 - $200</SelectItem>
                <SelectItem value="201-500">$201 - $500</SelectItem>
                <SelectItem value="500+">$500+</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setPriceRange('all')
                _setCategory('all')
                setSelectedFeatures([])
                setSearchQuery("")
              }}
            >
              Clear Filters
            </Button>
          </div>

          {selectedFeatures.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-slate-500">Active Feature Filters:</div>
              <div className="flex flex-wrap gap-1">
                {selectedFeatures.map(feature => (
                  <Badge 
                    key={feature} 
                    variant="secondary"
                    className="text-xs pr-1 flex items-center gap-1"
                  >
                    {feature}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => setSelectedFeatures(prev => 
                        prev.filter(f => f !== feature)
                      )}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-2">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {filteredServices.map(service => {
              const matchingFeatures = getMatchingFeatures(service)
              
              return (
                <Card key={service._id} className="mb-2">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(service.metadata.pricing_types[0])}
                          <h3 className="font-medium">{service.metadata.service_name}</h3>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {service.metadata.pricing_types.map(type => (
                            <Badge key={type} variant="secondary" className="text-xs flex items-center gap-1">
                              {getCategoryIcon(type)}
                              <span>{type}</span>
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm text-slate-600 flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          From ${service.enhanced_data.plans[0]?.pricing?.monthly?.base_price ?? 0}/mo
                        </div>
                      </div>
                      <Button size="sm" onClick={() => onAddService(service)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {selectedFeatures.length > 0 && matchingFeatures.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-slate-500 mb-1">Matching Features:</div>
                        <div className="flex flex-wrap gap-1">
                          {matchingFeatures.map(feature => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {service.enhanced_data.market_insights?.target_market && (
                      <p className="text-sm text-slate-600 mt-2">
                        {service.enhanced_data.market_insights.target_market}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="features" className="space-y-2">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-2 p-2">
              {allFeatures.map(feature => (
                <Button
                  key={feature}
                  variant={selectedFeatures.includes(feature) ? "default" : "outline"}
                  className="w-full justify-start group hover:bg-slate-100"
                  onClick={() => {
                    setSelectedFeatures(prev =>
                      prev.includes(feature)
                        ? prev.filter(f => f !== feature)
                        : [...prev, feature]
                    )
                  }}
                >
                  <Zap className={`h-4 w-4 mr-2 ${
                    selectedFeatures.includes(feature) 
                      ? 'text-white' 
                      : 'text-yellow-500 group-hover:text-yellow-600'
                  }`} />
                  {feature}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
} 