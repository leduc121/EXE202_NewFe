import { Card, CardContent } from "@/components/ui/card"
import {Users, CreditCard, UserCheck, Clock5, TrendingUp, TrendingDown, ArrowUpRight} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'
import type { AdminSummary } from "../../../../../lib/api"

export function StatCards({
  summary,
  isLoading,
}: {
  summary: AdminSummary | null
  isLoading: boolean
}) {
  const performanceMetrics = [
    {
      title: 'Total Users',
      current: isLoading ? 'Loading...' : (summary?.totalUsers || 0).toLocaleString(),
      previous: 'registered accounts',
      growth: 0,
      icon: Users,
    },
    {
      title: 'Paid Users',
      current: isLoading ? 'Loading...' : (summary?.paidUsers || 0).toLocaleString(),
      previous: `${summary?.freeUsers || 0} free users`,
      growth: 0,
      icon: CreditCard,
    },
    {
      title: 'Active Users',
      current: isLoading ? 'Loading...' : (summary?.activeUsers || 0).toLocaleString(),
      previous: 'active accounts',
      growth: 0,
      icon: UserCheck,
    },
    {
      title: 'Subscriptions',
      current: isLoading ? 'Loading...' : (summary?.activeSubscriptions || 0).toLocaleString(),
      previous: 'active subscriptions',
      growth: 0,
      icon: Clock5,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {performanceMetrics.map((metric, index) => (
        <Card key={index} className='border'>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <metric.icon className='text-muted-foreground size-6' />
              <Badge
                variant='outline'
                className={cn(
                  metric.growth >= 0
                    ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400'
                    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400',
                )}
              >
                {metric.growth >= 0 ? (
                  <>
                    <TrendingUp className='me-1 size-3' />
                    {metric.growth >= 0 ? '+' : ''}
                    {metric.growth}%
                  </>
                ) : (
                  <>
                    <TrendingDown className='me-1 size-3' />
                    {metric.growth}%
                  </>
                )}
              </Badge>
            </div>

            <div className='space-y-2'>
              <p className='text-muted-foreground text-sm font-medium'>{metric.title}</p>
              <div className='text-2xl font-bold'>{metric.current}</div>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <span>{metric.previous}</span>
                <ArrowUpRight className='size-3' />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
