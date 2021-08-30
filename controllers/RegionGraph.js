const moment = require('moment');
const { QueryTypes } = require('sequelize');

const { db } = require('../utils/database');
const queryStr = require('../queries/regionGraph');

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
