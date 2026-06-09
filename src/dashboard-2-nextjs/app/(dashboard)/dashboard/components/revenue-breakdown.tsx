"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { MarketingAttributionSummary } from "../../../../../lib/api"

const chartConfig = {
  users: {
    label: "Users",
  },
  source1: {
    label: "Source 1",
    color: "var(--chart-1)",
  },
  source2: {
    label: "Source 2",
    color: "var(--chart-2)",
  },
  source3: {
    label: "Source 3",
    color: "var(--chart-3)",
  },
  source4: {
    label: "Source 4",
    color: "var(--chart-4)",
  },
}

export function RevenueBreakdown({ attribution }: { attribution: MarketingAttributionSummary | null }) {
  const id = "marketing-attribution"
  const attributionData = React.useMemo(() => {
    const total = attribution?.sources.reduce((sum, item) => sum + item.users, 0) || 0
    return (attribution?.sources || []).slice(0, 4).map((item, index) => ({
      category: `source${index + 1}`,
      label: item.source,
      users: item.users,
      value: total ? Math.round((item.users / total) * 100) : 0,
      fill: `var(--color-source${index + 1})`,
    }))
  }, [attribution])
  const hasAttribution = attributionData.length > 0

  const [activeCategory, setActiveCategory] = React.useState("source1")

  const activeIndex = React.useMemo(() => {
    const index = attributionData.findIndex((item) => item.category === activeCategory)
    return index === -1 ? 0 : index
  }, [activeCategory, attributionData])

  const categories = React.useMemo(() => attributionData.map((item) => item.category), [attributionData])

  return (
    <Card data-chart={id} className="flex flex-col cursor-pointer">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-2">
        <div>
          <CardTitle>Marketing Attribution</CardTitle>
          <CardDescription>First-touch users by UTM source</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger
              className="w-[175px] rounded-lg cursor-pointer"
              aria-label="Select a category"
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-lg">
              {categories.map((key) => {
                const config = chartConfig[key as keyof typeof chartConfig]

                if (!config) {
                  return null
                }

                return (
                  <SelectItem
                    key={key}
                    value={key}
                    className="rounded-md [&_span]:flex cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-3 w-3 shrink-0 "
                        style={{
                          backgroundColor: `var(--color-${key})`,
                        }}
                      />
                      {attributionData.find((item) => item.category === key)?.label || config?.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <Button variant="outline" className="cursor-pointer">
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center">
        {!hasAttribution ? (
          <div className="flex min-h-[300px] w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No attribution data yet. New signups with UTM links will appear here after the backend is deployed.
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="flex justify-center">
            <ChartContainer
              id={id}
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={attributionData}
                  dataKey="users"
                  nameKey="category"
                  innerRadius={60}
                  strokeWidth={5}
                  activeShape={({
                    outerRadius = 0,
                    ...props
                  }: PieSectorDataItem) => (
                    <g>
                      <Sector {...props} outerRadius={outerRadius + 10} />
                      <Sector
                        {...props}
                        outerRadius={outerRadius + 25}
                        innerRadius={outerRadius + 12}
                      />
                    </g>
                  )}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {attributionData[activeIndex].users}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Users
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          <div className="flex flex-col justify-center space-y-4">
            {attributionData.map((item, index) => {
              const config = chartConfig[item.category as keyof typeof chartConfig]
              const isActive = index === activeIndex

              return (
                <div
                  key={item.category}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                    isActive ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveCategory(item.category)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: `var(--color-${item.category})`,
                      }}
                    />
                    <span className="font-medium">{item.label || config?.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.users.toLocaleString()} users</div>
                    <div className="text-sm text-muted-foreground">{item.value}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  )
}
