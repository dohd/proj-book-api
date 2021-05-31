const createError = require('http-errors');
const { DatabaseError } = require('sequelize');
const { Op } = require('../utils/database');
const { KeyProgramme } = require('../models/Essential');

module.exports = {
    create: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;

            const programme_match = await KeyProgramme.findOne({
                attributes: ['id'],
                where: {
                    accountId,
                    programme: { [Op.iLike]: req.body.programme }
                }
            });
            if (programme_match) throw new createError.Conflict(
                'programme already exists!'
            );

            const programme = await KeyProgramme.create({ 
                accountId, programme: req.body.programme 
            });
            const saved_programme = programme.toJSON();
            delete saved_programme.accountId;

            res.send(saved_programme);
        } catch (error) {
            next(error);
        }
    },

    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const programmes = await KeyProgramme.findAll({ 
                where: { accountId }, 
                attributes: ['id','programme'],
                order: [['updatedAt','DESC']]
            });
            res.send(programmes);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { id } = req.params;
            const { programme } = req.body;

            const programme_match = await KeyProgramme.findOne({
                attributes: ['id'],
                where: {
                    accountId,
                    id: { [Op.ne]: id },
                    programme: { [Op.iLike]: programme }
                }
            });
            if (programme_match) throw new createError.Conflict(
                'programme already exists!'
            );

            await KeyProgramme.update({ programme },{
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
            await KeyProgramme.destroy({ where: { id, accountId } });
            res.sendStatus(204);
        } catch (error) {
            if (error instanceof DatabaseError) {
               const msg = 'programme has dependencies in participants or activity plan'
               return next(new createError.FailedDependency(msg));
            }
            next(error);
        }
    }
};