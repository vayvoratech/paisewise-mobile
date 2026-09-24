with source_data as (

    select
        event_id,
        event_name,
        user_id,
        session_id,
        occurred_at,
        device_type,
        app_version,
        properties,
        date,
        ingested_at
    from {{ source('paisewise_raw', 'raw_events') }}
    where event_name is not null
      and trim(event_name) <> ''
      and occurred_at is not null

),

with_dedup_key as (

    select
        *,
        coalesce(
            event_id,
            md5(
                coalesce(user_id::text, 'anon') || '|' ||
                event_name || '|' ||
                occurred_at::text
            )
        ) as dedup_key
    from source_data

),

ranked as (

    select
        *,
        row_number() over (
            partition by dedup_key
            order by ingested_at asc
        ) as row_rank
    from with_dedup_key

)

select
    dedup_key as event_id,
    case
    when trim(event_name) = 'paper_trade_placed' then 'paper_order_placed'
    when trim(event_name) = 'real_trade_placed' then 'real_order_placed'
    else trim(event_name)
end as event_name,
    user_id,
    session_id,
    occurred_at,
    device_type,
    app_version,
    properties,
    date
from ranked
where row_rank = 1