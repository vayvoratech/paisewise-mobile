{{ config(materialized='view') }}

select
    date,
    cost_type,
    cost_amount
from {{ source('raw_extension', 'operational_costs_daily') }}