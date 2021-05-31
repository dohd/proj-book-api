const Activity = require('../models/Activity');
const Objective = require('../models/Objective');
const Proposal = require('../models/Proposal');
const { Participant } = require('../models/Participant');
const { ActivityPlan } = require('../models/ActivityPlan');
const { NarrativeReport } = require('../models/NarrativeReport');

module.exports = {
    // activities without plans
    activityPlan: {
        findAll: async (req, res, next) => {
            try {
                const accountId = req.payload.aud;
                const activities = await Activity.findAll({
                    attributes: ['id','action'],
                    where: { 
                        accountId, 
                        '$activityPlans$': null,
                    },
                    include: [
                        {
                            model: ActivityPlan,
                            as: 'activityPlans',
                            attributes: []
                        },
                        {
                            model: Objective,
                            as: 'objective',
                            attributes: ['id'],
                            required: true,
                            include: [{                                
                                model: Proposal,
                                as: 'proposal',
                                attributes: ['id'],
                                where: { status: 1 }               
                            }]
                        }                        
                    ]
                });
                res.send(activities);
            } catch (error) {
                next(error);
            }
        }
    },

    // plans without participants
    planParticipant: {
        findAll: async (req, res, next) => {
            try {
                const accountId = req.payload.aud;
                const plans = await ActivityPlan.findAll({
                    attributes: ['id','title'],
                    where: {
                        accountId,
                        '$participants$': null
                    },
                    include:[
                        {
                            model: Participant,
                            as: 'participants',
                            attributes: []                            
                        },
                        {
                            model: Activity,
                            as: 'activity',
                            attributes: ['id'],
                            required: true,
                            include: [{
                                model: Objective,
                                as: 'objective',
                                attributes: ['id'],
                                required: true,
                                include: [{                                
                                    model: Proposal,
                                    as: 'proposal',
                                    attributes: ['id'],
                                    where: { status: 1 }               
                                }]
                            }]
                        }   
                    ]
                });
                res.send(plans);
            } catch (error) {
                next(error);
            }
        }
    },

    // activities without reports
    activityReport: {
        findAll: async (req, res, next) => {
            try {
                const accountId = req.payload.aud;
                const activities = await Activity.findAll({
                    attributes: ['id','action'],
                    where: { 
                        accountId, 
                        '$narratives$': null,
                    },
                    include: [
                        {
                            model: NarrativeReport,
                            as: 'narratives',
                            attributes: []
                        },
                        {
                            model: ActivityPlan,
                            as: 'activityPlans',
                            attributes: [],
                            required: true
                        },
                        {
                            model: Objective,
                            as: 'objective',
                            attributes: ['id'],
                            required: true,
                            include: [{                                
                                model: Proposal,
                                as: 'proposal',
                                attributes: ['id'],
                                where: { status: 1 }               
                            }]
                        }
                    ]
                });
                res.send(activities);
            } catch (error) {
                next(error);
            }
        }
    }    
};