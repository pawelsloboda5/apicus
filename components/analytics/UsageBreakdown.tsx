import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ServiceMetric } from "@/types/analytics"
import { Service } from "@/types/service"
import { 
  TrendingUp, TrendingDown, ArrowRight,
  Clock, AlertTriangle, CheckCircle2 
} from "lucide-react"

interface UsageBreakdownProps {
  service: Service
  metrics: ServiceMetric[]
  simulatedValues?: Record<string, number>
  className?: string
}

interface MetricDisplay {
  name: string
  value: number
  limit: number | null
  percentage: number
  trend: number // percentage change
  status: 'normal' | 'warning' | 'critical'
  nextTierInfo?: {
    name: string
    limit: number
  }
}

export function UsageBreakdown({ service, metrics = [], simulatedValues = {}, className }: UsageBreakdownProps) {
  // Handle case when metrics is undefined or empty
  if (!metrics || metrics.length === 0) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="text-center text-sm text-slate-500">
          No usage metrics available
        </div>
      </Card>
    )
  }

  const processedMetrics = metrics.map<MetricDisplay>(metric => {
    const currentValue = simulatedValues?.[metric.id] || metric.value
    const percentage = metric.currentPlanThreshold 
      ? (currentValue / metric.currentPlanThreshold) * 100 
      : 0
    
    // Calculate trend (you would typically get this from historical data)
    const trend = metric.value > 0 ? ((currentValue - metric.value) / metric.value) * 100 : 0

    let status: 'normal' | 'warning' | 'critical' = 'normal'
    if (percentage > 100) status = 'critical'
    else if (percentage > 80) status = 'warning'

    return {
      name: metric.name,
      value: currentValue,
      limit: metric.currentPlanThreshold,
      percentage,
      trend,
      status,
      nextTierInfo: metric.nextPlan ? {
        name: metric.nextPlan.name,
        limit: metric.nextPlan.limit || 0
      } : undefined
    }
  })

  return (
    <Card className={cn("p-4", className)}>
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-3">
            {processedMetrics.map((metric, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metric.name}</span>
                    {metric.status === 'critical' && (
                      <Badge variant="destructive" className="text-xs">Critical</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {metric.trend !== 0 && (
                      <div className={cn(
                        "flex items-center text-xs",
                        metric.trend > 0 ? "text-red-500" : "text-green-500"
                      )}>
                        {metric.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(metric.trend).toFixed(1)}%
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {metric.value.toLocaleString()}
                      {metric.limit ? ` / ${metric.limit.toLocaleString()}` : ' (∞)'}
                    </span>
                  </div>
                </div>

                {metric.limit ? (
                  <div className="relative">
                    <Progress 
                      value={Math.min(metric.percentage, 100)} 
                      className={cn(
                        "h-2",
                        metric.status === 'critical' && "bg-red-100 [&>div]:bg-red-500",
                        metric.status === 'warning' && "bg-yellow-100 [&>div]:bg-yellow-500",
                        metric.status === 'normal' && "bg-blue-100 [&>div]:bg-blue-500"
                      )}
                    />
                    {metric.nextTierInfo && (
                      <div 
                        className="absolute top-1/2 w-px h-3 bg-slate-400 transform -translate-y-1/2"
                        style={{ 
                          left: `${(metric.limit / metric.nextTierInfo.limit) * 100}%`,
                          display: metric.percentage > 80 ? 'block' : 'none'
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Unlimited in current plan
                  </div>
                )}

                {metric.status === 'critical' && metric.nextTierInfo && (
                  <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    Next tier ({metric.nextTierInfo.name}): {metric.nextTierInfo.limit.toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="simulation" className="mt-4">
          {/* Simulation content - to be implemented based on service configuration changes */}
        </TabsContent>

        <TabsContent value="projections" className="mt-4">
          {/* Projections content - to be implemented based on usage trends */}
        </TabsContent>
      </Tabs>
    </Card>
  )
}