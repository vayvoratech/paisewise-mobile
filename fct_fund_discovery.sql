{{ config(materialized='table') }}

SELECT
    event_id,
    user_id,
    event_name,

    properties->>'fund_id' AS fund_id,
    properties->>'fund_name' AS fund_name,
    properties->>'fund_category' AS fund_category,
    properties->>'fund_subcategory' AS fund_subcategory,
    properties->>'risk_level' AS risk_level,

    (properties->>'investment_amount')::numeric AS investment_amount,

    occurred_at,
    DATE(occurred_at) AS event_date

FROM {{ ref('stg_events') }}

WHERE event_name IN (
    'mf_screen_viewed',
    'mf_category_filtered',
    'mf_searched',
    'fund_tapped',
    'fund_detail_viewed',
    'risk_ometer_viewed',
    'mf_investment_started',
    'mf_investment_completed'
)

AND user_id IS NOT NULL
AND properties->>'fund_id' IS NOT NULL