const { db, DataTypes } = require('../utils/database');
const { Response } = require('./NarrativeReport');

const Agenda = db.define('agenda', {
    startTime: { type: DataTypes.STRING, allowNull: false },
    endTime: { type: DataTypes.STRING, allowNull: false },
    task: { type: DataTypes.STRING, allowNull: false },
    assignee: { type: DataTypes.STRING, allowNull: false },
    designation: { type: DataTypes.STRING, allowNull: false },
    accountId: { type: DataTypes.INTEGER, allowNull: false }
}, { freezeTableName: true });

module.exports = Agenda;

// One-to-Many Association
Agenda.hasMany(Response, { 
    foreignKey: { name: 'agendaId', allowNull: false }, 
    as: 'responses',
    onDelete: 'set null' 
});
Response.belongsTo(Agenda, { as: 'agenda' });