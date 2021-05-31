const { db, DataTypes } = require('../utils/database');
const Activity = require('./Activity');

const Objective = db.define('objective', {
    objective: { type: DataTypes.STRING, allowNull: false },
    accountId: { type: DataTypes.INTEGER, allowNull: false }
});

// One-to-Many Association
Objective.hasMany(Activity, { 
    foreignKey: { name: 'objectiveId', allowNull: false }, 
    as: 'activities', 
});
Activity.belongsTo(Objective, { as: 'objective' });

module.exports = Objective;