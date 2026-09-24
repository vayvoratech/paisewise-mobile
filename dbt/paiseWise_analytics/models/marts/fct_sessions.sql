{{ config(
    materialized='table'
) }}

WITH session_events AS (

    SELECT
        session_id,
        user_id,
        occurred_at,
        event_id,
        properties

    FROM {{ ref('stg_events') }}

    WHERE session_id IS NOT NULL
),

session_aggregated AS (

    SELECT
        session_id,

        MIN(user_id::text)::uuid AS user_id,

        MIN(occurred_at) AS session_start,

        MAX(occurred_at) AS session_end,

        COUNT(*) AS event_count,

        COUNT(
            DISTINCT properties->>'screen_name'
        ) FILTER (
            WHERE properties->>'screen_name' IS NOT NULL
        ) AS screen_count

    FROM session_events

    GROUP BY session_id
)
SELECT
    session_id,
    user_id,
    session_start,
    session_end,

    EXTRACT(
        EPOCH FROM (session_end - session_start)
    )::INTEGER AS duration_seconds,

    screen_count,
    event_count,

    session_start::DATE AS date

FROM session_aggregated
