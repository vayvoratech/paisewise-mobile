with events as (

    select *
    from {{ ref('stg_events') }}
    where user_id is not null

),

stage_users as (

    select
        date,
        count(distinct user_id) filter (where event_name = 'app_opened')
            as stage_app_opened,
        count(distinct user_id) filter (where event_name = 'signup_started')
            as stage_signup_started,
        count(distinct user_id) filter (where event_name = 'registration_success')
            as stage_registered,
        count(distinct user_id) filter (where event_name = 'goal_selected')
            as stage_goal_selected,
        count(distinct user_id) filter (where event_name = 'lesson_completed')
            as stage_lesson_completed,
        count(distinct user_id) filter (where event_name = 'quiz_completed')
            as stage_quiz_completed,
        count(distinct user_id) filter (where event_name = 'paper_order_placed')
            as stage_paper_trade,
        count(distinct user_id) filter (where event_name = 'kyc_completed')
            as stage_kyc_completed,
        count(distinct user_id) filter (where event_name = 'real_order_placed')
            as stage_real_trade
    from events
    group by date

)

select
    date,
    stage_app_opened,
    stage_signup_started,
    stage_registered,
    stage_goal_selected,
    stage_lesson_completed,
    stage_quiz_completed,
    stage_paper_trade,
    stage_kyc_completed,
    stage_real_trade,
    round(
        stage_signup_started::numeric
        / nullif(stage_app_opened, 0) * 100, 2
    ) as conv_open_to_signup_pct,
    round(
        stage_registered::numeric
        / nullif(stage_signup_started, 0) * 100, 2
    ) as conv_signup_to_registered_pct,
    round(
        stage_lesson_completed::numeric
        / nullif(stage_registered, 0) * 100, 2
    ) as conv_registered_to_lesson_pct,
    round(
        stage_paper_trade::numeric
        / nullif(stage_lesson_completed, 0) * 100, 2
    ) as conv_lesson_to_papertrade_pct,
    round(
        stage_kyc_completed::numeric
        / nullif(stage_paper_trade, 0) * 100, 2
    ) as conv_papertrade_to_kyc_pct,
    round(
        stage_real_trade::numeric
        / nullif(stage_kyc_completed, 0) * 100, 2
    ) as conv_kyc_to_realtrade_pct
from stage_users
order by date