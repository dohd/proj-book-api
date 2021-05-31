const { db, DataTypes } = require('../utils/database');

const Participant = db.define('participant', {
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    fName: { type: DataTypes.STRING, allowNull: false },
    lName: { type: DataTypes.STRING, allowNull: false },
    gender: { type: DataTypes.STRING, allowNull: false },
    activityDate: { type: DataTypes.STRING, allowNull: false }
});

const ParticipantDetail = db.define('participant_detail', {
    disability: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING(15), allowNull: false },
    email: { 
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true }
    },
    designation: { type: DataTypes.STRING, allowNull: false },
});

// One-to-One Association
Participant.hasOne(ParticipantDetail, {
    foreignKey: { name: 'participantId', allowNull: false },
    as: 'detail'
});
ParticipantDetail.belongsTo(Participant, { as: 'participant' });

module.exports = { Participant, ParticipantDetail };