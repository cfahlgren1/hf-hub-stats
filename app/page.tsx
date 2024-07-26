"use client"

import { useEffect, useState } from "react"
import * as duckdb from "@duckdb/duckdb-wasm"
import { Loader2 } from "lucide-react"
import { toast } from 'sonner'

import { CREATE_VIEWS_QUERY, FETCH_CHART_DATA_QUERY, FETCH_DATASET_LICENSE_DATA_QUERY, FETCH_FINETUNE_MODEL_GROWTH_QUERY, FETCH_MODEL_LICENSE_DATA_QUERY, FETCH_SPACE_SDK_DATA_QUERY, FETCH_TOP_BASE_MODELS_TABLE_QUERY } from "@/lib/queries"
import { AreaChartStacked, ChartDataPoint } from "@/components/area-chart-stacked"
import { CustomPieChart } from "@/components/pie-chart"
import { SimpleArea } from "@/components/simple-area"
import { Button } from "@/components/ui/button"
import { GenericTable } from "@/components/simple-table"
import { CTABanner } from "@/components/cta"

export default function IndexPage() {
  const [conn, setConn] = useState<duckdb.AsyncDuckDBConnection | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [modelLicenseData, setModelLicenseData] = useState<Array<{ name: string; value: number; fill: string }>>([])
  const [datasetLicenseData, setDatasetLicenseData] = useState<Array<{ name: string; value: number; fill: string }>>([])
  const [spaceSdkData, setSpaceSdkData] = useState<Array<{ name: string; value: number; fill: string }>>([])
  const [baseModel, setBaseModel] = useState("meta-llama/Meta-Llama-3-8B")
  const [finetuneModelGrowthData, setFinetuneModelGrowthData] = useState<Array<{ date: Date; count: number }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [topFinetunedModels, setTopFinetunedModels] = useState<Array<{ model: string; finetunes: number }> | undefined>(undefined)

  useEffect(() => {
    initDB()
    return () => { if (conn) conn.close() }
  }, [])

  const initDB = async () => {
    const CDN_BASE = `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@next`

    const JSDELIVR_BUNDLES = {
      mvp: {
        mainModule: `${CDN_BASE}/dist/duckdb-mvp.wasm`,
        mainWorker: `${CDN_BASE}/dist/duckdb-browser-mvp.worker.js`,
      },
      eh: {
        mainModule: `${CDN_BASE}/dist/duckdb-eh.wasm`,
        mainWorker: `${CDN_BASE}/dist/duckdb-browser-eh.worker.js`,
      },
    }

    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES)
    const worker_url = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], {
        type: "text/javascript",
      })
    )

    const worker = new Worker(worker_url)
    const logger = new duckdb.ConsoleLogger()
    const db = new duckdb.AsyncDuckDB(logger, worker)
    await db.instantiate(bundle.mainModule)

    const connection = await db.connect()

    await connection.query(CREATE_VIEWS_QUERY)

    setConn(connection)
    await fetchChartData(connection)
  }

  const fetchChartData = async (connection: duckdb.AsyncDuckDBConnection) => {
    const result = await connection.query(FETCH_CHART_DATA_QUERY)

    const data: ChartDataPoint[] = result.toArray().map((row) => ({
      month: new Date(row.month),
      models: Number(row.models),
      datasets: Number(row.datasets),
      spaces: Number(row.spaces),
    }))

    setChartData(data)

    const [modelLicenseResult, datasetLicenseResult, spaceSdkResult, topFinetunedModelsResult] =
      await Promise.all([
        connection.query(FETCH_MODEL_LICENSE_DATA_QUERY),
        connection.query(FETCH_DATASET_LICENSE_DATA_QUERY),
        connection.query(FETCH_SPACE_SDK_DATA_QUERY),
        connection.query(FETCH_TOP_BASE_MODELS_TABLE_QUERY),
      ])

    setModelLicenseData(
      modelLicenseResult.toArray().map((row, index) => ({
        name: row.tag.replace("license:", ""),
        value: Number(row.count),
        fill: `hsl(${index * 30}, 70%, 50%)`,
      }))
    )

    setDatasetLicenseData(
      datasetLicenseResult.toArray().map((row, index) => ({
        name: row.tag.replace("license:", ""),
        value: Number(row.count),
        fill: `hsl(${index * 30}, 70%, 50%)`,
      }))
    )

    setSpaceSdkData(
      spaceSdkResult.toArray().map((row, index) => ({
        name: row.sdk,
        value: Number(row.count),
        fill: `hsl(${index * 30}, 70%, 50%)`,
      }))
    )

    setTopFinetunedModels(topFinetunedModelsResult.toArray().map(row => ({
      model: row.model,
      finetunes: Number(row.finetunes)
    })))
  }

  const handleBaseModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!conn) {
      console.warn("Database connection not established")
      toast.error("Database connection not established")
      return
    }

    setIsLoading(true)
    try {
      console.log("Fetching finetune model growth data for", baseModel)
      const result = await conn.query(FETCH_FINETUNE_MODEL_GROWTH_QUERY(baseModel))
      console.log("Received Result")
      const data = result.toArray().map((row: { date: Date; count: bigint }) => ({
        date: new Date(row.date),
        count: parseInt(row.count.toString())
      }))
      console.log("Setting finetune model growth data", data)
      setFinetuneModelGrowthData(data)
    } catch (error) {
      console.error("Error executing query:", error)
      toast.error(`Failed to fetch data for ${baseModel}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <h1 className="text-3xl text-center font-extrabold leading-tight tracking-tighter md:text-4xl">
        Hugging Face Hub Stats
      </h1>

      <div className="flex flex-col gap-4 max-w-6xl mt-10 w-full mx-auto">
        <AreaChartStacked data={chartData} />
      </div>

      <div className="flex flex-wrap gap-8 max-w-6xl mt-10 w-full mx-auto">
        <div className="flex-1 min-w-[300px]">
          <CustomPieChart
            title="Model Licenses"
            data={modelLicenseData}
            dataKey="value"
          />
        </div>
        <div className="flex-1 min-w-[300px]">
          <CustomPieChart
            title="Dataset Licenses"
            data={datasetLicenseData}
            dataKey="value"
          />
        </div>
        <div className="flex-1 min-w-[300px]">
          <CustomPieChart
            title="Space SDKs"
            data={spaceSdkData}
            dataKey="value"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 max-w-4xl my-36 w-full mx-auto">
        <h2 className="text-4xl font-bold my-10 text-center">Finetuned Model Leaderboard</h2>
        <GenericTable
          data={topFinetunedModels}
          caption="Top 10 base models by number of finetunes"
        />
      </div>


      <div className="flex flex-col items-center gap-4 max-w-6xl mt-10 w-full mx-auto">
        <h2 className="text-4xl font-bold text-center">Finetuned Model Growth</h2>
        <p className="text-center mb-4">Find how many finetuned models have been created for your favorite model</p>
        <form onSubmit={handleBaseModelSubmit} className="flex flex-col gap-2 w-full max-w-sm">
          <input
            type="text"
            value={baseModel}
            onChange={(e) => setBaseModel(e.target.value.trim())}
            placeholder="Base Model Name"
            className="px-4 w-full py-2 border rounded"
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </div>

      {finetuneModelGrowthData.length > 0 && (
        <div className="flex flex-col gap-4 max-w-4xl mt-10 w-full mx-auto">
          <SimpleArea
            title="Finetune Model Growth"
            description={`Showing the growth of finetune models over time for ${baseModel || "your favorite model"}`}
            data={finetuneModelGrowthData}
          />
        </div>
      )}
      <div className="my-48">
        <CTABanner />
      </div>
    </section>

  )
}
