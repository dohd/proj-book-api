const { Response } = require('../models/NarrativeReport');

module.exports = {
    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const responses = await Response.findAll({
                where: { accountId },
                attributes: { 
                    exclude: ['accountId','createdAt','updatedAt'] 
                }
            });
            res.send(responses);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { response } = req.body;

            await Response.update({response}, { where: { id } });
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    },

    delete: async (req, res, next) => {
        try {
            const { id } = req.params;            
            await Response.destroy({ where: { id } });
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }
};