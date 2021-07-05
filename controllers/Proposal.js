const { db } = require('../utils/database');
const Proposal = require('../models/Proposal');
const Donor = require('../models/Donor');
const Objective = require('../models/Objective');
const Activity = require('../models/Activity');

module.exports = {
    create: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const data = req.body;

            const result = await db.transaction(async transaction => {
                // Proposal
                const proposal = await Proposal.create({
                    accountId,
                    donorId: data.donorId,
                    title: data.title,
                    startPeriod: data.startPeriod,
                    endPeriod: data.endPeriod,
                    dateSubmitted: data.dateSubmitted,
                    budget: data.budget,
                }, {transaction});

                // Objectives
                const objectives = data.objectives.map(({objective}) => {
                    return { proposalId: proposal.id, objective, accountId };
                });
                await Objective.bulkCreate(objectives, {transaction});
                const savedObjectives = await Objective.findAll({
                    where: { proposalId: proposal.id },
                    attributes: ['id','objective'],
                    transaction
                });
                
                // Activities
                const activities = [];
                savedObjectives.forEach((obj, i) => {
                    const objective = data.objectives[i];
                    objective.activities.forEach(action => {
                        activities.push({ objectiveId: obj.id, action, accountId });
                    });
                });
                await Activity.bulkCreate(activities, {transaction});
    
                const objectiveIds = savedObjectives.map(({id}) => id);
                const savedActivities = await Activity.findAll({
                    where: { objectiveId: objectiveIds },
                    attributes: ['id','action'],
                    transaction
                });

                const savedProposal = proposal.toJSON();
                delete savedProposal.accountId;

                return {
                    proposal: savedProposal, 
                    objectives: savedObjectives,
                    activities: savedActivities
                };
            });
            res.send(result);
        } catch (error) {
            next(error);
        }
    },

    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const proposals = await Proposal.findAll({
                where: { accountId },
                attributes: { exclude: ['accountId'] },
                order: [['updatedAt', 'DESC']],
                include: [
                    {
                        model: Donor,
                        as: 'donor',
                        attributes: ['id','name']
                    },
                    {
                        model: Objective,
                        as: 'objectives',
                        attributes: { exclude: ['accountId'] },
                        include: [{
                            model: Activity,
                            as: 'activities',
                            attributes: { exclude: ['accountId'] },
                        }]
                    }
                ]
            });
            res.send(proposals);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { id } = req.params;
            await Proposal.update(req.body, { where: { id, accountId } });
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    },

    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            await Proposal.destroy({ where: { id } });
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    },
};
