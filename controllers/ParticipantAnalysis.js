const { 
    ActivityPlan, PlanRegion,
    PlanEvent, PlanGroup,
    PlanProgramme
} = require('../models/ActivityPlan');
const { TargetGroup, KeyProgramme, Region } = require('../models/Essential');
const Activity = require('../models/Activity');
const { Participant } = require('../models/Participant');

// Extract unique plans with participants
const unique_plan = arr => {
    const plan_obj = arr.reduce((r, c) => {
        const key = c.activity.id + '|' + c.activity.action;
        const keyExist = typeof r[key] === 'object';
        const isEnactedPlan = c.participants.length;

        if (keyExist && isEnactedPlan) {
            const participants = r[key].participants.concat(c.participants);
            const planEvents = r[key].planEvents.concat(c.planEvents);
            const planProgramme = r[key].planProgramme.concat([c.planProgramme]);
            const planGroups = r[key].planGroups.concat(c.planGroups);

            Object.assign(r[key], { 
                participants, planEvents, planProgramme, planGroups 
            });
        }
        if (!keyExist && isEnactedPlan) {
            r[key] = {...c, planProgramme: [c.planProgramme]};
        }
        return r;
    }, {});
    return Object.values(plan_obj);
};
// Perform plan analysis
const analyse = arr => {
    const unique = arr => {
        const obj = arr.reduce((r, c) => {
            const key = '_' + c.id;
            if (!r[key]) r[key] = c;
            return r;
        }, {});
        return Object.values(obj);
    };
    
    const plans = arr.map(v => {
        const obj = {...v};
        const participants = unique(v.participants);

        let male = 0;
        let female = 0;
        participants.forEach(p => {
            if (p.gender === 'M') male++;
            else female++;
        });

        obj.participants = { male, female };
        obj.planEvents = Array.from(new Set(v.planEvents.map(v => v.date)));

        const regionSet = new Set();
        const programmeSet = new Set();
        const groupSet = new Set();

        v.planEvents.forEach(event => {
            event.planRegions.forEach(planReg => {
                regionSet.add(planReg.region.area);
            });
        });
        v.planProgramme.forEach(planProg => {
            programmeSet.add(planProg.keyProgramme.programme);
        });
        v.planGroups.forEach(planGroup => {
            groupSet.add(planGroup.targetGroup.group);
        })

        obj.planRegions = Array.from(regionSet);
        obj.planProgramme = Array.from(programmeSet);
        obj.planGroups = Array.from(groupSet);
        return obj;
    });
    return plans;
};

module.exports = {
    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const plans = await ActivityPlan.findAll({
                where: { accountId },
                attributes: ['id','title'],
                include: [
                    {
                        model: Activity,
                        as: 'activity',
                        attributes: ['id','action']
                    },
                    {
                        model: Participant,
                        as: 'participants',
                        attributes: ['id','fName','lName','gender'],
                    },
                    {
                        model: PlanEvent,
                        as: 'planEvents',
                        attributes: ['id','date'],
                        include: [
                            {
                                model: PlanRegion,
                                as: 'planRegions',
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Region,
                                        as: 'region',
                                        attributes: ['id','area']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: PlanProgramme,
                        as: 'planProgramme',
                        attributes: ['id'],
                        include: [
                            {
                                model: KeyProgramme,
                                as: 'keyProgramme',
                                attributes: ['id','programme']
                            }
                        ]
                    },
                    {
                        model: PlanGroup,
                        as: 'planGroups',
                        attributes: ['id'],
                        include: [
                            {
                                model: TargetGroup,
                                as:'targetGroup',
                                attributes: ['id','group']
                            }
                        ]
                    }
                ]
            });

            // clone to remove model clutter
            const new_plans = JSON.parse(JSON.stringify(plans));
            const plan_analysis = analyse(unique_plan(new_plans));
            res.send(plan_analysis);
        } catch (error) {
            next(error);
        }
    }
};