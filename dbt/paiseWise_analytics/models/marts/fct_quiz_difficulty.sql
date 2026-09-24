{{ config(
    materialized='table'
) }}

WITH quiz_answers AS (

    SELECT
        properties->>'lesson_id' AS lesson_id,

        COUNT(*) AS questions_answered,

        COUNT(*) FILTER (
            WHERE (properties->>'is_correct')::boolean = true
        ) AS correct_answers

    FROM raw_events.raw_events

    WHERE event_name = 'quiz_question_answered'
      AND properties->>'lesson_id' IS NOT NULL

    GROUP BY properties->>'lesson_id'
)

SELECT
    lesson_id,
    questions_answered,
    correct_answers,

    ROUND(
        correct_answers::numeric
        / NULLIF(questions_answered, 0) * 100,
        2
    ) AS correctness_pct,

    CASE
        WHEN ROUND(
            correct_answers::numeric
            / NULLIF(questions_answered, 0) * 100,
            2
        ) < 30 THEN 'Potentially Too Hard'

        WHEN ROUND(
            correct_answers::numeric
            / NULLIF(questions_answered, 0) * 100,
            2
        ) > 95 THEN 'Potentially Too Easy'

        ELSE 'Normal'
    END AS difficulty_flag

FROM quiz_answers
ORDER BY correctness_pct
