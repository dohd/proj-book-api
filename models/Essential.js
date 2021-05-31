const { db, DataTypes } = require('../utils/database');
const {
    PlanRegion, PlanGroup, PlanProgramme  
} = require('./ActivityPlan');
const { Participant } = require('./Participant');

const TargetGroup = db.define('target_group', {
    group: { type: DataTypes.STRING, allowNull: false }
});

const Region = db.define('region', {
    area: { type: DataTypes.STRING, allowNull: false }
});

const KeyProgramme = db.define('key_programme', {
    programme: { type: DataTypes.STRING, allowNull: false }
});

module.exports = { TargetGroup, KeyProgramme, Region };

// One-to-Many Association
Region.hasMany(PlanRegion, {
    foreignKey: { name: 'regionId', allowNull: false },
    as: 'planRegions',
    onDelete: 'set null'
});
PlanRegion.belongsTo(Region, { as: 'region' });

TargetGroup.hasMany(PlanGroup, {
    foreignKey: { name: 'targetGroupId', allowNull: false },
    as: 'planGroups',
    onDelete: 'set null'
});
PlanGroup.belongsTo(TargetGroup, { as: 'targetGroup' });

KeyProgramme.hasMany(PlanProgramme, {
    foreignKey: { name: 'keyProgrammeId', allowNull: false },
    as: 'planProgrammes',
    onDelete: 'set null'
});
PlanProgramme.belongsTo(KeyProgramme, { as: 'keyProgramme' });

Region.hasMany(Participant, {
    foreignKey: { name: 'regionId', allowNull: false },
    as: 'participants',
    onDelete: 'set null'
});
Participant.belongsTo(Region, { as: 'region' });

KeyProgramme.hasMany(Participant, {
    foreignKey: { name: 'keyProgrammeId', allowNull: false },
    as: 'participants',
    onDelete: 'set null'
});
Participant.belongsTo(KeyProgramme, { as: 'keyProgramme' });
