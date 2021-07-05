const Objective = require('../models/Objective');

module.exports = {
    create: async (req, res, next) => {
        try {
            const accountId = req.payload.aud
            const { proposalId } = req.body;

            const objective = await Objective.create({
                accountId, proposalId,
                objective: req.body.objective
            });
            const savedObjective = objective.toJSON();
            delete savedObjective.accountId;

            res.send(savedObjective);
        } catch (err) {
            next(err);
        }
    },  

    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const objectives = await Objective.findAll({ 
                where: { accountId }, 
                attributes: { exclude: ['accountId'] } 
            });
            res.send(objectives);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { id } = req.params;
            const { objective } = req.body;
            await Objective.update({ objective }, {
                where: { id, accountId } 
            });
            res.sendStatus(200);
        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            await Objective.destroy({ where: { id } });
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
};