{{ config(materialized='table') }}

select
    metadata_id,
    pipeline_name,
    run_at,
    source_last_event_at,
    model_refresh_at,
    pipeline_status,
    status_message,
    date(run_at) as run_date,
    date(source_last_event_at) as source_event_date,
    date(model_refresh_at) as model_refresh_date
from {{ ref('stg_pipeline_metadata') }}
