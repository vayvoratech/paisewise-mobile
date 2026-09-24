{{ config(
    materialized='table'
) }}

SELECT
    event_id AS order_id,
    user_id,

    properties->>'symbol' AS symbol,

    properties->>'side' AS side,

    properties->>'order_type' AS order_type,

    (properties->>'quantity')::numeric AS quantity,

    (properties->>'price')::numeric AS price,

    occurred_at AS placed_at,

    DATE(occurred_at) AS order_date,

    EXTRACT(HOUR FROM occurred_at)::integer AS trading_hour

FROM {{ ref('stg_events') }}

WHERE event_name = 'real_order_placed'
  AND user_id IS NOT NULL
  AND properties->>'symbol' IS NOT NULL