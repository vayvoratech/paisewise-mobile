{{ config(materialized='view') }}

select
    ai_call_id,
    user_id,
    feature,
    model,
    timestamp,
    tokens_input,
    tokens_output,
    cost,
    latency_ms,
    thumbs_up,
    shared,
    resolved,
    deflected
from {{ source('raw_extension', 'ai_usage_quality') }}