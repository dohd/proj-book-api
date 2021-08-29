const moment = require('moment');
const { QueryTypes } = require('sequelize');

const { db } = require('../utils/database');

module.exports = {
    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;

            const yr = new Date().getFullYear();
            const dates = [
                new Date(yr, 0, 1), 
                new Date(yr, 11, 31)
            ].map(v => moment(v).format('YYYY-MM-DD'));
            const fromDate = req.query.from || dates[0];
            const toDate = req.query.to || dates[1];
            
            // participant count per region
            const queryStr = `
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
            const data = await db.query(queryStr, {
                replacements: {accountId, fromDate, toDate},
                type: QueryTypes.SELECT
            });
            res.send(data);
        } catch (error) {
            next(error);
        }
    }
};
