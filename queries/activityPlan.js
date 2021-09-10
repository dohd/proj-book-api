// event activity plan
module.exports = `
WITH
	-- Activity plan regions
	t1 AS
		(SELECT
			MIN(q.id) AS id,
			q.action,
			q.programme,
			JSON_AGG(DISTINCT q.area) AS region
		FROM
			(SELECT
				plan.id,
				act.action,
				r.area,
				kprog.programme
			FROM activity_plans AS plan
			INNER JOIN activities AS act
				ON act.id = plan."activityId"
			INNER JOIN plan_events AS pe
				ON pe."activityPlanId" = plan.id
			INNER JOIN plan_regions AS pr
				ON pr."planEventId" = pe.id
			INNER JOIN regions AS r
				ON r.id = pr."regionId"
			INNER JOIN plan_programmes AS pprog
				ON pprog."activityPlanId" = plan.id
			INNER JOIN key_programmes AS kprog
				ON kprog.id = pprog."keyProgrammeId"
			WHERE plan."accountId" = :accountId) AS q
		GROUP BY q.action, q.programme),
	-- Activity plan groups
	t2 AS
		(SELECT
			MIN(q.id) AS id,
			q.action,
			q.programme,
			JSON_AGG(DISTINCT q.group) AS "group"
		FROM
			(SELECT
				plan.id,
				act.action,
				kprog.programme,
				tgroup.group
			FROM activity_plans AS plan
			INNER JOIN activities AS act
				ON act.id = plan."activityId"
			INNER JOIN plan_groups AS pgroup
				ON pgroup."activityPlanId" = plan.id
			INNER JOIN target_groups AS tgroup
				ON pgroup."targetGroupId" = tgroup.id
			INNER JOIN plan_programmes AS pprog
				ON pprog."activityPlanId" = plan.id
			INNER JOIN key_programmes AS kprog
				ON kprog.id = pprog."keyProgrammeId"
			WHERE plan."accountId" = :accountId) AS q
		GROUP BY q.action, q.programme),
	-- Activity plan material
	t3 AS	
		(SELECT
			MIN(plan.id) AS id, 			
			act.action,
			kprog.programme,
			pm.material
		FROM activity_plans AS plan
		INNER JOIN activities AS act
			ON act.id = plan."activityId"
		INNER JOIN plan_programmes AS pprog
			ON pprog."activityPlanId" = plan.id
		INNER JOIN key_programmes AS kprog
			ON kprog.id = pprog."keyProgrammeId"
		INNER JOIN plan_materials AS pm
			ON pm."activityPlanId" = plan.id
		WHERE plan."accountId" = :accountId
		GROUP BY act.action, kprog.programme, pm.material),
	-- Activity plan status
	t4 AS
		(SELECT
			MIN(q.id) AS id,
			q.action,
			q.programme,
			q.status
		FROM
			(SELECT
				plan.id,
				act.action,
				kprog.programme,
				(CASE WHEN p."activityPlanId" = plan.id THEN TRUE ELSE FALSE END) AS status
			FROM activity_plans AS plan
			INNER JOIN activities AS act
				ON act.id = plan."activityId"
			INNER JOIN plan_programmes AS pprog
				ON pprog."activityPlanId" = plan.id
			INNER JOIN key_programmes AS kprog
				ON kprog.id = pprog."keyProgrammeId"
			LEFT JOIN participants AS p
				ON p."activityPlanId" = plan.id
			WHERE plan."accountId" = :accountId) AS q
		GROUP BY q.action, q.programme, q.status),
	-- Plan events
    t5 AS
        (SELECT
            pe.id,
            pe.date,
            pe."activityPlanId" AS plan_id
        FROM plan_events AS pe
        WHERE pe."accountId" = :accountId),
	-- Activity plans
	t6 AS
		(SELECT
			t1.id,
			t5.date,
			t1.action,
			t1.programme,
			t1.region,
			t2.group,
			t3.material,
			t4.status
		FROM t1
		INNER JOIN t2
			ON t2.id = t1.id
		INNER JOIN t3 
			ON t3.id = t2.id
		INNER JOIN t4
			ON t4.id = t3.id
		INNER JOIN t5
			ON t5.plan_id = t4.id)	

-- Activity plan events
SELECT *
FROM		
	(SELECT DISTINCT ON (t5.date)
		t5.id,
		t5.date,
		(SELECT JSON_AGG(t6) FROM (SELECT * FROM t6 WHERE t6.date = t5.date) AS t6) AS plan
	FROM t5
	GROUP BY t5.id, t5.date) AS q
WHERE q.plan IS NOT NULL;
`;
