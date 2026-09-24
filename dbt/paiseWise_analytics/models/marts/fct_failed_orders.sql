{{ config(materialized='table') }}

SELECT
    event_id AS failure_event_id,
    user_id,

    properties->>'order_id' AS order_id,
    properties->>'symbol' AS symbol,
    properties->>'side' AS side,
    properties->>'order_type' AS order_type,

    (properties->>'quantity')::numeric AS quantity,
    (properties->>'price')::numeric AS price,

    properties->>'failure_reason' AS failure_reason,

    occurred_at AS failed_at,
    DATE(occurred_at) AS failure_date,
    EXTRACT(HOUR FROM occurred_at)::integer AS failure_hour

FROM {{ ref('stg_events') }}

WHERE event_name = 'real_order_failed'
  AND user_id IS NOT NULL
  AND properties->>'order_id' IS NOT NULL
