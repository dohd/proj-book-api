const { PlanMaterial } = require('../models/ActivityPlan');

module.exports = {
    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const materials = await PlanMaterial.findAll({
                where: { accountId }, attributes: { exclude: ['accountId'] }
            });
            res.send(materials);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { id } = req.params;
            await PlanMaterial.update(req.body, { 
                where: { id, accountId } 
            });
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    },
};