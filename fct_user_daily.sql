with events as (

    select *
    from {{ ref('stg_events') }}
    where user_id is not null

),

daily_agg as (

    select
        user_id,
        date,
        count(distinct session_id) filter (where session_id is not null) as session_count,
        count(*) as event_count,
        count(*) filter (where event_name = 'lesson_completed') as lessons_completed,
        count(*) filter (where event_name = 'quiz_completed') as quizzes_completed,
        coalesce(sum(
            case
                when event_name in ('lesson_completed', 'quiz_completed')
                    then (properties->>'xp_earned')::int
                else 0
            end
        ), 0) as xp_earned,
        count(*) filter (where event_name = 'paper_order_placed') as paper_trades_placed
    from events
    group by user_id, date

)

select
    user_id,
    date,
    session_count,
    event_count,
    lessons_completed,
    quizzes_completed,
    xp_earned,
    paper_trades_placed,
    (event_count > 0) as is_active
from daily_agg