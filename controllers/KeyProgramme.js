const createError = require('http-errors');
const { DatabaseError } = require('sequelize');
const { Op } = require('../utils/database');
const { KeyProgramme } = require('../models/Essential');

module.exports = {
    create: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { programme } = req.body

            const programmeMatch = await KeyProgramme.findOne({
                attributes: ['id'],
                where: {
                    accountId,
                    programme: { [Op.iLike]: programme }
                }
            });
            if (programmeMatch) throw new createError.Conflict(
                'programme already exists!'
            );

            let savedProgramme = await KeyProgramme.create({ 
                accountId, programme
            });
            savedProgramme = savedProgramme.toJSON();
            delete savedProgramme.accountId;

            res.send(savedProgramme);
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

            const programmeMatch = await KeyProgramme.findOne({
                attributes: ['id'],
                where: {
                    accountId,
                    id: { [Op.ne]: id },
                    programme: { [Op.iLike]: programme }
                }
            });
            if (programmeMatch) throw new createError.Conflict(
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
            const { id } = req.params;
            await KeyProgramme.destroy({ where: { id } });
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