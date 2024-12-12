import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  ChevronRight, TrendingUp, 
  Users, Database, Zap, Clock, Server 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ServiceMetric } from "@/types/analytics"
import { extractMetricsFromPlan } from "./utils"
import { Service } from "@/types/service"

// Extend the ServiceMetric type locally
interface ExtendedServiceMetric extends ServiceMetric {
  trend?: 'up' | 'down' | 'stable'
}

interface ServiceUsageSummary {
  serviceName: string
  criticalCount: number
  metrics: Array<{
    name: string
    value: number
    limit: number | null
    percentage: number
    type: string
    status: 'normal' | 'warning' | 'critical'
    trend?: 'up' | 'down' | 'stable'
  }>
}

interface UsageStatusProps {
  services: Service[]
  servicePlans: Array<{
    serviceId: string
    planIndex: number
  }>
  simulatedMetrics?: Record<string, number>
  className?: string
}

export function UsageStatus({ 
  services, 
  servicePlans,
  simulatedMetrics = {},
  className 
}: UsageStatusProps) {
  // Process services to get usage summaries
  const serviceSummaries = services.map<ServiceUsageSummary>(service => {
    const planState = servicePlans.find(sp => sp.serviceId === service._id)
    if (!planState) return {
      serviceName: service.metadata.service_name,
      criticalCount: 0,
      metrics: []
    }

    const currentPlan = service.enhanced_data.plans[planState.planIndex]
    const metrics = extractMetricsFromPlan(service, currentPlan) as ExtendedServiceMetric[]
    
    const processedMetrics = metrics.map(metric => {
      const percentage = metric.currentPlanThreshold 
        ? (metric.value / metric.currentPlanThreshold) * 100 
        : 0

      let status: 'normal' | 'warning' | 'critical' = 'normal'
      if (percentage > 100) status = 'critical'
      else if (percentage > 80) status = 'warning'

      return {
        name: metric.name,
        value: metric.value,
        limit: metric.currentPlanThreshold,
        percentage,
        type: metric.type || 'other',
        status,
        trend: metric.trend
      }
    })

    return {
      serviceName: service.metadata.service_name,
      criticalCount: processedMetrics.filter(m => m.status === 'critical').length,
      metrics: processedMetrics
    }
  })

  return (
    <div className={cn("space-y-2", className)}>
      {serviceSummaries.map(summary => (
        <Collapsible key={summary.serviceName}>
          <CollapsibleTrigger className="w-full">
            <Card className={cn(
              "p-3 hover:bg-slate-50 transition-colors",
              summary.criticalCount > 0 && "border-red-200 bg-red-50 hover:bg-red-100"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">{summary.serviceName}</span>
                  {summary.criticalCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {summary.criticalCount} Critical
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-1">
            <div className="grid gap-1">
              {summary.metrics.map((metric, idx) => (
                <Card key={idx} className={cn(
                  "p-3",
                  metric.status === 'critical' && "border-red-200 bg-red-50",
                  metric.status === 'warning' && "border-yellow-200 bg-yellow-50"
                )}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {(() => {
                          switch (metric.type) {
                            case 'users':
                              return <Users className="h-4 w-4 text-blue-500" />
                            case 'storage':
                              return <Database className="h-4 w-4 text-purple-500" />
                            case 'api':
                              return <Zap className="h-4 w-4 text-yellow-500" />
                            case 'time':
                              return <Clock className="h-4 w-4 text-green-500" />
                            default:
                              return <Server className="h-4 w-4 text-slate-500" />
                          }
                        })()}
                        <span className="text-sm font-medium">{metric.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={cn(
                          metric.status === 'critical' && "text-red-700",
                          metric.status === 'warning' && "text-yellow-700",
                          metric.status === 'normal' && "text-slate-600"
                        )}>
                          {metric.value.toLocaleString()} 
                          {metric.limit ? ` / ${metric.limit.toLocaleString()}` : ' (Unlimited)'}
                        </span>
                        {metric.trend && (
                          <TrendingUp className={cn(
                            "h-3 w-3",
                            metric.trend === 'up' && "text-red-500 rotate-0",
                            metric.trend === 'down' && "text-green-500 rotate-180",
                            metric.trend === 'stable' && "text-blue-500 rotate-90"
                          )} />
                        )}
                      </div>
                    </div>
                    {metric.limit && (
                      <Badge variant={
                        metric.status === 'critical' ? 'destructive' :
                        metric.status === 'warning' ? 'outline' :
                        'secondary'
                      } className="text-xs">
                        {metric.percentage.toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                  {metric.limit && (
                    <Progress 
                      value={metric.percentage} 
                      className={cn(
                        "h-1 mt-2",
                        metric.status === 'critical' && "bg-red-100 [&>div]:bg-red-500",
                        metric.status === 'warning' && "bg-yellow-100 [&>div]:bg-yellow-500",
                        metric.status === 'normal' && "bg-blue-100 [&>div]:bg-blue-500"
                      )}
                    />
                  )}
                </Card>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}
