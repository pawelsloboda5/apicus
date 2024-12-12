// components/StackBuilder.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { 
  Plus, X, 
  Server, Shield, Activity, 
  CircleDollarSign, Users, Database, Zap, BarChart2, Box
} from "lucide-react"
import { ServiceDetails } from "./ServiceDetails"
import { Badge } from "@/components/ui/badge"
import { StackAnalytics } from "./StackAnalytics"
import { Service } from "@/types/service"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { MetricCard } from "@/components/analytics/MetricCard"
import { extractServiceMetrics } from "@/utils/metrics"
import { ServiceStackBuilder } from "./ServiceStackBuilder"

interface SelectedService extends Service {
  selectedPlanIndex: number
}

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

export function StackBuilder({ 
  availableServices, 
  selectedServices, 
  onServicesChange, 
  servicePlans, 
  setServicePlans 
}: StackBuilderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<SelectedService | null>(null)
  const [simulatedMetrics, setSimulatedMetrics] = useState<Record<string, number>>({})

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

  const _totalMonthlyCost = selectedServices.reduce((total, service) => {
    const price = getServicePrice(service)
    return total + (price ?? 0)
  }, 0)

  const handleAddService = (service: Service) => {
    const newServices = [...selectedServices, service]
    onServicesChange(newServices)
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

  const handleMetricChange = (serviceId: string, metricId: string, value: number) => {
    setSimulatedMetrics(prev => ({
      ...prev,
      [`${serviceId}-${metricId}`]: value
    }))
  }

  // Calculate total costs including overages
  const totalCosts = useMemo(() => {
    return selectedServices.reduce((acc, service) => {
      const planState = servicePlans.find(sp => sp.serviceId === service._id)
      if (!planState) return acc

      const currentPlan = service.enhanced_data.plans[planState.planIndex]
      const nextPlan = service.enhanced_data.plans[planState.planIndex + 1]
      const metrics = extractServiceMetrics(service, currentPlan, nextPlan)
      
      const baseCost = currentPlan.pricing?.monthly?.base_price || 0
      
      // Apply simulated values
      const updatedMetrics = metrics.map(metric => ({
        ...metric,
        value: simulatedMetrics[`${service._id}-${metric.id}`] ?? metric.value
      }))

      // Check if any metric exceeds its limit
      const hasExceededMetrics = updatedMetrics.some(metric => 
        metric.currentPlanThreshold && metric.value > metric.currentPlanThreshold
      )

      // Calculate overage as difference to next tier if limits exceeded
      const overageCost = hasExceededMetrics && nextPlan ? 
        nextPlan.pricing?.monthly?.base_price - baseCost : 0

      return {
        base: acc.base + baseCost,
        overage: acc.overage + overageCost,
        total: acc.total + baseCost + overageCost
      }
    }, { base: 0, overage: 0, total: 0 })
  }, [selectedServices, servicePlans, simulatedMetrics])

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Main Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column - Stack Management */}
          <div className="lg:col-span-12 space-y-6">
            {/* Enhanced Stack Summary Card */}
            <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold">Your Tech Stack</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Manage and optimize your infrastructure services</p>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Enhanced Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <MetricCard
                    icon={<CircleDollarSign className="h-5 w-5" />}
                    label="Total Cost"
                    value={`$${totalCosts.total.toFixed(2)}`}
                    subValue={totalCosts.overage > 0 ? `Including $${totalCosts.overage.toFixed(2)} in overages` : undefined}
                    trend={{
                      value: ((totalCosts.total - totalCosts.base) / totalCosts.base) * 100,
                      label: "vs. base cost"
                    }}
                    className="bg-gradient-to-br from-blue-50 to-white"
                  />
                  <MetricCard
                    icon={<Users className="h-5 w-5" />}
                    label="Total Users"
                    value={calculateTotalUsers(selectedServices, servicePlans)}
                    percentage={75}
                    className="bg-gradient-to-br from-green-50 to-white"
                  />
                  <MetricCard
                    icon={<Database className="h-5 w-5" />}
                    label="Storage Used"
                    value={calculateTotalStorage(selectedServices, servicePlans)}
                    percentage={45}
                    className="bg-gradient-to-br from-purple-50 to-white"
                  />
                </div>

                {/* Service Categories */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2">
                    <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-slate-100">
                      All Services
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-slate-100">
                      Infrastructure
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-slate-100">
                      Security
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-slate-100">
                      DevOps Tools
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-slate-100">
                      Monitoring
                    </Badge>
                  </div>
                </div>

                {/* Selected Services List */}
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {selectedServices.map(service => {
                      const planState = servicePlans.find(sp => sp.serviceId === service._id)
                      const isSelected = selectedServiceForDetails?._id === service._id
                      const planIndex = planState?.planIndex || 0
                      const currentPlan = service.enhanced_data.plans[planIndex]
                      const price = getServicePrice(service)
                      
                      return (
                        <ServiceCard
                          key={service._id}
                          service={service}
                          plan={currentPlan}
                          price={price}
                          isSelected={isSelected}
                          onSelect={() => handleServiceSelect(service)}
                          onRemove={() => handleRemoveService(service._id)}
                        />
                      )
                    })}
                  </div>
                </ScrollArea>

                {selectedServices.length === 0 && (
                  <EmptyState 
                    onAdd={() => setIsDialogOpen(true)}
                  />
                )}
              </CardContent>
            </Card>

            {/* Service Details Section */}
            {selectedServices.length > 0 && selectedServiceForDetails && (
              <Card className="border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Service Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <ServiceDetails 
                    service={selectedServiceForDetails}
                    selectedPlanIndex={selectedServiceForDetails.selectedPlanIndex}
                    onPlanChange={handlePlanChange}
                    onMetricChange={(metricId, value) => 
                      handleMetricChange(selectedServiceForDetails._id, metricId, value)
                    }
                    simulatedValues={Object.entries(simulatedMetrics)
                      .filter(([key]) => key.startsWith(selectedServiceForDetails._id))
                      .reduce((acc, [key, value]) => ({
                        ...acc,
                        [key.split('-')[1]]: value
                      }), {})}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Enhanced Service Selection Dialog */}
        <ServiceSelectionDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onServiceAdd={handleAddService}
          availableServices={availableServices}
        />

        <StackAnalytics
          services={selectedServices}
          servicePlans={servicePlans}
          simulatedMetrics={simulatedMetrics}
        />
      </div>
    </TooltipProvider>
  )
}

// New Components

function ServiceCard({ service, plan, price, isSelected, onSelect, onRemove }: {
  service: Service
  plan: Service['enhanced_data']['plans'][0]
  price: number | null
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
}) {
  const getPricingTypeIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      security: <Shield className="h-4 w-4 text-green-500" />,
      hosting: <Server className="h-4 w-4 text-blue-500" />,
      monitoring: <Activity className="h-4 w-4 text-orange-500" />,
      automation: <Zap className="h-4 w-4 text-purple-500" />,
      analytics: <BarChart2 className="h-4 w-4 text-indigo-500" />
    }
    return icons[type.toLowerCase()] || <Box className="h-4 w-4 text-slate-500" />
  }

  const getPricingTypeDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      fixed: "Fixed monthly or annual pricing",
      tiered: "Price varies based on usage tiers",
      usage: "Pay for what you use",
      "per-user": "Pricing scales with number of users",
      metered: "Usage-based billing in real-time",
      security: "Security and compliance features",
      hosting: "Cloud hosting and infrastructure",
      monitoring: "System monitoring and alerts",
      automation: "Process automation tools",
      analytics: "Data analytics and insights"
    }
    return descriptions[type.toLowerCase()] || type
  }

  return (
    <div 
      className={`
        relative group rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden
        ${isSelected 
          ? 'bg-slate-50 border-slate-300 shadow-md' 
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }
      `}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {getPricingTypeIcon(service.metadata.pricing_types[0])}
              <h3 className="font-medium text-slate-900">
                {service.metadata.service_name}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                {plan.name}
              </Badge>
              {price !== null && (
                <span className="text-slate-600">${price}/mo</span>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Service Features */}
        <div className="mt-3">
          <div className="flex flex-wrap gap-1.5">
            {plan.features.highlighted.slice(0, 3).map((feature: string) => (
              <Tooltip key={feature}>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-white hover:bg-slate-50"
                  >
                    {feature}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{feature}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            {plan.features.highlighted.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs bg-white hover:bg-slate-50"
              >
                +{plan.features.highlighted.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Service Types */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {service.metadata.pricing_types.map(type => (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  {getPricingTypeIcon(type)}
                  <span>{type}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{getPricingTypeDescription(type)}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
      
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute inset-y-0 left-0 w-1 bg-blue-500" />
      )}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
        <Plus className="h-6 w-6 text-blue-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">
        Build Your Tech Stack
      </h3>
      <p className="text-sm text-slate-600 mb-4">
        Start by adding services to create your perfect technology stack
      </p>
      <Button onClick={onAdd}>
        Add Your First Service
      </Button>
    </div>
  )
}

function ServiceSelectionDialog({ 
  isOpen, 
  onClose, 
  onServiceAdd,
  availableServices
}: {
  isOpen: boolean
  onClose: () => void
  onServiceAdd: (service: Service) => void
  availableServices: Service[]
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
        <ServiceStackBuilder
          initialServices={availableServices}
          onServicesChange={(services) => {
            if (services.length > 0) {
              // Add the last selected service
              onServiceAdd(services[services.length - 1])
              onClose()
            }
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

// Helper functions for metrics
function calculateTotalUsers(services: Service[], servicePlans: Array<{ serviceId: string; planIndex: number }>) {
  let total = 0
  services.forEach(service => {
    const planState = servicePlans.find(sp => sp.serviceId === service._id)
    const plan = service.enhanced_data.plans[planState?.planIndex || 0]
    if (plan.limits?.users?.max) {
      total += plan.limits.users.max
    }
  })
  return total > 0 ? `${total} seats` : 'Unlimited'
}

function calculateTotalStorage(services: Service[], servicePlans: Array<{ serviceId: string; planIndex: number }>) {
  let total = 0
  services.forEach(service => {
    const planState = servicePlans.find(sp => sp.serviceId === service._id)
    const plan = service.enhanced_data.plans[planState?.planIndex || 0]
    if (plan.limits?.storage?.amount) {
      total += plan.limits.storage.amount
    }
  })
  return total > 0 ? `${total}GB` : 'N/A'
} 