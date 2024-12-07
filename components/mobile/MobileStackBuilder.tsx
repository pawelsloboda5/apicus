// components/mobile/MobileStackBuilder.tsx
"use client"

import { useState, useMemo } from "react"
import { Service } from "@/types/service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, X, Plus, ChevronDown, ChevronUp, Zap, Users, Server, Shield } from "lucide-react"
import { MobileServiceDetails } from "./MobileServiceDetails"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface MobileStackBuilderProps {
  availableServices: Service[]
  selectedServices: Service[]
  onServicesChange: (services: Service[]) => void
  servicePlans: Array<{ serviceId: string; planIndex: number }>
  onServicePlansChange: (plans: Array<{ serviceId: string; planIndex: number }>) => void
}

export function MobileStackBuilder({ availableServices, selectedServices, onServicesChange, servicePlans, onServicePlansChange }: MobileStackBuilderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null)

  const filteredServices = useMemo(() => {
    const validServices = availableServices.filter(service =>
      service?.metadata?.service_name && service?.enhanced_data?.plans?.length
    )

    return validServices.filter(s =>
      s.metadata.service_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedServices.some(sel => sel._id === s._id)
    )
  }, [availableServices, selectedServices, searchQuery])

  const handleRemoveService = (serviceId: string) => {
    onServicesChange(selectedServices.filter(s => s._id !== serviceId))
  }

  const handleAddService = (service: Service) => {
    onServicesChange([...selectedServices, service])
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="p-4 space-y-2">
        <h1 className="text-2xl font-bold">Build Your Stack</h1>
        <p className="text-slate-600">
          Create your perfect tech stack by combining the best tools and services
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 px-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-sm text-slate-600">Active Services</div>
                <div className="text-xl font-bold">{selectedServices.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm text-slate-600">Total Users</div>
                <div className="text-xl font-bold">
                  {selectedServices.reduce((total, service) => {
                    const plan = service.enhanced_data.plans[
                      servicePlans.find(sp => sp.serviceId === service._id)?.planIndex ?? 0
                    ]
                    return total + (plan.limits?.users?.max || 0)
                  }, 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Services */}
      <Card className="mx-4">
        <CardContent className="space-y-2 p-4">
          {selectedServices.map(service => {
            const planState = servicePlans.find(sp => sp.serviceId === service._id)
            const planIndex = planState?.planIndex ?? 0
            const currentPlan = service.enhanced_data.plans[planIndex]
            const isExpanded = expandedServiceId === service._id
            const price = currentPlan.pricing?.monthly?.base_price
            const priceDisplay = price ? `$${price}/mo` : 'Free'

            return (
              <div key={service._id} className="space-y-2">
                <div
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                  onClick={() => setExpandedServiceId(isExpanded ? null : service._id)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {service.metadata.pricing_types.includes('security') ? (
                        <Shield className="h-4 w-4 text-green-500" />
                      ) : service.metadata.pricing_types.includes('hosting') ? (
                        <Server className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Zap className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="font-medium">{service.metadata.service_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {currentPlan.name}
                      </Badge>
                      <span className="text-xs text-slate-600">{priceDisplay}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveService(service._id)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="pl-2">
                    <MobileServiceDetails
                      service={service}
                      selectedPlanIndex={planIndex}
                      onPlanChange={(index) => {
                        const updatedPlans = servicePlans.map(sp =>
                          sp.serviceId === service._id
                            ? { ...sp, planIndex: index }
                            : sp
                        )
                        onServicePlansChange(updatedPlans)
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}

          <Button
            variant="default"
            className="w-full mt-4"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </CardContent>
      </Card>

      {/* Service Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="p-4 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add Service</DialogTitle>
          </DialogHeader>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search services..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {filteredServices.length > 0 ? (
              <div className="space-y-2">
                {filteredServices.map(service => (
                  <Card 
                    key={service._id} 
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleAddService(service)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {service.metadata.pricing_types.includes('security') ? (
                              <Shield className="h-4 w-4 text-green-500" />
                            ) : service.metadata.pricing_types.includes('hosting') ? (
                              <Server className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Zap className="h-4 w-4 text-yellow-500" />
                            )}
                            <h3 className="font-medium">{service.metadata.service_name}</h3>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {service.metadata.pricing_types.map(type => (
                              <Badge key={type} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                          {service.enhanced_data.market_insights?.target_market && (
                            <p className="text-xs text-slate-600">
                              {service.enhanced_data.market_insights.target_market}
                            </p>
                          )}
                        </div>
                        <Plus className="h-4 w-4 text-slate-600" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">
                <p>No matching services found.</p>
                <p className="text-sm mt-1">Try adjusting your search terms.</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
