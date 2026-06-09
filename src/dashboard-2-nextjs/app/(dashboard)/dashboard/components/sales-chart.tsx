"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { FinancialOverview } from "../../../../../lib/api"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
  costs: {
    label: "Costs",
    color: "var(--primary)",
  },
}

export function SalesChart({ financials }: { financials: FinancialOverview | null }) {
  const [timeRange, setTimeRange] = useState("12m")
  const chartData = financials?.revenueOverview.monthly.map((item) => {
    const cost = financials.costsBreakdown.monthly.find((row) => row.month === item.month)
    return {
      month: item.label,
      revenue: item.revenue,
      costs: cost?.totalCosts || 0,
    }
  }) || []

  return (
    <Card className="cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Revenue Performance</CardTitle>
          <CardDescription>Monthly revenue and estimated costs</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m" className="cursor-pointer">Last 3 months</SelectItem>
              <SelectItem value="6m" className="cursor-pointer">Last 6 months</SelectItem>
              <SelectItem value="12m" className="cursor-pointer">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="cursor-pointer">
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-6">
        <div className="px-6 pb-6">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-costs)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-costs)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN")}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="costs"
                stackId="1"
                stroke="var(--color-costs)"
                fill="url(#colorCosts)"
                strokeDasharray="5 5"
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stackId="2"
                stroke="var(--color-revenue)"
                fill="url(#colorRevenue)"
                strokeWidth={1}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
