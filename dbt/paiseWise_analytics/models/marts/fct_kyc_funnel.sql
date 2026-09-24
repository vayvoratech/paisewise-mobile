{{ config(materialized='table') }}

WITH kyc_events AS (

    SELECT
        event_id,
        user_id,
        event_name,
        properties->>'kyc_step' AS kyc_step,
        properties->>'rejection_reason' AS rejection_reason,
        properties->>'kyc_status' AS kyc_status,
        occurred_at
    FROM {{ ref('stg_events') }}
    WHERE event_name IN (
        'kyc_started',
        'kyc_step_completed',
        'kyc_pan_submitted',
        'kyc_digilocker_opened',
        'kyc_digilocker_completed',
        'kyc_video_started',
        'kyc_video_completed',
        'kyc_completed',
        'kyc_failed',
        'kyc_abandoned'
    )
    AND user_id IS NOT NULL
),

user_summary AS (

    SELECT
        user_id,

        MIN(occurred_at) FILTER (
            WHERE event_name = 'kyc_started'
        ) AS kyc_started_at,

        MIN(occurred_at) FILTER (
            WHERE event_name = 'kyc_completed'
        ) AS kyc_completed_at,

        COUNT(*) AS kyc_event_count,

        COUNT(*) FILTER (
            WHERE event_name = 'kyc_step_completed'
        ) AS step_completed_events,

        COUNT(*) FILTER (
            WHERE event_name = 'kyc_pan_submitted'
        ) AS pan_submitted_events,

        COUNT(*) FILTER (
            WHERE event_name = 'kyc_digilocker_opened'
        ) AS digilocker_opened_events,

        COUNT(*) FILTER (
            WHERE event_name = 'kyc_digilocker_completed'
        ) AS digilocker_completed_events,

        COUNT(*) FILTER (
            WHERE event_name = 'kyc_video_started'
        ) AS video_started_events,

        COUNT(*) FILTER (
            WHERE event_name = 'kyc_video_completed'
        ) AS video_completed_events,

        COUNT(*) FILTER (
            WHERE event_name = 'kyc_completed'
        ) AS completed_events,

        COUNT(*) FILTER (
            WHERE event_name = 'kyc_failed'
        ) AS failed_events,

        COUNT(*) FILTER (
            WHERE event_name = 'kyc_abandoned'
        ) AS abandoned_events,

        COUNT(DISTINCT kyc_step) FILTER (
            WHERE event_name = 'kyc_step_completed'
              AND kyc_step IS NOT NULL
        ) AS completed_step_count,

        BOOL_OR(event_name = 'kyc_started') AS kyc_started,

        BOOL_OR(event_name = 'kyc_completed') AS kyc_completed,

        BOOL_OR(event_name = 'kyc_failed') AS has_failed,

        BOOL_OR(event_name = 'kyc_abandoned') AS has_abandoned,

        MIN(occurred_at) FILTER (
            WHERE event_name = 'kyc_failed'
        ) AS first_failure_at,

        MIN(occurred_at) FILTER (
            WHERE event_name = 'kyc_abandoned'
        ) AS first_abandonment_at

    FROM kyc_events
    GROUP BY user_id
),

first_failure AS (

    SELECT DISTINCT ON (user_id)
        user_id,
        kyc_step AS first_failure_step,
        rejection_reason AS first_failure_reason
    FROM kyc_events
    WHERE event_name = 'kyc_failed'
    ORDER BY
        user_id,
        occurred_at,
        event_id
)

SELECT
    u.user_id,

    u.kyc_started_at,
    u.kyc_completed_at,

    u.kyc_started,
    u.kyc_completed,
    u.has_failed,
    u.has_abandoned,

    CASE
        WHEN NOT u.kyc_started THEN TRUE
        ELSE FALSE
    END AS has_kyc_activity_without_start,

    u.kyc_event_count,
    u.step_completed_events,
    u.pan_submitted_events,
    u.digilocker_opened_events,
    u.digilocker_completed_events,
    u.video_started_events,
    u.video_completed_events,
    u.completed_events,
    u.failed_events,
    u.abandoned_events,
    u.completed_step_count,

    u.first_failure_at,
    u.first_abandonment_at,

    f.first_failure_step,
    f.first_failure_reason,

    CASE
        WHEN u.kyc_completed THEN 'COMPLETED'
        WHEN u.has_failed AND u.has_abandoned THEN 'FAILED_AND_ABANDONED'
        WHEN u.has_failed THEN 'FAILED'
        WHEN u.has_abandoned THEN 'ABANDONED'
        WHEN u.kyc_started THEN 'IN_PROGRESS'
        ELSE 'ACTIVITY_WITHOUT_START'
    END AS kyc_outcome,

    CASE
        WHEN u.kyc_started_at IS NOT NULL
         AND u.kyc_completed_at IS NOT NULL
        THEN EXTRACT(
            EPOCH FROM (
                u.kyc_completed_at - u.kyc_started_at
            )
        ) / 86400.0
    END AS days_to_kyc_completion

FROM user_summary u

LEFT JOIN first_failure f
    ON u.user_id = f.user_id
