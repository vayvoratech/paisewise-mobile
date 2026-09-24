WITH funnel AS (

    SELECT *
    FROM {{ ref('fct_master_conversion_funnel') }}

),

stages AS (

    SELECT
        1 AS stage_order,
        'App Opened' AS stage,
        COUNT(app_opened_at) AS users
    FROM funnel

    UNION ALL

    SELECT
        2,
        'Signup Started',
        COUNT(signup_started_at)
    FROM funnel

    UNION ALL

    SELECT
        3,
        'Registration Success',
        COUNT(registered_at)
    FROM funnel

    UNION ALL

    SELECT
        4,
        'Onboarding Started',
        COUNT(onboarding_started_at)
    FROM funnel

    UNION ALL

    SELECT
        5,
        'Onboarding Completed',
        COUNT(onboarding_completed_at)
    FROM funnel

    UNION ALL

    SELECT
        6,
        'Lesson Completed',
        COUNT(lesson_completed_at)
    FROM funnel

    UNION ALL

    SELECT
        7,
        'Quiz Completed',
        COUNT(quiz_completed_at)
    FROM funnel

    UNION ALL

    SELECT
        8,
        'Paper Trade',
        COUNT(paper_trade_at)
    FROM funnel

    UNION ALL

    SELECT
        9,
        'KYC Completed',
        COUNT(kyc_completed_at)
    FROM funnel

    UNION ALL

    SELECT
        10,
        'Real Trade',
        COUNT(real_trade_at)
    FROM funnel

),

final AS (

    SELECT
        stage_order,
        stage,
        users,

        ROUND(
            users::numeric
            / NULLIF(
                FIRST_VALUE(users) OVER (
                    ORDER BY stage_order
                ),
                0
            ) * 100,
            2
        ) AS conversion_from_start_pct,

        ROUND(
            users::numeric
            / NULLIF(
                LAG(users) OVER (
                    ORDER BY stage_order
                ),
                0
            ) * 100,
            2
        ) AS conversion_from_previous_pct

    FROM stages

)

SELECT
    stage_order,
    stage,
    users,
    conversion_from_start_pct,
    conversion_from_previous_pct
FROM final
ORDER BY stage_order
