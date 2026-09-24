{{ config(materialized='view') }}

select
    order_id,
    user_slot,
    symbol,
    side,
    order_type,
    status,
    failure_reason,
    placed_at,
    resolved_at
from {{ source('raw_extension', 'order_outcomes') }}