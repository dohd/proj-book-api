const ProfileImage = require('../models/ProfileImage');

module.exports = {
    create: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { url } = req.body;

            const prev_image = await ProfileImage.findOne({ where: { accountId } });
            if (prev_image) {
                await ProfileImage.update({ url }, { where: { accountId } });
                return res.send(200);
            }

            const image = await ProfileImage.create({ accountId, url });
            const saved_image = image.toJSON();
            delete saved_image.accountId;

            res.send(saved_image);
        } catch (error) {
            next(error);
        }
    },

    findOne: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const image = await ProfileImage.findOne({ where: { accountId } });
            return image ? res.send(image) : res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }
};
