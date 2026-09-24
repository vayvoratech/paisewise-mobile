with users as (

    select
        id as user_id,
        created_at as registered_at,
        date_trunc('week', created_at)::date as cohort_week,
        kyc_status,
        level,
        xp_points,
        streak_days,
        updated_at
    from {{ source('paisewise_users', 'users') }}

)

select
    user_id,
    registered_at,
    cohort_week,
    kyc_status,
    level,
    xp_points,
    streak_days,
    cast(null as varchar) as preferred_language,
    cast(null as text) as onboarding_goal,
    cast(null as text) as city,
    cast(null as text) as state,
    cast(null as integer) as trade_count_real,
    cast(null as integer) as trade_count_paper,
    cast(null as boolean) as has_active_sip,
    cast(null as boolean) as has_mf_investment,
    cast(null as boolean) as has_real_investment,
    updated_at
from users