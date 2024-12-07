// components/mobile/MobileStackAnalytics.tsx
"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { 
  DollarSign, 
  Zap, 
  TrendingUp, 
  Shield, 
  Users, 
  Server,
  ChevronRight
} from "lucide-react"
import { Service } from "@/types/service"
import { Progress } from "@/components/ui/progress"

interface MobileStackAnalyticsProps {
  services: Service[]
  servicePlans: Array<{
    serviceId: string
    planIndex: number
  }>
  getServicePrice?: (service: Service) => number | null
}

export function MobileStackAnalytics({ services, servicePlans, getServicePrice }: MobileStackAnalyticsProps) {
  const priceForService = (service: Service) => {
    if (!getServicePrice) return 0
    return getServicePrice(service) ?? 0
  }

  const totalMonthlyCost = services.reduce((sum, s) => sum + priceForService(s), 0)

  const calculateResourceUsage = () => {
    let totalStorage = 0
    let totalUsers = 0
    
    services.forEach(s => {
      const planState = servicePlans.find(sp => sp.serviceId === s._id)
      const plan = s.enhanced_data.plans[planState?.planIndex ?? 0]
      
      if (plan.limits?.storage?.amount) {
        totalStorage += typeof plan.limits.storage.amount === 'string' 
          ? parseInt(plan.limits.storage.amount) 
          : plan.limits.storage.amount
      }
      if (plan.limits?.users?.max) {
        totalUsers += plan.limits.users.max
      }
    })

    return { totalStorage, totalUsers }
  }

  const { totalStorage, totalUsers } = calculateResourceUsage()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Stack Overview</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">Monthly Cost</div>
              <div className="text-2xl font-bold font-mono flex items-center gap-1">
                <DollarSign className="h-5 w-5 text-green-600" />
                {totalMonthlyCost}
              </div>
            </div>
            <Progress value={(totalMonthlyCost / 1000) * 100} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="h-4 w-4" />
                Total Users
              </div>
              <div className="text-xl font-semibold">{totalUsers}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Server className="h-4 w-4" />
                Storage
              </div>
              <div className="text-xl font-semibold">{totalStorage}GB</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-slate-600 mb-2">Services Breakdown</div>
            <div className="divide-y">
              {services.map(s => {
                const price = priceForService(s)
                const planState = servicePlans.find(sp => sp.serviceId === s._id)
                const planIndex = planState?.planIndex ?? 0
                const planName = s.enhanced_data.plans[planIndex].name
                return (
                  <div key={s._id} className="flex items-center justify-between py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{s.metadata.service_name}</span>
                      <span className="text-xs text-slate-500">{planName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-mono">
                        {price > 0 ? `$${price}` : "Free"}
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Stack Insights
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.length === 0 ? (
            <div className="text-center py-4 text-slate-500">
              Add services to your stack to see insights.
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium text-sm">Security Coverage</span>
                </div>
                <Progress 
                  value={Math.min((services.length / 5) * 100, 100)} 
                  className="h-2" 
                />
                <p className="text-xs text-slate-600">
                  Your stack provides {services.length > 3 ? "good" : "basic"} security coverage.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-sm">Stack Efficiency</span>
                </div>
                <div className="text-sm text-slate-600">
                  {services.length} services selected. 
                  {services.length > 5 
                    ? " Consider consolidating services to reduce complexity."
                    : " Good balance of services for your needs."}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
