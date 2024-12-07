"use client"

import { useMemo } from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector
} from "recharts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface CostDistributionProps {
  data: Array<{
    name: string
    value: number
  }>
  maxDisplayedServices?: number
}

export function CostDistributionPie({ 
  data, 
  maxDisplayedServices = 5 
}: CostDistributionProps) {
  const COLORS = [
    '#0088FE', // Blue
    '#00C49F', // Green
    '#FFBB28', // Yellow
    '#FF8042', // Orange
    '#8884d8', // Purple
    '#82ca9d', // Light Green
    '#ffc658', // Light Orange
    '#8dd1e1', // Light Blue
  ]

  const processedData = useMemo(() => {
    if (data.length <= maxDisplayedServices) {
      return data
    }

    // Sort by value in descending order
    const sortedData = [...data].sort((a, b) => b.value - a.value)
    
    // Take top services and combine the rest
    const topServices = sortedData.slice(0, maxDisplayedServices - 1)
    const otherServices = sortedData.slice(maxDisplayedServices - 1)
    
    const otherTotal = otherServices.reduce((sum, item) => sum + item.value, 0)
    const otherNames = otherServices.map(s => s.name).join(", ")

    return [
      ...topServices,
      {
        name: "Others",
        value: otherTotal,
        tooltip: `Others (${otherServices.length} services): ${otherNames}`
      }
    ]
  }, [data, maxDisplayedServices])

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null

    const data = payload[0].payload
    return (
      <div className="bg-white p-2 shadow-lg rounded-lg border">
        <div className="text-sm font-medium">
          {data.tooltip || data.name}
        </div>
        <div className="text-sm text-slate-600">
          ${data.value}
        </div>
      </div>
    )
  }

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
    value
  }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs"
      >
        ${value}
      </text>
    ) : null
  }

  return (
    <div className="w-full">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {processedData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal" 
              align="center"
              verticalAlign="bottom"
              formatter={(value, entry: any) => (
                <span className="text-xs">
                  {value} (${entry.payload.value})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 