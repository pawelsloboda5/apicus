// components/analytics/MetricCard.tsx
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"
import { motion } from "framer-motion"

const metricStyles = cva(
  "relative overflow-hidden rounded-xl border transition-all duration-300",
  {
    variants: {
      trend: {
        positive: "bg-gradient-to-br from-green-50 to-white border-green-100",
        negative: "bg-gradient-to-br from-red-50 to-white border-red-100",
        neutral: "bg-gradient-to-br from-blue-50 to-white border-blue-100",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      trend: "neutral",
      size: "default",
    },
  }
)

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subValue?: string
  trend?: {
    value: number
    label: string
  }
  percentage?: number
  size?: "sm" | "default" | "lg"
  className?: string
}

export function MetricCard({
  icon,
  label,
  value,
  subValue,
  trend,
  percentage,
  size,
  className,
}: MetricCardProps) {
  const trendType = trend?.value !== undefined 
    ? trend.value > 0 ? "positive" 
    : trend.value < 0 ? "negative" 
    : "neutral"
    : "neutral"

  return (
    <div className={cn(metricStyles({ trend: trendType, size }), className)}>
      {/* Progress bar */}
      {percentage !== undefined && (
        <motion.div 
          className="absolute bottom-0 left-0 h-1 bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}

      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          "p-2 rounded-lg",
          trendType === "positive" && "bg-green-100 text-green-700",
          trendType === "negative" && "bg-red-100 text-red-700",
          trendType === "neutral" && "bg-blue-100 text-blue-700",
        )}>
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <motion.div 
          className="text-2xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {value}
        </motion.div>
        {trend && (
          <motion.div 
            className={cn(
              "text-sm font-medium",
              trend.value > 0 ? "text-green-600" : "text-red-600"
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {trend.value > 0 ? "+" : ""}{trend.value}% {trend.label}
          </motion.div>
        )}
      </div>
    </div>
  )
}