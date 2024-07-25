"use client"

import { useEffect, useState } from "react"
import * as duckdb from "@duckdb/duckdb-wasm"

import {
  CREATE_VIEWS_QUERY,
  FETCH_CHART_DATA_QUERY,
  FETCH_DATASET_LICENSE_DATA_QUERY,
  FETCH_MODEL_LICENSE_DATA_QUERY,
  FETCH_SPACE_SDK_DATA_QUERY,
} from "@/lib/queries"
import { AreaChartStacked, ChartDataPoint } from "@/components/area-chart"
import { CustomPieChart } from "@/components/pie-chart"

export default function IndexPage() {
  const [conn, setConn] = useState<duckdb.AsyncDuckDBConnection | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [modelLicenseData, setModelLicenseData] = useState<
    Array<{ name: string; value: number; fill: string }>
  >([])
  const [datasetLicenseData, setDatasetLicenseData] = useState<
    Array<{ name: string; value: number; fill: string }>
  >([])
  const [spaceSdkData, setSpaceSdkData] = useState<
    Array<{ name: string; value: number; fill: string }>
  >([])

  useEffect(() => {
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

    initDB()

    // Clean up the connection when the component unmounts
    return () => {
      if (conn) {
        conn.close()
      }
    }
  }, [])

  const fetchChartData = async (connection: duckdb.AsyncDuckDBConnection) => {
    // Use the imported query
    const result = await connection.query(FETCH_CHART_DATA_QUERY)

    const data: ChartDataPoint[] = result.toArray().map((row) => ({
      month: new Date(row.month),
      models: Number(row.models),
      datasets: Number(row.datasets),
      spaces: Number(row.spaces),
    }))

    setChartData(data)

    const [modelLicenseResult, datasetLicenseResult, spaceSdkResult] =
      await Promise.all([
        connection.query(FETCH_MODEL_LICENSE_DATA_QUERY),
        connection.query(FETCH_DATASET_LICENSE_DATA_QUERY),
        connection.query(FETCH_SPACE_SDK_DATA_QUERY),
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
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl text-center font-extrabold leading-tight tracking-tighter md:text-4xl">
          Hugging Face Hub Stats
        </h1>
      </div>
      <div className="flex flex-col gap-4 max-w-6xl mt-10 w-full mx-auto">
        {chartData.length > 0 ? (
          <AreaChartStacked data={chartData} />
        ) : (
          <p>Loading...</p>
        )}
      </div>
      {modelLicenseData.length > 0 &&
        datasetLicenseData.length > 0 &&
        spaceSdkData.length > 0 && (
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
        )}
    </section>
  )
}
