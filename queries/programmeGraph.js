// participants count per programme
module.exports = `
SELECT
    JSON_AGG(g.programme) AS label,
    JSON_AGG(g.male) AS male,
    JSON_AGG(g.female) AS female
FROM
    (SELECT
        prog.id,
        prog.programme,
        SUM(CASE WHEN p.gender = 'M' THEN 1 ELSE 0 END) AS male,
        SUM(CASE WHEN p.gender = 'F' THEN 1 ELSE 0 END) AS female
    FROM key_programmes AS prog
    INNER JOIN participants AS p
        ON prog.id = p."keyProgrammeId"
    WHERE p."activityDate" BETWEEN :fromDate AND :toDate
    AND prog."accountId" = :accountId
    GROUP BY prog.id) AS g;
`;
