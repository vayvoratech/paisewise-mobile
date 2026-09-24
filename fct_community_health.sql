{{ config(materialized='table') }}

select
    question_id,
    user_id,
    topic,
    created_at,
    answered_at,
    is_verified_helper,
    reported,
    case
        when answered_at is not null then true
        else false
    end as is_answered,
    case
        when answered_at is not null
        then extract(epoch from (answered_at - created_at)) / 3600.0
        else null
    end as hours_to_answer
from {{ ref('stg_community_questions') }}