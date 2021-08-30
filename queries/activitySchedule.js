// Activity schedule date in the next 30 days
module.exports = `
SELECT 
    q.id,
    q.action,
    MIN(q.date) AS date,
    MIN(q.datediff) AS rem_day	
FROM
    (SELECT
        act.id,
        act.action,
        pe.date,
        (CAST(MAX(pe.date) AS date) - CAST(MIN(NOW()) AS date)) as datediff
    FROM activities AS act
    INNER JOIN activity_plans AS ap
        ON act.id = ap."activityId"
    INNER JOIN plan_events AS pe
        ON ap.id = pe."activityPlanId"
    WHERE pe.date BETWEEN :fromDate AND :toDate	
    AND act."accountId" = :accountId
    GROUP BY act.id, pe.date) AS q
WHERE q.datediff > 0 AND q.datediff <= 30
GROUP BY q.id, q.action;
`;
