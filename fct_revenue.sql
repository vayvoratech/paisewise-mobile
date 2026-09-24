{{ config(materialized='table') }}

SELECT
    r.transaction_id,
    r.user_id,
    r.occurred_at,
    r.revenue_source,
    r.gross_revenue,
    r.reference_id,
    r.currency,
    u.cohort_week
FROM {{ source('raw_revenue', 'revenue_transactions') }} r
LEFT JOIN {{ ref('dim_users') }} u
    ON r.user_id = u.user_id