const { db, DataTypes } = require('../utils/database');
const Objective = require('./Objective');

const Proposal = db.define('proposal', {
    title: { type: DataTypes.STRING, allowNull: false },
    startPeriod: { type: DataTypes.STRING, allowNull: false },
    endPeriod: { type: DataTypes.STRING, allowNull: false },
    dateSubmitted: { type: DataTypes.STRING, allowNull: false },
    budget: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = Proposal;

// One-to-Many Association
Proposal.hasMany(Objective, { 
    foreignKey: { name: 'proposalId', allowNull: false }, 
    as: 'objectives',
});
Objective.belongsTo(Proposal, { as: 'proposal' });
