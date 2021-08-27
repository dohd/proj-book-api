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
            
            // participants count per programme
            const queryStr = `
                SELECT
                    prog.id,
                    prog.programme,
                    SUM(CASE WHEN p.gender = 'M' THEN 1 ELSE 0 END) male,
                    SUM(CASE WHEN p.gender = 'F' THEN 1 ELSE 0 END) female,
                    COUNT(p."keyProgrammeId") total
                FROM key_programmes prog
                INNER JOIN participants p
                    ON prog.id = p."keyProgrammeId"
                WHERE p."activityDate" BETWEEN :fromDate AND :toDate
                AND prog."accountId" = :accountId
                GROUP BY prog.id
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
