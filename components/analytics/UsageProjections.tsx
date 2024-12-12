import { Card } from "@/components/ui/card"
import { ServiceMetric } from "@/types/analytics"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { TrendingUp, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UsageProjectionsProps {
  metric: ServiceMetric
  simulatedValue: number
  timeframe?: number // in days
}

export function UsageProjections({ 
  metric, 
  simulatedValue,
  timeframe = 30 
}: UsageProjectionsProps) {
  // Generate projection data points
  const generateProjectionData = () => {
    const data = []
    const currentDate = new Date()
    const growthRate = (simulatedValue - metric.value) / timeframe
    
    for (let i = 0; i <= timeframe; i++) {
      const date = new Date(currentDate)
      date.setDate(date.getDate() + i)
      
      const projectedValue = metric.value + (growthRate * i)
      data.push({
        date: date.toLocaleDateString(),
        value: Math.max(0, projectedValue),
        threshold: metric.currentPlanThreshold
      })
    }
    
    return data
  }

  const projectionData = generateProjectionData()
  const finalProjectedValue = projectionData[projectionData.length - 1].value
  
  // Calculate recommendations
  const getRecommendations = () => {
    if (!metric.currentPlanThreshold) return null
    
    const projectedOverage = finalProjectedValue - metric.currentPlanThreshold
    if (projectedOverage <= 0) return null
    
    const nextPlanCost = metric.nextPlan?.price || 0
    const overageCost = projectedOverage * (metric.costPerUnit || 0)
    
    if (metric.nextPlan && overageCost > (nextPlanCost - metric.basePrice)) {
      return {
        type: "upgrade",
        message: `Upgrading to ${metric.nextPlan.name} would be more cost-effective based on projected usage.`,
        savings: overageCost - (nextPlanCost - metric.basePrice)
      }
    }
    
    return {
      type: "warning",
      message: `Projected usage will exceed current plan limit by ${Math.round(projectedOverage)} ${metric.unit}.`,
      cost: overageCost
    }
  }

  const recommendation = getRecommendations()

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Usage Projection</h3>
            <p className="text-sm text-slate-500">Next {timeframe} days forecast</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {metric.type.toUpperCase()}
          </Badge>
        </div>

        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `${value}${metric.unit}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              {metric.currentPlanThreshold && (
                <Line
                  type="monotone"
                  dataKey="threshold"
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              recommendation.type === "upgrade" 
                ? "bg-green-50 border border-green-100" 
                : "bg-yellow-50 border border-yellow-100"
            }`}
          >
            <div className="flex items-start gap-3">
              {recommendation.type === "upgrade" ? (
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  recommendation.type === "upgrade" ? "text-green-900" : "text-yellow-900"
                }`}>
                  {recommendation.message}
                </p>
                {recommendation.type === "upgrade" && (
                  <p className="text-sm text-green-700 mt-1">
                    Potential savings: ${(recommendation.savings ?? 0).toFixed(2)}
                  </p>
                )}
                {recommendation.type === "warning" && (
                  <p className="text-sm text-yellow-700 mt-1">
                    Estimated overage cost: ${(recommendation.cost ?? 0).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  )
}
