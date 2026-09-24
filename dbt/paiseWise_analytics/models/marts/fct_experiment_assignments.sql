{{ config(materialized='table') }}

select
    experiment_id,
    experiment_name,
    user_id,
    variant,
    assigned_at
from {{ ref('stg_experiment_assignments') }}
