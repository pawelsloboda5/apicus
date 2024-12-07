// components/mobile/MobileStackBuilder.tsx
"use client"

import { useState, useMemo } from "react"
import { Service } from "@/types/service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, X, Plus, ChevronDown, ChevronUp } from "lucide-react"
import { MobileServiceDetails } from "./MobileServiceDetails"

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
      <Card>
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
                  className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer"
                  onClick={() => setExpandedServiceId(isExpanded ? null : service._id)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{service.metadata.service_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{currentPlan.name}</span>
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

          <div className="relative mb-4 mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search services..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredServices.length > 0 ? (
            <div className="space-y-2">
              {filteredServices.map(s => (
                <div
                  key={s._id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => handleAddService(s)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{s.metadata.service_name}</span>
                    <span className="text-xs text-slate-500">
                      From ${s.enhanced_data.plans[0]?.pricing?.monthly?.base_price ?? 'N/A'}/mo
                    </span>
                  </div>
                  <Plus className="h-4 w-4 text-slate-600" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8 text-sm">
              No matching services found.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
