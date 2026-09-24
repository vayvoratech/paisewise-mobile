{{ config(
    materialized='table'
) }}

WITH lesson_starts AS (

    SELECT
        properties->>'lesson_id' AS lesson_id,
        user_id,
        MIN(occurred_at) AS first_started_at
    FROM {{ ref('stg_events') }}
    WHERE event_name = 'lesson_started'
      AND user_id IS NOT NULL
      AND properties->>'lesson_id' IS NOT NULL
    GROUP BY
        properties->>'lesson_id',
        user_id

),

lesson_completions AS (

    SELECT
        properties->>'lesson_id' AS lesson_id,
        user_id,
        MIN(occurred_at) AS first_completed_at
    FROM {{ ref('stg_events') }}
    WHERE event_name = 'lesson_completed'
      AND user_id IS NOT NULL
      AND properties->>'lesson_id' IS NOT NULL
    GROUP BY
        properties->>'lesson_id',
        user_id

),

lesson_metrics AS (

    SELECT
        s.lesson_id,
        COUNT(*) AS started_users,
        COUNT(c.user_id) AS completed_users,

        ROUND(
            COUNT(c.user_id)::numeric
            / NULLIF(COUNT(*), 0) * 100,
            2
        ) AS completion_rate_pct,

        ROUND(
            100 -
            COUNT(c.user_id)::numeric
            / NULLIF(COUNT(*), 0) * 100,
            2
        ) AS dropoff_rate_pct

    FROM lesson_starts s
    LEFT JOIN lesson_completions c
        ON c.lesson_id = s.lesson_id
       AND c.user_id = s.user_id
       AND c.first_completed_at > s.first_started_at

    GROUP BY s.lesson_id

)

SELECT
    *,
    ROW_NUMBER() OVER (
        ORDER BY completion_rate_pct ASC, started_users DESC
    ) AS dropoff_rank
FROM lesson_metrics
ORDER BY dropoff_rank