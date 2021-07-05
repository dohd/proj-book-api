const Activity = require('../models/Activity');

module.exports = {
    create: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { action, objectiveId } = req.body;

            const activity = await Activity.create({ 
                action, objectiveId, accountId 
            });
            const savedActivity = activity.toJSON();
            delete savedActivity.accountId;

            res.send(savedActivity);
        } catch (err) {
            next(err);
        }
    },

    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const activities = await Activity.findAll({
                where: { accountId }, 
                attributes: { exclude: ['accountId'] }
            });
            res.send(activities);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { id } = req.params;
            await Activity.update(req.body, { where: { id, accountId } });
            res.sendStatus(200);
        } catch (err) {
            next(err);
        }
    },    

    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            await Activity.destroy({ where: { id } });
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
};