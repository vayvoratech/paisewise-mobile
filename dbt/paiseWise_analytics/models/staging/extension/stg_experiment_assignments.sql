{{ config(materialized='view') }}

select
    experiment_id,
    experiment_name,
    user_id,
    variant,
    assigned_at
from {{ source('raw_extension', 'experiment_assignments') }}