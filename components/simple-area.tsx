"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface SimpleAreaProps {
  title: string
  description: string
  data: Array<{ date: Date; count: number }>
}

export function SimpleArea({ title, description, data }: SimpleAreaProps) {
  const chartConfig = {
    count: {
      label: "Total",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  const formattedData = data.map(item => ({
    label: item.date.toISOString().split('T')[0],
    count: item.count
  }))

  const total = data.length > 0 ? data[data.length - 1].count : 0

  return (
    <Card className="bg-[var(--card-background)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-[var(--card-text)]">{title}</CardTitle>
          <CardDescription className="text-[var(--card-text)]">
            {description}
          </CardDescription>
        </div>
        <div className="text-right">
          <span className="text-xs text-white">Total</span>
          <p className="text-2xl font-bold text-white">{total.toLocaleString()}</p>
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={formattedData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="count"
                type="natural"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.4}
                stroke="hsl(var(--chart-1))"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-[var(--card-text)]">
            Loading...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
