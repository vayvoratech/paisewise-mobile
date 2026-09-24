{{ config(materialized='view') }}

select
    notification_id,
    user_id,
    notification_type,
    sent_at,
    delivered_at,
    opened_at,
    status,
    failure_reason
from {{ source('raw_extension', 'notification_delivery') }}