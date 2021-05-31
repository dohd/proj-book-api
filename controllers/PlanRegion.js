const { Op } = require('../utils/database');
const createError = require('http-errors');
const { PlanRegion } = require('../models/ActivityPlan');

module.exports = {
    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const regions = await PlanRegion.findAll({
                where: { accountId }, attributes: { exclude: ['accountId'] }
            });
            res.send(regions);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { id } = req.params;
            const { regionId } = req.body;

            const region_match = await PlanRegion.findOne({
                where: { accountId, regionId, id: { [Op.ne]: id } },
                attributes: ['id']
            });

            if (region_match) throw new createError.Conflict(
                'Region already exists!'
            );

            await PlanRegion.update(req.body, { where: { id, accountId } });
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }
}