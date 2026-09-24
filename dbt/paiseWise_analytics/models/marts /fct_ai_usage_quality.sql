{{ config(materialized='table') }}

select
    ai_call_id,
    user_id,
    feature,
    model,
    timestamp,
    tokens_input,
    tokens_output,
    tokens_input + tokens_output as total_tokens,
    cost,
    latency_ms,
    thumbs_up,
    shared,
    resolved,
    deflected
from {{ ref('stg_ai_usage_quality') }}
