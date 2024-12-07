"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip,
  ResponsiveContainer,
  Label
} from "recharts"

interface StackAnalyticsProps {
  services: Array<{
    _id: string;
    metadata: {
      service_name: string;
    }
    enhanced_data: {
      plans: Array<{
        pricing: {
          monthly: {
            base_price: number;
          }
        }
      }>
    }
  }>;
  servicePlans: Array<{
    serviceId: string;
    planIndex: number;
  }>;
}

const MAX_SERVICE_NAME_LENGTH = 20;

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export function StackAnalytics({ services, servicePlans }: StackAnalyticsProps) {
  const getServicePrice = (service: any) => {
    const planState = servicePlans.find(sp => sp.serviceId === service._id)
    return service.enhanced_data.plans[planState?.planIndex || 0]?.pricing.monthly.base_price || 0;
  };

  const chartData = services.map(service => ({
    name: service.metadata.service_name,
    displayName: truncateText(service.metadata.service_name, MAX_SERVICE_NAME_LENGTH),
    cost: getServicePrice(service)
  })).sort((a, b) => b.cost - a.cost);

  const totalCost = chartData.reduce((sum, item) => sum + item.cost, 0);

  if (services.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-slate-500">
              Add services to your stack to see cost analysis
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stack Cost Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ top: 5, right: 5, left: 80, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  horizontal={false}
                  stroke="#e5e7eb"
                />
                <XAxis 
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickMargin={4}
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={(value) => `$${value}`}
                >
                  <Label
                    value="Monthly Cost"
                    position="bottom"
                    offset={-4}
                    style={{ textAnchor: 'middle', fill: '#6b7280', fontSize: 11 }}
                  />
                </XAxis>
                <YAxis 
                  type="category"
                  dataKey="displayName"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickMargin={4}
                  width={75}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload?.[0]?.value) {
                      const service = chartData.find(s => s.displayName === label);
                      return (
                        <div className="bg-white p-3 shadow-lg rounded-lg border">
                          <p className="font-medium text-sm mb-1">{service?.name}</p>
                          <p className="text-sm text-slate-600">
                            Cost: <span className="font-mono">${payload[0].value}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {((Number(payload[0].value) / totalCost) * 100).toFixed(1)}% of total
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Bar 
                  dataKey="cost" 
                  fill="hsl(var(--chart-1))"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-600">Total Monthly Cost</div>
              <div className="text-3xl font-bold font-mono">${totalCost}</div>
            </div>
            {chartData.length > 0 && (
              <div>
                <div className="text-sm text-slate-600">Cost Breakdown</div>
                <div className="space-y-2 mt-2">
                  {chartData.map(item => (
                    <div 
                      key={item.name} 
                      className="flex justify-between items-center p-2 rounded hover:bg-slate-50"
                      title={item.name}
                    >
                      <div className="space-y-1">
                        <span className="text-sm font-medium">{item.displayName}</span>
                        <div className="text-xs text-slate-500">
                          {((item.cost / totalCost) * 100).toFixed(1)}% of total
                        </div>
                      </div>
                      <span className="text-sm font-mono font-medium">${item.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 