import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingUp, AlertCircle, DollarSign, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { ServiceMetric } from "@/types/analytics"

interface UsageInsightCardProps {
  metric: ServiceMetric
  projectedValue?: number
  projectedCost?: number
  timeframe?: string
  recommendation?: string
}

export function UsageInsightCard({
  metric,
  projectedValue,
  projectedCost,
  timeframe = "30 days",
  recommendation
}: UsageInsightCardProps) {
  const currentUsagePercentage = metric.currentPlanThreshold
    ? (metric.value / metric.currentPlanThreshold) * 100
    : 0

  const projectedUsagePercentage = metric.currentPlanThreshold && projectedValue
    ? (projectedValue / metric.currentPlanThreshold) * 100
    : 0

  const getStatusColor = (percentage: number) => {
    if (percentage > 90) return "text-red-500"
    if (percentage > 75) return "text-yellow-500"
    return "text-green-500"
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{metric.name}</h3>
            <p className="text-sm text-slate-500">{metric.serviceName}</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {metric.planName}
          </Badge>
        </div>

        {/* Current Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Current Usage</span>
            <span className={getStatusColor(currentUsagePercentage)}>
              {metric.value} {metric.unit}
            </span>
          </div>
          <Progress value={currentUsagePercentage} className="h-2" />
        </div>

        {/* Projected Usage */}
        {projectedValue && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Projected Usage ({timeframe})</span>
              <span className={getStatusColor(projectedUsagePercentage)}>
                {projectedValue} {metric.unit}
              </span>
            </div>
            <Progress value={projectedUsagePercentage} className="h-2" />
          </div>
        )}

        {/* Cost Analysis */}
        {projectedCost && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Projected Cost</span>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-semibold text-slate-900"
              >
                ${projectedCost.toFixed(2)}
              </motion.div>
            </div>
          </div>
        )}

        {/* Recommendation */}
        {recommendation && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Recommendation</p>
              <p className="text-sm text-blue-700">{recommendation}</p>
            </div>
          </div>
        )}

        {/* Plan Thresholds */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          {metric.nextPlan && (
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Next Tier: {metric.nextPlan.name}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Limit: {metric.nextPlan.limit} {metric.unit}</p>
                <p>Price: ${metric.nextPlan.price}/mo</p>
              </TooltipContent>
            </Tooltip>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4" />
            <span>Updated just now</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
