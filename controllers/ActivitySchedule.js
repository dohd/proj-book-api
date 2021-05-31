const moment = require('moment');
const { Op } = require('../utils/database');
const { ActivityPlan, PlanEvent } = require('../models/ActivityPlan');
const Activity = require('../models/Activity');

// Add days to date 
const addDay = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return new Date(d);
};

// Extract unique plans
const unique_plan = arr => {
    const plan_obj = arr.reduce((r, c) => {
        const key = c.activity.id + '|' + c.activity.action;
        const keyExist = typeof r[key] === 'object';

        if (keyExist) {
            const events = r[key].planEvents.concat(c.planEvents);
            // extracting unique dates
            const dates = Array.from(new Set(events.map(v => v.date)));
            r[key].planEvents = dates.map(v => ({ date: v }));
        }
        if (!keyExist) r[key] = c;
        return r;
    }, {});
    return Object.values(plan_obj);
};

// inject Daysleft property
const daysLeft = arr => arr.map(v => {
    const dates = v.planEvents.map(e => e.date);
    // Extract minimum date out of dates
    const minDate = dates.reduce((r, c) => r < c ? r : c);

    const d1 = new Date();
    const d2 = new Date(minDate);
    const diffTime = Math.abs(d1-d2);
    const diffDays = Math.ceil(diffTime/(1000*60*60*24));

    v.planEvents = { date: minDate, daysLeft: diffDays };
    return v;
});

module.exports = {
    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;

            const now = new Date();
            // next 30days(1month)
            const later = addDay(now, 30);
            const dateRange = [now, later].map(v => {
                return moment(v).format('YYYY-MM-DD');
            });

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
                        model: PlanEvent,
                        as: 'planEvents',
                        attributes: ['date'],
                        where: {
                            [Op.and]: [
                                {
                                    date: { [Op.gt]: dateRange[0] }

                                },
                                {
                                    date: { [Op.lte]: dateRange[1] }

                                },
                            ]
                        }
                    }
                ]
            });

            // clonning to remove model clutter
            const cloned_plans = JSON.parse(JSON.stringify(plans));
            const activity_schedule = daysLeft(unique_plan(cloned_plans));
            res.send(activity_schedule);
        } catch (error) {
            next(error);
        }
    }
};