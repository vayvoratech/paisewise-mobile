{{ config(materialized='table') }}

select
    order_id,
    user_slot,
    symbol,
    side,
    order_type,
    status,
    failure_reason,
    placed_at,
    resolved_at,
    date(placed_at) as order_date,

    case
        when upper(status) = 'FAILED' then 1
        else 0
    end as is_failed,

    case
        when upper(status) = 'FILLED' then 1
        else 0
    end as is_filled

from {{ ref('stg_order_outcomes') }}