"use client"

import { Service } from "@/types/service"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingUp,
  Shield,
  Zap,
  Server,
  Users,
  CheckCircle2,
  Target,
  Briefcase,
  ArrowUpRight,
  ThumbsUp,
  ThumbsDown,
  Users2
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { CostDistributionPie } from "@/components/charts/CostDistributionPie"
import { Badge } from "@/components/ui/badge"

interface MobileAnalyticsProps {
  services: Service[]
  servicePlans: Array<{
    serviceId: string
    planIndex: number
  }>
}

export function MobileAnalytics({ services, servicePlans }: MobileAnalyticsProps) {
  // Calculate total costs and features
  const totalMonthlyCost = services.reduce((sum, service) => {
    const plan = service.enhanced_data.plans[
      servicePlans.find(sp => sp.serviceId === service._id)?.planIndex ?? 0
    ]
    return sum + (plan.pricing?.monthly?.base_price ?? 0)
  }, 0)

  // Aggregate all features across services
  const allFeatures = services.reduce((features, service) => {
    const plan = service.enhanced_data.plans[
      servicePlans.find(sp => sp.serviceId === service._id)?.planIndex ?? 0
    ]
    return [...features, ...plan.features.highlighted]
  }, [] as string[])

  // Cost distribution data for pie chart
  const costDistribution = services.map(service => {
    const plan = service.enhanced_data.plans[
      servicePlans.find(sp => sp.serviceId === service._id)?.planIndex ?? 0
    ]
    return {
      name: service.metadata.service_name,
      value: plan.pricing?.monthly?.base_price ?? 0
    }
  })

  return (
    <div className="space-y-4 pb-16">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Primary Stats Card */}
          <Card>
            <CardContent className="pt-6 px-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    Monthly Cost
                  </div>
                  <div className="text-2xl font-bold">${totalMonthlyCost}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Services
                  </div>
                  <div className="text-2xl font-bold">{services.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Cost Distribution</h3>
            </CardHeader>
            <CardContent>
              <CostDistributionPie 
                data={costDistribution}
                maxDisplayedServices={5}
              />
            </CardContent>
          </Card>

          {/* Resource Usage */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Resource Usage</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4 text-blue-500" />
                    Total Users
                  </div>
                  <div className="text-xl font-semibold">
                    {services.reduce((total, service) => {
                      const plan = service.enhanced_data.plans[
                        servicePlans.find(sp => sp.serviceId === service._id)?.planIndex ?? 0
                      ]
                      return total + (plan.limits?.users?.max || 0)
                    }, 0)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Server className="h-4 w-4 text-purple-500" />
                    Storage
                  </div>
                  <div className="text-xl font-semibold">
                    {services.reduce((total, service) => {
                      const plan = service.enhanced_data.plans[
                        servicePlans.find(sp => sp.serviceId === service._id)?.planIndex ?? 0
                      ]
                      return total + (plan.limits?.storage?.amount || 0)
                    }, 0)}GB
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stack Insights */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Stack Insights
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium text-sm">Security Coverage</span>
                </div>
                <div className="text-sm text-slate-600">
                  Your stack provides {services.length > 3 ? "good" : "basic"} security coverage.
                </div>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Cost Analysis</h3>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costDistribution} margin={{ bottom: 50 }}>
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => `$${value}`}
                      labelFormatter={(name) => `Service: ${name}`}
                    />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Feature Coverage</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from(new Set(allFeatures)).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {/* Market Position Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Market Insights</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Market */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">Target Markets</span>
                </div>
                <div className="space-y-2">
                  {services.map(service => (
                    <div key={service._id} className="p-2 bg-slate-50 rounded">
                      <div className="font-medium text-sm">{service.metadata.service_name}</div>
                      <div className="text-sm text-slate-600 mt-1">
                        {service.enhanced_data.market_insights?.target_market}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Use Cases */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-sm">Common Use Cases</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {services.flatMap(service => 
                    service.enhanced_data.market_insights?.common_use_cases?.map(useCase => (
                      <Badge key={`${service._id}-${useCase}`} variant="secondary">
                        {useCase}
                      </Badge>
                    )) || []
                  )}
                </div>
              </div>

              {/* Growth Trends */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-sm">Market Trends</span>
                </div>
                <div className="space-y-2">
                  {services.map(service => (
                    service.enhanced_data.market_insights?.growth_trends && (
                      <div key={service._id} className="p-2 bg-slate-50 rounded">
                        <div className="font-medium text-sm">{service.metadata.service_name}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          {service.enhanced_data.market_insights.growth_trends}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competitive Analysis Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Competitive Analysis</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              {services.map(service => (
                <div key={service._id} className="space-y-4">
                  <div className="font-medium border-b pb-2">{service.metadata.service_name}</div>
                  
                  {/* Direct Competitors */}
                  {service.enhanced_data.competitive_positioning?.direct_competitors && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users2 className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Direct Competitors</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {service.enhanced_data.competitive_positioning.direct_competitors.map(competitor => (
                          <Badge key={competitor} variant="outline">
                            {competitor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Advantages */}
                  {service.enhanced_data.competitive_positioning?.competitive_advantages && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Advantages</span>
                      </div>
                      <div className="space-y-1">
                        {service.enhanced_data.competitive_positioning.competitive_advantages.map(advantage => (
                          <div key={advantage} className="flex items-start gap-2 text-sm text-slate-600">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5" />
                            {advantage}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disadvantages */}
                  {service.enhanced_data.competitive_positioning?.competitive_disadvantages && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Disadvantages</span>
                      </div>
                      <div className="space-y-1">
                        {service.enhanced_data.competitive_positioning.competitive_disadvantages.map(disadvantage => (
                          <div key={disadvantage} className="flex items-start gap-2 text-sm text-slate-600">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5" />
                            {disadvantage}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 