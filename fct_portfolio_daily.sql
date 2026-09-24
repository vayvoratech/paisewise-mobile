{{ config(materialized='table') }}

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
from {{ ref('stg_portfolio_holding_snapshots') }}