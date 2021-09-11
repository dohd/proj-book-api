// participant analysis
module.exports = `
WITH 
    -- Participants count per activity
    t1 AS   
        (SELECT 
            act.id,
            act.action,
            SUM(CASE WHEN p.gender = 'M' THEN 1 ELSE 0 END) AS male,
            SUM(CASE WHEN p.gender = 'F' THEN 1 ELSE 0 END) AS female,
            COUNT(p."activityId") AS total
        FROM activities AS act
        INNER JOIN participants AS p
            ON act.id = p."activityId"
        WHERE act."accountId" = :accountId
        GROUP BY act.id),
    -- Distinct activities per participant programme
    t2 AS    
        (SELECT
            q.id,
            JSON_AGG(q.programme) AS programme	
        FROM
            (SELECT DISTINCT
                act.id,		
                prog.programme
            FROM activities AS act
            INNER JOIN participants AS p
                ON act.id = p."activityId"
            INNER JOIN key_programmes AS prog
                ON prog.id = p."keyProgrammeId"
            WHERE act."accountId" = :accountId) AS q
        GROUP BY q.id),
    -- Distinct regions per participant activity
    t3 AS   
        (SELECT 
            q.id,
            JSON_AGG(q.area) AS area
        FROM
            (SELECT DISTINCT
                act.id,		
                r.area
            FROM activities AS act
            INNER JOIN participants AS p
                ON act.id = p."activityId"
            INNER JOIN regions AS r
                ON r.id = p."regionId"
            WHERE act."accountId" = :accountId) AS q
        GROUP BY q.id),
    -- Distinct groups per participant activity
    t4 AS
        (SELECT
            q.id,
            JSON_AGG(q.group) AS "group"
        FROM
            (SELECT DISTINCT
                act.id,		
                tar_grp.group
            FROM activities AS act
            INNER JOIN participants AS p
                ON act.id = p."activityId"
            INNER JOIN plan_groups AS plan_grp
                ON plan_grp."activityPlanId" = p."activityPlanId"
            INNER JOIN target_groups AS tar_grp
                ON tar_grp.id = plan_grp."targetGroupId"
            WHERE act."accountId" = :accountId) AS q
        GROUP BY q.id), 
    -- Distinct activity dates per participant activity
    t5 AS
        (SELECT 
            q.id,
            JSON_AGG(q.activity_date) AS activity_date
        FROM
            (SELECT DISTINCT
                act.id,		
                p."activityDate" AS activity_date
            FROM activities act
            INNER JOIN participants p
                ON act.id = p."activityId"
            WHERE act."accountId" = :accountId) AS q
        GROUP BY q.id)  
           
-- Analysis    
SELECT
    t1.id,
    t1.action,
    t5.activity_date,
    t2.programme,
    t3.area,
    t4.group,
    t1.male,
    t1.female,
    t1.total
FROM t1
    INNER JOIN t2
        ON t1.id = t2.id
    INNER JOIN t3
        ON t2.id = t3.id
    INNER JOIN t4
        ON t3.id = t4.id
    INNER JOIN t5
        ON t4.id = t5.id;
`;
