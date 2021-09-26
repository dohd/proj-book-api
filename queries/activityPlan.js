// activity plans
module.exports = `
SELECT 
	ap.id AS key,
	ap.title,
	ap."activityId" AS activity_id,
	JSON_OBJECT_AGG(r.id, r.area) AS region
FROM activity_plans AS ap
INNER JOIN plan_events AS pe
	ON pe."activityPlanId" = ap.id
INNER JOIN plan_regions AS pr
	ON pr."planEventId" = pe.id
INNER JOIN regions AS r
	ON r.id = pr."regionId"
WHERE ap."accountId" = :accountId
GROUP BY ap.id, ap.title, ap."activityId";
`;
