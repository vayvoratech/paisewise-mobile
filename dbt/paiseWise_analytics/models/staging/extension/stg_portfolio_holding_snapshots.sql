{{ config(materialized='view') }}

select
    snapshot_date,
    user_id,
    fund_id,
    fund_name,
    category,
    units,
    average_price,
    current_price,
    invested_value,
    market_value
from {{ source('raw_extension', 'portfolio_holding_snapshots') }}