// components/StackBuilder.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, X, DollarSign, Zap, Search } from "lucide-react"
import { ServiceDetails } from "./ServiceDetails"
import { Badge } from "@/components/ui/badge"
import { StackAnalytics } from "./StackAnalytics"
import { Service, SelectedService } from "@/types/service"

interface StackBuilderProps {
  availableServices: Service[]
  selectedServices: Service[]
  onServicesChange: (services: Service[]) => void
  servicePlans: Array<{
    serviceId: string;
    planIndex: number;
  }>;
  setServicePlans: React.Dispatch<React.SetStateAction<Array<{
    serviceId: string;
    planIndex: number;
  }>>>;
}

const getLowestPrice = (service: Service) => {
  try {
    if (!service?.enhanced_data?.plans?.length) {
      return 0;
    }
    
    const prices = service.enhanced_data.plans
      .filter(plan => plan?.pricing?.monthly?.base_price)
      .map(plan => plan.pricing.monthly.base_price);
    
    return prices.length > 0 ? Math.min(...prices) : 0;
  } catch (error) {
    console.error('Error calculating lowest price:', error);
    return 0;
  }
};

export function StackBuilder({ 
  availableServices, 
  selectedServices, 
  onServicesChange, 
  servicePlans, 
  setServicePlans 
}: StackBuilderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<SelectedService | null>(null)

  useEffect(() => {
    const currentServiceIds = servicePlans.map(sp => sp.serviceId)
    const newServices = selectedServices.filter(s => !currentServiceIds.includes(s._id))
    
    if (newServices.length > 0) {
      setServicePlans(prev => [
        ...prev,
        ...newServices.map(s => ({ serviceId: s._id, planIndex: 0 }))
      ])
    }

    setServicePlans(prev => 
      prev.filter(sp => selectedServices.some(s => s._id === sp.serviceId))
    )
  }, [selectedServices, setServicePlans, servicePlans])

  useEffect(() => {
    if (selectedServices.length > 0 && !selectedServiceForDetails) {
      const service = selectedServices[0]
      const planState = servicePlans.find(sp => sp.serviceId === service._id)
      setSelectedServiceForDetails({
        ...service,
        selectedPlanIndex: planState?.planIndex || 0
      })
    } else if (selectedServices.length === 0) {
      setSelectedServiceForDetails(null)
    }
  }, [selectedServices, selectedServiceForDetails, servicePlans])

  const getServicePrice = (service: Service) => {
    try {
      const planState = servicePlans.find(sp => sp.serviceId === service._id)
      const plan = service.enhanced_data.plans[planState?.planIndex || 0]
      return plan?.pricing?.monthly?.base_price || null;
    } catch (error) {
      console.error('Error calculating service price:', error);
      return null;
    }
  };

  const totalMonthlyCost = selectedServices.reduce((total, service) => {
    const price = getServicePrice(service)
    return total + (price ?? 0)
  }, 0)

  const filteredServices = useMemo(() => {
    const validServices = availableServices.filter(service => {
      // Validate service structure
      return service?.metadata?.service_name && 
             service?.enhanced_data?.plans &&
             Array.isArray(service.enhanced_data.plans);
    });

    const filtered = validServices.filter(service => 
      service.metadata.service_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedServices.some(s => s._id === service._id)
    );

    if (filtered.length < 5) {
      const remainingServices = validServices.filter(service => 
        !filtered.some(f => f._id === service._id) &&
        !selectedServices.some(s => s._id === service._id)
      );
      
      const randomServices = remainingServices
        .sort(() => Math.random() - 0.5)
        .slice(0, 5 - filtered.length);

      return [...filtered, ...randomServices];
    }

    return filtered.slice(0, 5);
  }, [availableServices, searchQuery, selectedServices]);

  const handleAddService = (service: Service) => {
    onServicesChange([...selectedServices, service])
    setIsDialogOpen(false)
  }

  const handleRemoveService = (serviceId: string) => {
    onServicesChange(selectedServices.filter(s => s._id !== serviceId))
    setServicePlans(prev => 
      prev.filter(sp => sp.serviceId !== serviceId)
    )
    if (selectedServiceForDetails?._id === serviceId) {
      setSelectedServiceForDetails(null)
    }
  }

  const handleServiceSelect = (service: Service) => {
    const planState = servicePlans.find(sp => sp.serviceId === service._id)
    setSelectedServiceForDetails({
      ...service,
      selectedPlanIndex: planState?.planIndex || 0
    })
  }

  const handlePlanChange = (planIndex: number) => {
    if (selectedServiceForDetails) {
      setSelectedServiceForDetails({
        ...selectedServiceForDetails,
        selectedPlanIndex: planIndex
      })
      setServicePlans(prev => prev.map(sp => 
        sp.serviceId === selectedServiceForDetails._id
          ? { ...sp, planIndex }
          : sp
      ))
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Stack Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Tech Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <div className="text-sm text-slate-600">Monthly Cost</div>
                  <div className="text-2xl font-bold flex items-center font-mono">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    {totalMonthlyCost}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-600">Services</div>
                  <div className="text-2xl font-bold flex items-center">
                    <Zap className="h-5 w-5 text-blue-600" />
                    {selectedServices.length}
                  </div>
                </div>
              </div>

              {/* Selected Services List */}
              <div className="space-y-2">
                {selectedServices.map(service => {
                  const planState = servicePlans.find(sp => sp.serviceId === service._id)
                  const isSelected = selectedServiceForDetails?._id === service._id
                  const planIndex = planState?.planIndex || 0
                  const price = getServicePrice(service)
                  
                  return (
                    <div 
                      key={service._id} 
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all
                        ${isSelected 
                          ? 'bg-slate-200 ring-2 ring-slate-400 shadow-md' 
                          : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                      onClick={() => handleServiceSelect(service)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{service.metadata.service_name}</div>
                        <div className="text-sm text-slate-600">
                          {service.enhanced_data.plans[planIndex].name.toLowerCase() === 'free' 
                            ? '' 
                            : price !== null 
                              ? `$${price}/mo` 
                              : 'N/A'
                          }
                        </div>
                        <div className="text-xs text-slate-500">
                          ({service.enhanced_data.plans[planIndex].name})
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <Badge variant="secondary" className="mr-2">
                            Selected
                          </Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveService(service._id)
                            if (selectedServiceForDetails?._id === service._id) {
                              setSelectedServiceForDetails(null)
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Service Button */}
              <Button 
                className="w-full mt-4"
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </CardContent>
          </Card>

          {/* Service Details - Always show if there are services */}
          {selectedServices.length > 0 && selectedServiceForDetails && (
            <ServiceDetails 
              service={selectedServiceForDetails}
              selectedPlanIndex={selectedServiceForDetails.selectedPlanIndex}
              onPlanChange={handlePlanChange}
            />
          )}
        </div>

        <div>
          <StackAnalytics 
            services={selectedServices}
            servicePlans={servicePlans}
          />
        </div>
      </div>

      {/* Service Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add Service to Stack
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredServices.map((service: Service) => (
              <Card 
                key={service._id} 
                className="cursor-pointer hover:border-slate-400 transition-colors"
              >
                <CardContent 
                  className="p-4"
                  onClick={() => handleAddService(service)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{service.metadata.service_name}</h3>
                    <div className="text-sm text-slate-600">
                      From ${getLowestPrice(service)}/mo
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {service.metadata.pricing_types?.map((type: string) => (
                      <span 
                        key={type}
                        className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No matching services found. Showing random suggestions...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 