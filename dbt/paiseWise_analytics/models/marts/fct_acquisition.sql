{{ config(materialized='table') }}

select
    user_id,
    acquisition_channel,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    city,
    state,
    country,
    preferred_language
from {{ ref('stg_user_acquisition_geography') }}
