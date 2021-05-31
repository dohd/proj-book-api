const { PlanEvent } = require('../models/ActivityPlan');

// const { aud } = req.payload
// const accountId = parseInt(aud);

module.exports = {
    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const dates = await PlanEvent.findAll({
                where: { accountId }, attributes: { exclude: ['accountId'] }
            });
            res.send(dates);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { id } = req.params;
            await PlanEvent.update(req.body, { where: { id, accountId } });
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }
}