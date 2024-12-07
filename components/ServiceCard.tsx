// components/ServiceCard.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowRight, Check } from "lucide-react"
import { useState } from "react"

interface ServiceCardProps {
  service: {
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
        pricing: {
          monthly: {
            base_price: number
            details: string
          }
        }
        features: {
          highlighted: string[]
        }
      }>
    }
  }
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!service?.enhanced_data?.plans?.length) {
    return null
  }

  const lowestPrice = Math.min(
    ...service.enhanced_data.plans.map(plan => 
      plan.pricing?.monthly?.base_price || Infinity
    )
  )

  return (
    <>
      <Card className="hover:shadow-sm transition-all hover:border-slate-300">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">{service.metadata.service_name}</h3>
                <div className="flex gap-1.5">
                  {service.metadata.pricing_types.map(type => (
                    <Badge 
                      key={type} 
                      variant="secondary" 
                      className="capitalize text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-sm text-slate-600">
                From ${lowestPrice}/mo • {service.enhanced_data.service_info.billing_cycles.join(", ")}
              </div>
            </div>

            {/* Key Features */}
            <div>
              <h4 className="text-sm font-medium mb-2">Key Features</h4>
              <ul className="grid gap-2">
                {service.enhanced_data.plans[0].features.highlighted.slice(0, 3).map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Compare Plans Button */}
            <Button 
              variant="outline" 
              className="w-full mt-2 text-sm font-medium"
              onClick={() => setIsDialogOpen(true)}
            >
              Compare Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold">
              {service.metadata.service_name} Plans
            </DialogTitle>
          </DialogHeader>
          <div>
            <PlanComparison plans={service.enhanced_data.plans} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function PlanComparison({ plans }: { plans: Array<{
  name: string,
  pricing: { 
    monthly: { 
      base_price: number,
      details: string 
    } 
  },
  features: { highlighted: string[] }
}> }) {
  return (
    <div className="space-y-6">
      {/* Free Plan */}
      <div className="border-b pb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">Free</h3>
            <p className="text-sm text-slate-600 mt-1">
              Free for individuals to organize personal projects and life.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">$0</div>
            <div className="text-sm text-slate-600">/mo</div>
          </div>
        </div>
        <div className="space-y-2">
          {plans[0].features.highlighted.slice(0, 3).map(feature => (
            <div key={feature} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-1 shrink-0" />
              <span className="text-sm text-slate-600">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plus Plan */}
      <div className="border-b pb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">Plus</h3>
            <p className="text-sm text-slate-600 mt-1">
              For teams and professionals to collaborate effectively.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">$10</div>
            <div className="text-sm text-slate-600">/mo</div>
          </div>
        </div>
        <div className="space-y-2">
          {plans[1]?.features.highlighted.slice(0, 4).map(feature => (
            <div key={feature} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-1 shrink-0" />
              <span className="text-sm text-slate-600">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Business Plan */}
      <div className="border-b pb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">Business</h3>
            <p className="text-sm text-slate-600 mt-1">
              For growing businesses to streamline teamwork.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">$15</div>
            <div className="text-sm text-slate-600">/mo</div>
          </div>
        </div>
        <div className="space-y-2">
          {plans[2]?.features.highlighted.slice(0, 4).map(feature => (
            <div key={feature} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-1 shrink-0" />
              <span className="text-sm text-slate-600">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise Plan */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">Enterprise</h3>
            <p className="text-sm text-slate-600 mt-1">
              Contact sales for pricing
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">$</div>
            <div className="text-sm text-slate-600">/mo</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-600 mt-1 shrink-0" />
            <span className="text-sm text-slate-600">Enterprise-grade security</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-600 mt-1 shrink-0" />
            <span className="text-sm text-slate-600">Custom analytics</span>
          </div>
        </div>
      </div>
    </div>
  )
} 