{{ config(materialized='table') }}

select
    outcome_id,
    experiment_name,
    experiment_id,
    user_slot,
    variant,
    event_name,
    event_at,
    date(event_at) as event_date,
    position,
    prompt_type,
    streak_bucket,
    converted
from {{ ref('stg_experiment_outcomes') }}