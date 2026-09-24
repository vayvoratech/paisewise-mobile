{{ config(
    materialized='table'
) }}

WITH events AS (

    SELECT
        user_id,
        event_name,
        occurred_at
    FROM {{ ref('stg_events') }}
    WHERE user_id IS NOT NULL

),

users AS (

    SELECT DISTINCT user_id
    FROM events

),

app_opened AS (

    SELECT
        u.user_id,
        MIN(e.occurred_at) AS app_opened_at
    FROM users u
    LEFT JOIN events e
        ON e.user_id = u.user_id
       AND e.event_name = 'app_opened'
    GROUP BY u.user_id

),

signup_started AS (

    SELECT
        a.user_id,
        a.app_opened_at,
        MIN(e.occurred_at) AS signup_started_at
    FROM app_opened a
    LEFT JOIN events e
        ON e.user_id = a.user_id
       AND e.event_name = 'signup_started'
       AND e.occurred_at > a.app_opened_at
    GROUP BY
        a.user_id,
        a.app_opened_at

),

registered AS (

    SELECT
        s.user_id,
        s.app_opened_at,
        s.signup_started_at,
        MIN(e.occurred_at) AS registered_at
    FROM signup_started s
    LEFT JOIN events e
        ON e.user_id = s.user_id
       AND e.event_name = 'registration_success'
       AND e.occurred_at > s.signup_started_at
    GROUP BY
        s.user_id,
        s.app_opened_at,
        s.signup_started_at

),

onboarding_started AS (

    SELECT
        r.user_id,
        r.app_opened_at,
        r.signup_started_at,
        r.registered_at,
        MIN(e.occurred_at) AS onboarding_started_at
    FROM registered r
    LEFT JOIN events e
        ON e.user_id = r.user_id
       AND e.event_name = 'onboarding_started'
       AND e.occurred_at > r.registered_at
    GROUP BY
        r.user_id,
        r.app_opened_at,
        r.signup_started_at,
        r.registered_at

),

onboarding_completed AS (

    SELECT
        o.user_id,
        o.app_opened_at,
        o.signup_started_at,
        o.registered_at,
        o.onboarding_started_at,
        MIN(e.occurred_at) AS onboarding_completed_at
    FROM onboarding_started o
    LEFT JOIN events e
        ON e.user_id = o.user_id
       AND e.event_name = 'onboarding_step_completed'
       AND e.occurred_at > o.onboarding_started_at
    GROUP BY
        o.user_id,
        o.app_opened_at,
        o.signup_started_at,
        o.registered_at,
        o.onboarding_started_at

),

lesson_completed AS (

    SELECT
        o.user_id,
        o.app_opened_at,
        o.signup_started_at,
        o.registered_at,
        o.onboarding_started_at,
        o.onboarding_completed_at,
        MIN(e.occurred_at) AS lesson_completed_at
    FROM onboarding_completed o
    LEFT JOIN events e
        ON e.user_id = o.user_id
       AND e.event_name = 'lesson_completed'
       AND e.occurred_at > o.onboarding_completed_at
    GROUP BY
        o.user_id,
        o.app_opened_at,
        o.signup_started_at,
        o.registered_at,
        o.onboarding_started_at,
        o.onboarding_completed_at

),

quiz_completed AS (

    SELECT
        l.user_id,
        l.app_opened_at,
        l.signup_started_at,
        l.registered_at,
        l.onboarding_started_at,
        l.onboarding_completed_at,
        l.lesson_completed_at,
        MIN(e.occurred_at) AS quiz_completed_at
    FROM lesson_completed l
    LEFT JOIN events e
        ON e.user_id = l.user_id
       AND e.event_name = 'quiz_completed'
       AND e.occurred_at > l.lesson_completed_at
    GROUP BY
        l.user_id,
        l.app_opened_at,
        l.signup_started_at,
        l.registered_at,
        l.onboarding_started_at,
        l.onboarding_completed_at,
        l.lesson_completed_at

),

paper_trade AS (

    SELECT
        q.user_id,
        q.app_opened_at,
        q.signup_started_at,
        q.registered_at,
        q.onboarding_started_at,
        q.onboarding_completed_at,
        q.lesson_completed_at,
        q.quiz_completed_at,
        MIN(e.occurred_at) AS paper_trade_at
    FROM quiz_completed q
    LEFT JOIN events e
        ON e.user_id = q.user_id
       AND e.event_name = 'paper_order_placed'
       AND e.occurred_at > q.quiz_completed_at
    GROUP BY
        q.user_id,
        q.app_opened_at,
        q.signup_started_at,
        q.registered_at,
        q.onboarding_started_at,
        q.onboarding_completed_at,
        q.lesson_completed_at,
        q.quiz_completed_at

),

kyc_completed AS (

    SELECT
        p.user_id,
        p.app_opened_at,
        p.signup_started_at,
        p.registered_at,
        p.onboarding_started_at,
        p.onboarding_completed_at,
        p.lesson_completed_at,
        p.quiz_completed_at,
        p.paper_trade_at,
        MIN(e.occurred_at) AS kyc_completed_at
    FROM paper_trade p
    LEFT JOIN events e
        ON e.user_id = p.user_id
       AND e.event_name = 'kyc_completed'
       AND e.occurred_at > p.paper_trade_at
    GROUP BY
        p.user_id,
        p.app_opened_at,
        p.signup_started_at,
        p.registered_at,
        p.onboarding_started_at,
        p.onboarding_completed_at,
        p.lesson_completed_at,
        p.quiz_completed_at,
        p.paper_trade_at

),

real_trade AS (

    SELECT
        k.user_id,
        k.app_opened_at,
        k.signup_started_at,
        k.registered_at,
        k.onboarding_started_at,
        k.onboarding_completed_at,
        k.lesson_completed_at,
        k.quiz_completed_at,
        k.paper_trade_at,
        k.kyc_completed_at,
        MIN(e.occurred_at) AS real_trade_at
    FROM kyc_completed k
    LEFT JOIN events e
        ON e.user_id = k.user_id
       AND e.event_name = 'real_order_placed'
       AND e.occurred_at > k.kyc_completed_at
    GROUP BY
        k.user_id,
        k.app_opened_at,
        k.signup_started_at,
        k.registered_at,
        k.onboarding_started_at,
        k.onboarding_completed_at,
        k.lesson_completed_at,
        k.quiz_completed_at,
        k.paper_trade_at,
        k.kyc_completed_at

)

SELECT *
FROM real_trade