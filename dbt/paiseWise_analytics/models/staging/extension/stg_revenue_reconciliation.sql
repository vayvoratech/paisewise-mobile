{{ config(materialized='view') }}

select
    reconciliation_id,
    reconciliation_date,
    source_revenue,
    warehouse_revenue,
    difference_amount,
    difference_pct,
    status
from {{ source('raw_extension', 'revenue_reconciliation') }}