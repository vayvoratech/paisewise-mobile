{{ config(
    materialized='table'
) }}

WITH registered_users AS (

    SELECT
        user_id,
        MIN(occurred_at) AS registered_at
    FROM {{ ref('stg_events') }}
    WHERE event_name = 'registration_success'
      AND user_id IS NOT NULL
    GROUP BY user_id

),

cohorts AS (

    SELECT
        user_id,
        registered_at,
        DATE_TRUNC('week', registered_at)::date AS cohort_week
    FROM registered_users

),

user_metrics AS (

    SELECT
        c.user_id,
        c.cohort_week,

        MAX(
            CASE
                WHEN e.event_name = 'onboarding_step_completed'
                 AND e.occurred_at > c.registered_at
                THEN 1
                ELSE 0
            END
        ) AS completed,

        MAX(
            CASE
                WHEN e.event_name = 'app_opened'
                 AND e.occurred_at > c.registered_at
                 AND e.occurred_at <= c.registered_at + INTERVAL '7 days'
                THEN 1
                ELSE 0
            END
        ) AS returned_7d,

        MAX(
            CASE
                WHEN e.event_name = 'kyc_completed'
                 AND e.occurred_at > c.registered_at
                THEN 1
                ELSE 0
            END
        ) AS kyc_completed,

        MAX(
            CASE
                WHEN e.event_name = 'real_order_placed'
                 AND e.occurred_at > c.registered_at
                THEN 1
                ELSE 0
            END
        ) AS invested

    FROM cohorts c
    LEFT JOIN {{ ref('stg_events') }} e
        ON e.user_id = c.user_id
    GROUP BY
        c.user_id,
        c.cohort_week

),

cohort_summary AS (

    SELECT
        cohort_week,
        COUNT(*) AS cohort_users,

        SUM(completed) AS completed_users,
        SUM(returned_7d) AS returned_7d_users,
        SUM(kyc_completed) AS kyc_users,
        SUM(invested) AS invested_users

    FROM user_metrics
    GROUP BY cohort_week

)

SELECT
    cohort_week,
    cohort_users,

    completed_users,
    ROUND(
        completed_users::numeric
        / NULLIF(cohort_users, 0) * 100,
        2
    ) AS completion_rate_pct,

    returned_7d_users,
    ROUND(
        returned_7d_users::numeric
        / NULLIF(cohort_users, 0) * 100,
        2
    ) AS return_7d_rate_pct,

    kyc_users,
    ROUND(
        kyc_users::numeric
        / NULLIF(cohort_users, 0) * 100,
        2
    ) AS kyc_rate_pct,

    invested_users,
    ROUND(
        invested_users::numeric
        / NULLIF(cohort_users, 0) * 100,
        2
    ) AS investment_rate_pct

FROM cohort_summary
ORDER BY cohort_week
