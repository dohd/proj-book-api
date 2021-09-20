// activity narrative report
module.exports = `
WITH 
	-- Activity dates
	t1 AS 
		(SELECT 
			q.id,
			q.action,
			JSON_AGG(DISTINCT q.date) AS date
		FROM
			(SELECT
				act.id,
				act.action,
				part."activityDate" AS date
			FROM activities AS act
			INNER JOIN narrative_reports AS repo
				ON repo."activityId" = act.id
			INNER JOIN participants AS part
				ON part."activityId" = act.id
			WHERE act."accountId" = :accountId) AS q
		GROUP BY q.id, q.action),
	-- Activity programmes
	t2 AS
		(SELECT
			q.id,
			JSON_AGG(DISTINCT q.programme) AS programme
		FROM
			(SELECT
				act.id,
				kprog.programme
			FROM activities AS act
			INNER JOIN narrative_reports AS repo
				ON repo."activityId" = act.id
			INNER JOIN participants AS part
				ON part."activityId" = act.id
			INNER JOIN key_programmes AS kprog
				ON kprog.id = part."keyProgrammeId"
			WHERE act."accountId" = :accountId) AS q
		GROUP BY q.id),
	-- Activity regions
	t3 AS
		(SELECT
			q.id,
			JSON_AGG(DISTINCT q.area) AS region
		FROM
			(SELECT
				act.id,
				r.area
			FROM activities AS act
			INNER JOIN narrative_reports AS repo
				ON repo."activityId" = act.id
			INNER JOIN participants AS part
				ON part."activityId" = act.id
			INNER JOIN regions AS r
				ON r.id = part."regionId"
			WHERE act."accountId" = :accountId) AS q
		GROUP BY q.id),
	-- Activity groups
	t4 AS
		(SELECT
			q.id,
			JSON_AGG(DISTINCT q.group) AS "group"
		FROM
			(SELECT
				act.id,
				tgroup."group"
			FROM activities AS act
			INNER JOIN narrative_reports AS repo
				ON repo."activityId" = act.id
			INNER JOIN participants AS part
				ON part."activityId" = act.id
			INNER JOIN activity_plans AS actp
				ON actp."activityId" = act.id
			INNER JOIN plan_groups AS pgroup
				ON pgroup."activityPlanId" = actp.id
			INNER JOIN target_groups AS tgroup
				ON tgroup.id = pgroup."targetGroupId"
			WHERE act."accountId" = :accountId) AS q
		GROUP BY q.id),
	-- Quiz responses
	t5 AS
		(SELECT 
			q.report_id,
			JSON_AGG(q.query) AS "query",
			JSON_AGG(q.response) AS response,
			JSON_AGG(q.task) AS task,
			JSON_AGG(q.response_id) AS response_id
		FROM
			(SELECT
				qu.query,
				res.id AS response_id,
				res.response,
				agenda.task,
				res."narrativeReportId" AS report_id
			FROM narrative_quiz AS qu 
			INNER JOIN responses AS res
				ON res."narrativeQuizId" = qu.id
			INNER JOIN agenda
				ON agenda.id = res."agendaId"
			WHERE res."accountId" = :accountId) AS q
		GROUP BY q.report_id),
	-- Images
	t6 AS 
		(SELECT 
			e.id, 
			e.url,
			e."narrativeReportId" AS report_id
		FROM event_images AS e 
		WHERE e."accountId" = :accountId),	
	-- Reports
	t7 AS 	
		(SELECT 
			act.id,
			repo.id AS key,
			repo.title,			
			cstudy.case AS case_study,
			(SELECT CASE WHEN JSON_AGG(q) IS NULL THEN '[]' ELSE JSON_AGG(q) END
			 	FROM  (SELECT * FROM t6 WHERE t6.report_id = repo.id) AS q) AS image,
			(SELECT JSON_AGG(r) FROM (SELECT * FROM t5 WHERE t5.report_id = repo.id) AS r) AS response
		FROM activities AS act
		INNER JOIN narrative_reports AS repo
			ON repo."activityId" = act.id
		INNER JOIN case_studies AS cstudy
			ON cstudy."narrativeReportId" = repo.id
		WHERE act."accountId" = :accountId)

-- Activity reports
SELECT 
	t1.id AS key,
	t1.action,
	t1.date,
	t2.programme,
	t3.region,
	t4."group",
	(SELECT JSON_AGG(r) FROM (SELECT * FROM t7 WHERE t7.id = t1.id) AS r) AS report
FROM t1
INNER JOIN t2
	ON t1.id = t2.id
INNER JOIN t3
	ON t2.id = t3.id
INNER JOIN t4
	ON t4.id = t3.id;	
`;
