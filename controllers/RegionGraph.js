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
            
            // participants count per region
            const queryStr = `
                SELECT
                    r.id,
                    r.area,
                    SUM(CASE WHEN p.gender = 'M' THEN 1 ELSE 0 END) male,
                    SUM(CASE WHEN p.gender = 'F' THEN 1 ELSE 0 END) female,
                    COUNT(p."regionId") total
                FROM regions r
                INNER JOIN participants p
                    ON r.id = p."regionId"
                WHERE p."activityDate" BETWEEN :fromDate AND :toDate
                AND r."accountId" = :accountId
                GROUP BY r.id
            `;

            const dataset = await db.query(queryStr, {
                replacements: {accountId, fromDate, toDate},
                type: QueryTypes.SELECT
            });
            res.send(dataset);
        } catch (error) {
            next(error);
        }
    }
};
