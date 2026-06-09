"use client"

import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  BarChart3 
} from "lucide-react"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AdminSummary, FinancialOverview } from "../../../../../lib/api"

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export function MetricsOverview({
  summary,
  financials,
  isLoading,
}: {
  summary: AdminSummary | null
  financials: FinancialOverview | null
  isLoading: boolean
}) {
  const metrics = [
    {
      title: "Total Revenue",
      value: isLoading ? "Loading..." : formatVnd(summary?.totalRevenue || 0),
      description: "Successful payments",
      change: `${financials?.cards.refundRate || 0}% refund`,
      trend: "up",
      icon: DollarSign,
      footer: "Revenue from completed payments",
      subfooter: "Calculated from backend payment records"
    },
    {
      title: "Active Users",
      value: isLoading ? "Loading..." : (summary?.activeUsers || 0).toLocaleString(),
      description: "Currently active accounts",
      change: `${summary?.totalUsers || 0} total`,
      trend: "up",
      icon: Users,
      footer: "Registered user base",
      subfooter: `${summary?.freeUsers || 0} free / ${summary?.paidUsers || 0} paid`
    },
    {
      title: "Uploads",
      value: isLoading ? "Loading..." : (summary?.uploadsCount || 0).toLocaleString(),
      description: "Audio uploads",
      change: `${summary?.completedGenerations || 0} done`,
      trend: "up",
      icon: ShoppingCart,
      footer: "AI transcription activity",
      subfooter: `${summary?.failedGenerations || 0} failed generations`
    },
    {
      title: "Subscriptions",
      value: isLoading ? "Loading..." : (summary?.activeSubscriptions || 0).toLocaleString(),
      description: "Active subscriptions",
      change: `${summary?.successfulPayments || 0} paid`,
      trend: "up",
      icon: BarChart3,
      footer: "Plan conversion signal",
      subfooter: `${summary?.paymentsCount || 0} total payment attempts`
    },
  ]

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
      {metrics.map((metric) => {
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
        
        return (
          <Card key={metric.title} className=" cursor-pointer">
            <CardHeader>
              <CardDescription>{metric.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metric.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <TrendIcon className="h-4 w-4" />
                  {metric.change}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {metric.footer} <TrendIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                {metric.subfooter}
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
