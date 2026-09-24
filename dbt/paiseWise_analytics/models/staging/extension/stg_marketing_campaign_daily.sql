{{ config(materialized='view') }}

select
    date,
    platform,
    channel,
    campaign_id,
    campaign_name,
    creative_id,
    creative_name,
    impressions,
    clicks,
    installs,
    spend
from {{ source('raw_extension', 'marketing_campaign_daily') }}