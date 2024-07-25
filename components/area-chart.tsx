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
  month: Date;
  models: number;
  datasets: number;
  spaces: number;
}

interface AreaChartStackedProps {
  data: ChartDataPoint[];
}

const chartConfig = {
  models: {
    label: "Models",
    color: "hsl(0, 70%, 70%)", // Light red
  },
  datasets: {
    label: "Datasets",
    color: "hsl(120, 70%, 40%)", // Darker green
  },
  spaces: {
    label: "Spaces",
    color: "hsl(210, 70%, 70%)", // Light blue
  },
} satisfies ChartConfig

export function AreaChartStacked({ data }: AreaChartStackedProps) {
  const sortedData = [...data].sort((a, b) => a.month.getTime() - b.month.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hugging Face Hub Growth</CardTitle>
        <CardDescription>
          Monthly creation trends for models, datasets, and spaces
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                const date = new Date(value);
                return date.toLocaleString('default', { month: 'short', year: 'numeric' });
              }}
            />
            <ChartTooltip
              cursor={true}
              content={
                <ChartTooltipContent
                  indicator="line"
                  hideLabel
                />
              }
            />
            <Area
              dataKey="spaces"
              type="natural"
              fill="hsl(210, 70%, 70%)"
              fillOpacity={0.4}
              stroke="hsl(210, 70%, 70%)"
              stackId="a"
            />
            <Area
              dataKey="datasets"
              type="natural"
              fill="hsl(120, 70%, 40%)"
              fillOpacity={0.2}
              stroke="hsl(120, 70%, 40%)"
              stackId="a"
            />
            <Area
              dataKey="models"
              type="natural"
              fill="hsl(0, 70%, 70%)"
              fillOpacity={0.4}
              stroke="hsl(0, 70%, 70%)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
