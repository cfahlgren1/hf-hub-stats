"use client"

import { Cell, LabelList, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface PieChartProps {
  title: string
  description?: string
  data: Array<{ name: string; value: number; fill: string }>
  dataKey: string
}

const chartConfig: ChartConfig = {
  value: {
    label: "Value",
  },
}

export function CustomPieChart({
  title,
  description,
  data,
  dataKey,
}: PieChartProps) {
  const chartColors = [
    "hsl(var(--chart-5))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-1))",
  ]

  const sortedData = [...data].sort((a, b) => b.value - a.value)
  const topItems = sortedData.slice(0, 4)
  const otherValue = sortedData
    .slice(4)
    .reduce((sum, item) => sum + item.value, 0)

  const chartData =
    otherValue > 0
      ? [
        ...topItems,
        { name: "Other", value: otherValue, fill: chartColors[4] },
      ]
      : topItems

  return (
    <Card className="bg-[var(--card-background)]">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-[var(--card-text)]">{title}</CardTitle>
        {description && (
          <CardDescription className="text-[var(--card-text)]">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[500px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideIndicator hideLabel />}
            />
            <Pie data={chartData} dataKey={dataKey} nameKey="name">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
              <LabelList
                dataKey="name"
                className="fill-background"
                stroke="none"
                fontSize={12}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
