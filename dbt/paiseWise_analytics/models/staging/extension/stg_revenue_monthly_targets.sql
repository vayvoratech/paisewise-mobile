{{ config(materialized='view') }}

select
    month,
    revenue_target
from {{ source('raw_extension', 'revenue_monthly_targets') }}