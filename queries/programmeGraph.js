// participants count per programme
module.exports = `
SELECT
    json_agg(g.programme) AS label,
    json_agg(g.male) AS male,
    json_agg(g.female) AS female
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
