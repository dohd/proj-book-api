const { 
    ActivityPlan, PlanRegion, PlanEvent, 
    PlanGroup, PlanProgramme  
} = require('../models/ActivityPlan');

// Array intersection
const intersect = (a1, a2, ...rest) => {
    const unique_arr = a1.filter(v => a2.includes(v));
    if (!rest.length) return Array.from(new Set(unique_arr));
    return intersect(unique_arr, ...rest);
};

module.exports = async (req, res, next) => {
    try {
        const paramKeys = Object.keys(req.query);
        if (!paramKeys.length) {
            req.query.activityIds = null;
            return next();
        }

        // activity_plan_Ids
        let region_Ids = [];
        let programme_Ids = [];
        let group_Ids = [];

        if (paramKeys.includes('region')) {
            const plan_regions = await PlanRegion.findAll({
                where: { regionId: req.query.region },
                attributes: ['planEventId']
            });

            if (!plan_regions.length) return res.send(plan_regions);

            const planEventIds = plan_regions.map(v => v.planEventId);
            const plan_events = await PlanEvent.findAll({
                where: { id: planEventIds },
                attributes: ['activityPlanId']
            });

            region_Ids = plan_events.map(v => v.activityPlanId);
        }

        if (paramKeys.includes('group')) {
            const plan_groups = await PlanGroup.findAll({
                where: { targetGroupId: req.query.group },
                attributes: ['activityPlanId']
            });

            if (!plan_groups.length) return res.send(plan_groups);

            group_Ids = plan_groups.map(v => v.activityPlanId);
        }

        if (paramKeys.includes('programme')) {
            const plan_programmes = await PlanProgramme.findAll({
                where: { keyProgrammeId: req.query.programme },
                attributes: ['activityPlanId']
            });

            if (!plan_programmes.length) return res.send(plan_programmes);

            programme_Ids = plan_programmes.map(v => v.activityPlanId);
        }

        const findActivityIds = async activityPlanIds => {
            const activity_plans = await ActivityPlan.findAll({
                where: { id: activityPlanIds },
                attributes: ['activityId']
            });

            const activityIds = activity_plans.map(v => v.activityId);
            req.query.activityIds = activityIds;
            next();
        };

        // filter group, region & programme 
        if (region_Ids.length && programme_Ids.length && group_Ids.length) {
            const activityPlanIds = intersect(region_Ids, programme_Ids, group_Ids);
            return findActivityIds(activityPlanIds);
        }

        // filter region & group
        if (region_Ids.length && group_Ids.length) {
            const activityPlanIds = intersect(region_Ids, group_Ids);
            return findActivityIds(activityPlanIds);
        }

        // filter region & programme
        if (region_Ids.length && programme_Ids.length) {
            const activityPlanIds = intersect(group_Ids, programme_Ids);
            return findActivityIds(activityPlanIds);
        }

        // filter group & programme
        if (group_Ids.length && programme_Ids.length) {
            const activityPlanIds = intersect(region_Ids, programme_Ids);
            return findActivityIds(activityPlanIds);
        }

        // filter region or group or programme 
        if (region_Ids.length) return findActivityIds(region_Ids);
        if (group_Ids.length) return findActivityIds(group_Ids);
        if (programme_Ids.length) return findActivityIds(programme_Ids);
    } catch (error) {
        next(error);
    }
};