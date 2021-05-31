const { Op, db } = require('../utils/database');
const createError = require('http-errors');
const { Participant, ParticipantDetail } = require('../models/Participant');
const { KeyProgramme, Region } = require('../models/Essential');

module.exports = {
    create: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const data = req.body;
            const { 
                activityId, activityPlanId, 
                regionId, keyProgrammeId 
            } = data;

            const isMatch = await Participant.findOne({ 
                where: { 
                    accountId, activityId,
                    activityDate: data.activityDate, 
                    '$detail.email$': data.email 
                },
                attributes: ['id'],
                include: { model: ParticipantDetail, as: 'detail' } 
            });
            if (isMatch) throw new createError.Conflict('Participant exists!');

            const result = await db.transaction(async transaction => {
                // participant
                const participant = await Participant.create({
                    accountId, 
                    activityId, 
                    activityPlanId,
                    regionId,
                    keyProgrammeId,
                    fName: data.fName,
                    lName: data.lName,
                    gender: data.gender,
                    activityDate: data.activityDate        
                }, {transaction});

                // participant detail
                const detail = await ParticipantDetail.create({
                    participantId: participant.id,
                    disability: data.disability,
                    phone: data.phone,
                    email: data.email,
                    region: data.region,
                    designation: data.designation
                }, {transaction});

                const saved_participant = participant.toJSON();
                saved_participant.detail = detail.toJSON();
                delete saved_participant.accountId;

                return saved_participant;
            });

            res.send(result);
        } catch (err) {
            next(err);
        }
    },

    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const participants = await Participant.findAll({
                where: { accountId },
                attributes: { exclude: ['accountId'] },
                order: [['updatedAt','DESC']],
                include: [
                    {
                        model: ParticipantDetail,
                        as: 'detail',
                        attributes: { exclude: ['createdAt', 'updatedAt'] }
                    },
                    {
                        model: Region,
                        as: 'region',
                        attributes: ['id','area']
                    },
                    {
                        model: KeyProgramme,
                        as: 'keyProgramme',
                        attributes: ['id', 'programme']
                    }
                ]
            });
            res.send(participants);
        } catch (err) {
            next(err);
        }
    },

    update: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { id } = req.params;
            const { activityId, email, activityDate } = req.body;

            const isMatch = await Participant.findOne({ 
                where: { 
                    activityDate, accountId, activityId, 
                    id: { [Op.ne]: id }, 
                    '$detail.email$': email
                }, 
                attributes: ['id'],
                include: { model: ParticipantDetail, as: 'detail' } 
            });
            if (isMatch) throw new createError.Conflict('Participant exists!');

            await db.transaction(async transaction => {
                await Participant.update(req.body, { where: { id }, transaction });
                await ParticipantDetail.update(req.body, { 
                    where: { participantId: id }, 
                    transaction 
                });
            });
            res.sendStatus(200);
        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            await Participant.destroy({ where: { id } });
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
};