const { db, DataTypes } = require('../utils/database');
const { Participant } = require('../models/Participant');

const ActivityPlan = db.define('activity_plan', {
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false }
});

const PlanEvent = db.define('plan_event', {
    date: { type: DataTypes.STRING, allowNull: false },
    accountId: { type: DataTypes.INTEGER, allowNull: false }
});

const PlanRegion = db.define('plan_region', {
    accountId: { type: DataTypes.INTEGER, allowNull: false },
});

const PlanGroup = db.define('plan_group', {
    accountId: { type: DataTypes.INTEGER, allowNull: false },
});

const PlanProgramme = db.define('plan_programme', {
    accountId: { type: DataTypes.INTEGER, allowNull: false },
});

const PlanMaterial = db.define('plan_material', {
    material: { type: DataTypes.STRING, allowNull: false },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = { 
    ActivityPlan, PlanRegion, PlanEvent, PlanMaterial,
    PlanGroup, PlanProgramme  
};

// One-to-One Association
ActivityPlan.hasOne(PlanProgramme, {
    foreignKey: { name: 'activityPlanId', allowNull: false },
    as: 'planProgramme'
});
PlanProgramme.belongsTo(ActivityPlan, { as: 'activityPlan' });

ActivityPlan.hasOne(PlanMaterial, {
    foreignKey: { name: 'activityPlanId', allowNull: false },
    as: 'planMaterial'
});
PlanMaterial.belongsTo(ActivityPlan, { as: 'activityPlan' });

// One-to-Many Association
ActivityPlan.hasMany(Participant, {
    foreignKey: { name: 'activityPlanId', allowNull: false },
    as: 'participants'
});
Participant.belongsTo(ActivityPlan, { as: 'activityPlan' });

ActivityPlan.hasMany(PlanGroup, {
    foreignKey: { name: 'activityPlanId', allowNull: false },
    as: 'planGroups'
});
PlanGroup.belongsTo(ActivityPlan, { as: 'activityPlan' });

ActivityPlan.hasMany(PlanEvent, {
    foreignKey: { name: 'activityPlanId', allowNull: false },
    as: 'planEvents'
});
PlanEvent.belongsTo(ActivityPlan, { as: 'activityPlan' });

PlanEvent.hasMany(PlanRegion, {
    foreignKey: { name: 'planEventId', allowNull: false },
    as: 'planRegions'
});
PlanRegion.belongsTo(PlanEvent, { as: 'planEvent' });