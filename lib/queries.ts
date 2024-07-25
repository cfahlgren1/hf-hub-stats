export const CREATE_VIEWS_QUERY = `
  CREATE VIEW models AS SELECT * FROM read_parquet('https://huggingface.co/datasets/cfahlgren1/hub-stats/resolve/refs%2Fconvert%2Fparquet/models/train/0000.parquet?download=true');
  CREATE VIEW datasets AS SELECT * FROM read_parquet('https://huggingface.co/datasets/cfahlgren1/hub-stats/resolve/refs%2Fconvert%2Fparquet/datasets/train/0000.parquet?download=true');
  CREATE VIEW spaces AS SELECT * FROM read_parquet('https://huggingface.co/datasets/cfahlgren1/hub-stats/resolve/refs%2Fconvert%2Fparquet/spaces/train/0000.parquet?download=true');
`

export const FETCH_CHART_DATA_QUERY = `
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
`

export const FETCH_MODEL_LICENSE_DATA_QUERY = `
  SELECT tag, COUNT(*) as count
  FROM models, UNNEST(tags) AS t(tag)
  WHERE tag LIKE 'license:%'
  GROUP BY tag;
`

export const FETCH_DATASET_LICENSE_DATA_QUERY = `
  SELECT tag, COUNT(*) as count
  FROM datasets, UNNEST(tags) AS t(tag)
  WHERE tag LIKE 'license:%'
  GROUP BY tag;
`

export const FETCH_SPACE_SDK_DATA_QUERY = `
  SELECT sdk, COUNT(*) as count
  FROM spaces
  GROUP BY sdk;
`
