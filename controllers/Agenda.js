const { Op } = require('../utils/database');
const createError = require('http-errors');
const Agenda = require('../models/Agenda');

module.exports = {
    create: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const data = req.body;
            const { activityId } = data;

            const isMatch = await Agenda.findOne({
                attributes: ['id'],
                where: {
                    accountId, activityId,
                    task: { [Op.iLike]: req.body.task }
                }
            });
            if (isMatch) throw new createError.Conflict(
                'task already exists!'
            );

            const agenda = await Agenda.create({
                accountId,activityId,
                startTime: data.startTime,
                endTime: data.endTime,
                task: data.task,
                assignee: data.assignee,
                designation: data.designation,
            });

            const savedAgenda = agenda.toJSON();
            delete savedAgenda.accountId;

            res.send(savedAgenda);
        } catch (err) {
            next(err);
        }
    },

    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const agenda = await Agenda.findAll({
                where: { accountId }, attributes: { exclude: ['accountId'] }
            });
            res.send(agenda);
        } catch (err) {
            next(err);
        }
    },

    update: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { id } = req.params;
            await Agenda.update(req.body, { where: { id, accountId } });
            res.sendStatus(200);
        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            await Agenda.destroy({ where: { id } });
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
};