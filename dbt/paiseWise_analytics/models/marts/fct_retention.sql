with cohorts as (

    select
        user_id,
        cohort_week
    from {{ ref('dim_users') }}
    where cohort_week is not null

),

activity as (

    select
        user_id,
        date
    from {{ ref('fct_user_daily') }}
    where is_active = true

),

retention_periods as (

    select 1 as retention_day
    union all select 7
    union all select 14
    union all select 30

),

cohort_base as (

    select
        cohorts.cohort_week,
        rp.retention_day,
        count(distinct cohorts.user_id) as cohort_size
    from cohorts
    cross join retention_periods rp
    group by cohorts.cohort_week, rp.retention_day

),

retained as (

    select
        cohorts.cohort_week,
        rp.retention_day,
        count(distinct activity.user_id) as retained_users
    from cohorts
    cross join retention_periods rp
    join activity
        on activity.user_id = cohorts.user_id
       and activity.date = cohorts.cohort_week
           + (rp.retention_day || ' days')::interval
    group by cohorts.cohort_week, rp.retention_day

),

max_activity as (

    select max(date) as max_activity_date
    from activity

)

select
    cohort_base.cohort_week,
    cohort_base.retention_day,
    cohort_base.cohort_size,

    case
        when cohort_base.cohort_week
             + (cohort_base.retention_day || ' days')::interval
             <= max_activity.max_activity_date
        then coalesce(retained.retained_users, 0)
        else null
    end as retained_users,

    case
        when cohort_base.cohort_week
             + (cohort_base.retention_day || ' days')::interval
             <= max_activity.max_activity_date
        then round(
            coalesce(retained.retained_users, 0)::numeric
            / nullif(cohort_base.cohort_size, 0) * 100,
            2
        )
        else null
    end as retention_pct

from cohort_base
left join retained
    on retained.cohort_week = cohort_base.cohort_week
   and retained.retention_day = cohort_base.retention_day
cross join max_activity
order by cohort_base.cohort_week, cohort_base.retention_day
