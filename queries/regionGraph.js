// participant count per region
module.exports = `
SELECT
    json_agg(g.area) AS label,
    json_agg(g.male) AS male,
    json_agg(g.female) AS female
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
