{{ config(materialized='view') }}

select
    metadata_id,
    pipeline_name,
    run_at,
    source_last_event_at,
    model_refresh_at,
    pipeline_status,
    status_message
from {{ source('raw_extension', 'pipeline_metadata') }}