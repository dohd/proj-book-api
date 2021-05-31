const { DatabaseError } = require('sequelize');
const { Op } = require('../utils/database');
const createError = require('http-errors');
const { Region } = require('../models/Essential');

module.exports = {
    create: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { area } = req.body;

            const region_match = await Region.findOne({
                where: {
                    accountId,
                    area: { [Op.iLike]: area }
                }
            });
            if (region_match) throw new createError.Conflict(
                'region already exists!'
            );

            const region = await Region.create({ area, accountId });
            const saved_region = region.toJSON();
            delete saved_region.accountId;

            res.send(saved_region);
        } catch (error) {
            next(error);
        }
    },

    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const regions = await Region.findAll({ 
                where: { accountId }, 
                attributes: ['id','area'],
                order: [['updatedAt','DESC']]
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
            const { area } = req.body;

            const region_match = await Region.findOne({
                where: {
                    accountId,
                    id: { [Op.ne]: id },
                    area: { [Op.iLike]: area }
                }
            });
            if (region_match) throw new createError.Conflict(
                'region already exists!'
            );

            await Region.update({ area }, { 
                where: { id, accountId } 
            });
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    },

    delete: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { id } = req.params;
            await Region.destroy({ where: { id, accountId } });
            res.sendStatus(204);
        } catch (error) {
            if (error instanceof DatabaseError) {
                const msg = 'region has dependencies in activity plan';
                return next(new createError.FailedDependency(msg));
            }
            next(error);
        }
    }
};