// participant count per region
module.exports = `
SELECT
    JSON_AGG(g.area) AS label,
    JSON_AGG(g.male) AS male,
    JSON_AGG(g.female) AS female
FROM
    (SELECT
        r.id,
        r.area,
        SUM(CASE WHEN p.gender = 'M' THEN 1 ELSE 0 END) AS male,
        SUM(CASE WHEN p.gender = 'F' THEN 1 ELSE 0 END) AS female
    FROM regions AS r
    INNER JOIN participants AS p
        ON r.id = p."regionId"
    WHERE p."activityDate" BETWEEN :fromDate AND :toDate
    AND r."accountId" = :accountId
    GROUP BY r.id) AS g;
`;
