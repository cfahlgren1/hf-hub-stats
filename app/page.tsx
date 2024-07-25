"use client"

import { AreaChartStacked, ChartDataPoint } from "@/components/area-chart"
import { useEffect, useState } from 'react'
import * as duckdb from '@duckdb/duckdb-wasm'

export default function IndexPage() {
  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    const initDB = async () => {
      const CDN_BASE = `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@next`

      const JSDELIVR_BUNDLES = {
        mvp: {
          mainModule: `${CDN_BASE}/dist/duckdb-mvp.wasm`,
          mainWorker: `${CDN_BASE}/dist/duckdb-browser-mvp.worker.js`
        },
        eh: {
          mainModule: `${CDN_BASE}/dist/duckdb-eh.wasm`,
          mainWorker: `${CDN_BASE}/dist/duckdb-browser-eh.worker.js`
        }
      }

      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES)
      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
      )

      const worker = new Worker(worker_url)
      const logger = new duckdb.ConsoleLogger()
      const db = new duckdb.AsyncDuckDB(logger, worker)
      await db.instantiate(bundle.mainModule)

      const conn = await db.connect()

      // create views from hf parquet files
      await conn.query(`
        CREATE VIEW models AS SELECT * FROM read_parquet('https://huggingface.co/datasets/cfahlgren1/hub-stats/resolve/refs%2Fconvert%2Fparquet/models/train/0000.parquet?download=true');
        CREATE VIEW datasets AS SELECT * FROM read_parquet('https://huggingface.co/datasets/cfahlgren1/hub-stats/resolve/refs%2Fconvert%2Fparquet/datasets/train/0000.parquet?download=true');
        CREATE VIEW spaces AS SELECT * FROM read_parquet('https://huggingface.co/datasets/cfahlgren1/hub-stats/resolve/refs%2Fconvert%2Fparquet/spaces/train/0000.parquet?download=true');
      `)

      setDb(db)
      await fetchChartData(db)
    }

    initDB()
  }, [])

  const fetchChartData = async (db: duckdb.AsyncDuckDB) => {
    const conn = await db.connect()

    const result = await conn.query(`
      WITH all_data AS (
        SELECT DATE_TRUNC('month', CAST(createdAt AS DATE)) AS month, 'model' AS type FROM models
        UNION ALL
        SELECT DATE_TRUNC('month', CAST(createdAt AS DATE)) AS month, 'dataset' AS type FROM datasets
        UNION ALL
        SELECT DATE_TRUNC('month', CAST(createdAt AS DATE)) AS month, 'space' AS type FROM spaces
      )
      SELECT
        month,
        COUNT(*) FILTER (WHERE type = 'model') AS models,
        COUNT(*) FILTER (WHERE type = 'dataset') AS datasets,
        COUNT(*) FILTER (WHERE type = 'space') AS spaces
      FROM all_data
      GROUP BY month
      ORDER BY month
    `)

    const data: ChartDataPoint[] = result.toArray().map(row => ({
      month: new Date(row.month),
      models: Number(row.models),
      datasets: Number(row.datasets),
      spaces: Number(row.spaces)
    }))

    console.log(data)

    await conn.close()

    setChartData(data)
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl text-center font-extrabold leading-tight tracking-tighter md:text-4xl">
          Hugging Face Hub Stats
        </h1>
      </div>
      <div className="flex flex-col gap-4 max-w-6xl mt-10 w-full mx-auto">
        {chartData.length > 0 ? <AreaChartStacked data={chartData} /> : <p>Loading...</p>}
      </div>
    </section>
  )
}
