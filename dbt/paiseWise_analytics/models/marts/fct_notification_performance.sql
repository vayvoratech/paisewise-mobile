{{ config(materialized='table') }}

select
    notification_id,
    user_id,
    notification_type,
    sent_at,
    delivered_at,
    opened_at,
    status,
    failure_reason,
    case
        when delivered_at is not null then true
        else false
    end as is_delivered,
    case
        when opened_at is not null then true
        else false
    end as is_opened,
    case
        when delivered_at is not null
         and opened_at is not null
        then extract(epoch from (opened_at - delivered_at)) / 60.0
        else null
    end as minutes_to_open
from {{ ref('stg_notification_delivery') }}
