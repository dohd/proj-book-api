const { Op } = require('../utils/database');
const createError = require('http-errors');
const { PlanGroup } = require('../models/ActivityPlan');

module.exports = {
    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const groups = await PlanGroup.findAll({
                where: { accountId }, attributes: { exclude: ['accountId'] }
            });
            res.send(groups);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { id } = req.params;
            const { targetGroupId } = req.body;

            const group_match = await PlanGroup.findOne({
                where: { accountId, targetGroupId, id: { [Op.ne]: id } },
                attributes: ['id']
            });

            if (group_match) throw new createError.Conflict(
                'Group already exists!'
            );

            await PlanGroup.update(req.body, { where: { id, accountId } });
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }
}