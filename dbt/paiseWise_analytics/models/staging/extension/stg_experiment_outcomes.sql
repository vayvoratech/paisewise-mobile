{{ config(materialized='view') }}

select
    outcome_id,
    experiment_name,
    experiment_id,
    user_slot,
    variant,
    event_name,
    event_at,
    position,
    prompt_type,
    streak_bucket,
    converted
from {{ source('raw_extension', 'experiment_outcomes') }}