const { EventImage } = require('../models/NarrativeReport');

module.exports = {
    create: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { url, narrativeReportId } = req.body;

            const image = await EventImage.create({
                accountId, url, narrativeReportId
            });
            const savedImage = image.toJSON();
            delete savedImage.accountId;

            res.send(savedImage);
        } catch (error) {
            next(error);
        }
    },

    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;

            const images = await EventImage.findAll({ 
                where: { accountId }, 
                attributes: ['id', 'url', 'narrativeReportId'],
            });

            res.send(images);
        } catch (error) {
            next(error);
        }
    },

    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            await EventImage.destroy({ where: { id } });
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }
};