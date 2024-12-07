"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"

import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig 
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface ServiceAnalyticsProps {
  service: {
    enhanced_data: {
      plans: Array<{
        name: string
        pricing: {
          monthly: {
            base_price: number
          }
          annual: {
            savings_percentage: number
          }
        }
      }>
      market_insights: {
        target_market: string
        common_use_cases: string[]
      }
      competitive_positioning: {
        competitive_advantages: string[]
        competitive_disadvantages: string[]
        market_position: string
      }
    }
  }
}

export function ServiceAnalytics({ service }: ServiceAnalyticsProps) {
  if (!service?.enhanced_data?.plans?.length) {
    return null
  }

  const chartData = service.enhanced_data.plans.map(plan => ({
    name: plan.name,
    monthlyPrice: plan.pricing?.monthly?.base_price || 0,
    annualSavings: plan.pricing?.annual?.savings_percentage || 0
  }))

  const chartConfig = {
    monthlyPrice: {
      label: "Monthly Price",
      color: "hsl(var(--chart-1))"
    },
    annualSavings: {
      label: "Annual Savings %",
      color: "hsl(var(--chart-2))"
    }
  } satisfies ChartConfig

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Pricing Analysis</h3>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickMargin={8}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickMargin={8}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar 
                dataKey="monthlyPrice" 
                fill="var(--color-monthlyPrice)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar 
                dataKey="annualSavings" 
                fill="var(--color-annualSavings)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Market Insights</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium text-sm mb-2">Target Market</h4>
            <p className="text-sm text-slate-600">
              {service.enhanced_data.market_insights.target_market}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-3">Competitive Analysis</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-green-600 mb-2">Advantages</p>
                <ul className="space-y-1">
                  {service.enhanced_data.competitive_positioning.competitive_advantages.map(adv => (
                    <li key={adv} className="text-sm text-slate-600 flex items-start">
                      <span className="mr-2">•</span>
                      {adv}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-red-600 mb-2">Disadvantages</p>
                <ul className="space-y-1">
                  {service.enhanced_data.competitive_positioning.competitive_disadvantages.map(dis => (
                    <li key={dis} className="text-sm text-slate-600 flex items-start">
                      <span className="mr-2">•</span>
                      {dis}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 