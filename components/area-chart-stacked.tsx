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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export interface ChartDataPoint {
  month: Date
  models: number
  datasets: number
  spaces: number
}

interface AreaChartStackedProps {
  data: ChartDataPoint[]
}

const chartConfig = {
  models: {
    label: "Models",
    color: "hsl(var(--chart-1))",
  },
  datasets: {
    label: "Datasets",
    color: "hsl(var(--chart-2))",
  },
  spaces: {
    label: "Spaces",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function AreaChartStacked({ data }: AreaChartStackedProps) {
  const sortedData = [...data].sort(
    (a, b) => a.month.getTime() - b.month.getTime()
  )

  return (
    <Card className="bg-[var(--card-background)]">
      <CardHeader>
        <CardTitle className="text-[var(--card-text)]">
          Hugging Face Hub Growth Each Month
        </CardTitle>
        <CardDescription className="text-[var(--card-text)]">
          Monthly creation trends for models, datasets, and spaces
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={sortedData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleString("default", {
                    month: "short",
                    year: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent indicator="line" hideLabel />}
              />
              <Area
                dataKey="spaces"
                type="natural"
                fill="hsl(var(--chart-3))"
                fillOpacity={0.4}
                stroke="hsl(var(--chart-3))"
                stackId="a"
              />
              <Area
                dataKey="datasets"
                type="natural"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.2}
                stroke="hsl(var(--chart-2))"
                stackId="a"
              />
              <Area
                dataKey="models"
                type="natural"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.4}
                stroke="hsl(var(--chart-1))"
                stackId="a"
              />
              <ChartLegend
                content={<ChartLegendContent className="text-white" />}
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
