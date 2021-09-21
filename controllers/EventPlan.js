const { QueryTypes } = require('sequelize');

const { db } = require('../utils/database');

const queryStr = require('../queries/eventPlan');

module.exports = {
    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;

            const data = await db.query(queryStr, {
                replacements: {accountId},
                type: QueryTypes.SELECT
            });
            res.send(data);
        } catch (error) {
            next(error);
        }
    }
};