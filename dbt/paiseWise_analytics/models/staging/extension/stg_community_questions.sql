{{ config(materialized='view') }}

select
    question_id,
    user_id,
    topic,
    created_at,
    answered_at,
    is_verified_helper,
    reported
from {{ source('raw_extension', 'community_questions') }}