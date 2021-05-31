const { db, DataTypes } = require('../utils/database');
const Proposal = require('./Proposal');
const DonorContact = require('./DonorContact');

const Donor = db.define('donor', {
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING(15), allowNull: false },
    email: {
        type: DataTypes.STRING, 
        allowNull: false,
        validate: { isEmail: true } 
    }
});

module.exports = Donor;

// One-to-One Association
Donor.hasOne(DonorContact, {
    foreignKey: { name: 'donorId', allowNull: false },
    as: 'donorContact',
    onDelete: 'set null'
});
DonorContact.belongsTo(Donor, { as: 'donor' });

// One-to-Many Association
Donor.hasMany(Proposal, {
    foreignKey: { name: 'donorId', allowNull: false },
    as: 'proposals',
    onDelete: 'set null'
});
Proposal.belongsTo(Donor, { as: 'donor' });