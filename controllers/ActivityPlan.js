const { db } = require('../utils/database');
const createError = require('http-errors');
const Activity = require('../models/Activity');
const { Participant } = require('../models/Participant');
const {
    ActivityPlan, PlanRegion, PlanEvent, PlanGroup, 
    PlanProgramme, PlanMaterial
} = require('../models/ActivityPlan');
const { 
    TargetGroup, KeyProgramme, Region 
} = require('../models/Essential');

module.exports = {
    create: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const data = req.body;

            const result = await db.transaction(async transaction => {

                const plan = await ActivityPlan.create({ 
                    accountId, 
                    activityId: data.activityId,
                    title: data.title
                }, {transaction});

                const material = await PlanMaterial.create({
                    accountId, 
                    material: data.material, 
                    activityPlanId: plan.id
                }, {transaction});

                const programme = await PlanProgramme.create({
                    accountId, 
                    keyProgrammeId: data.programmeId, 
                    activityPlanId: plan.id
                }, {transaction});

                const groups = data.groups.map(id => ({ 
                    accountId, 
                    targetGroupId: id, 
                    activityPlanId: plan.id
                }));
                await PlanGroup.bulkCreate(groups, {transaction});

                const dates = data.events.map(({date}) => ({ 
                    accountId, date, activityPlanId: plan.id
                }));
                await PlanEvent.bulkCreate(dates, {transaction});

                const savedEvents = await PlanEvent.findAll({
                    where: { activityPlanId: plan.id }, 
                    attributes: ['id','date'],
                    transaction
                });

                const regions = [];
                savedEvents.forEach((obj, i) => {
                    const event = data.events[i];
                    event.regions.forEach(regionId => {
                        regions.push({ accountId, regionId, planEventId: obj.id });
                    });
                });
                await PlanRegion.bulkCreate(regions, {transaction});

                const eventIds = savedEvents.map(({id}) => id);
                const savedRegions = await PlanRegion.findAll({ 
                    where: { planEventId: eventIds }, 
                    attributes: { exclude: ['accountId'] }, 
                    transaction 
                });
                const savedGroups = await PlanGroup.findAll({ 
                    where: { activityPlanId: plan.id }, 
                    attributes: { exclude: ['accountId'] }, 
                    transaction
                });

                const savedMaterial = material.toJSON();
                const savedProgramme = programme.toJSON();

                delete savedMaterial.accountId;
                delete savedProgramme.accountId;

                return { 
                    planProgramme: savedProgramme,
                    planMaterial: savedMaterial, 
                    planRegions: savedRegions,
                    planEvents: savedEvents,
                    planGroups: savedGroups
                };
            });

            res.send(result);
        } catch (err) {
            next(err);
        }
    },

    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const activity_plans = await ActivityPlan.findAll({
                where: { accountId },
                attributes: ['id','title'],
                include: [
                    {
                        model: Activity,
                        as: 'activity',
                        attributes: ['id', 'action']
                    },
                    {
                        model: PlanMaterial,
                        as: 'planMaterial',
                        attributes: ['id', 'material']
                    },
                    {
                        model: PlanProgramme,
                        as: 'planProgramme',
                        attributes: ['id'],
                        include: [{
                            model: KeyProgramme,
                            as: 'keyProgramme',
                            attributes: ['id','programme']
                        }]
                    },
                    {
                        model: PlanGroup,
                        as: 'planGroups',
                        attributes: ['id'],
                        include: [{
                            model: TargetGroup,
                            as: 'targetGroup',
                            attributes: ['id','group']
                        }]
                    },
                    {
                        model: PlanEvent,
                        as: 'planEvents',
                        attributes: ['id','date'],
                        include: [{
                            model: PlanRegion,
                            as: 'planRegions',
                            attributes: ['id'],
                            include: [{
                                model: Region,
                                as: 'region',
                                attributes: ['id','area']
                            }]
                        }]
                    }
                ]
            });
            
            res.send(activity_plans);
        } catch (error) {
            next(error);
        }
    },

    delete: async (req, res, next) => {
        try {
            const { id } = req.params;

            const plan = await ActivityPlan.findByPk(id, {
                attributes: ['activityId']
            });
            const participant = await Participant.findOne({
                where: { activityId: plan.activityId },
                attributes: ['id']
            });
            // plan was already executed thus can't be deleted;
            if (participant) throw new createError.FailedDependency(
                'Plan has a participant dependency'
            );
            await ActivityPlan.destroy({ where: { id } });
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }
};