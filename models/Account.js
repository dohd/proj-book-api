const { db, DataTypes } = require('../utils/database');
const User = require('./User');
const Detail = require('./Detail');
const ContactPerson = require('./ContactPerson');
const Proposal = require('./Proposal');
const Donor = require('./Donor');
const { TargetGroup, KeyProgramme, Region } = require('./Essential');
const ProfileImage = require('./ProfileImage');

const Account = db.define('account', {
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, defaultValue: '.org' },
    key: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true,
        validate: { len: [2, 10] },
        set(value) { this.setDataValue('key', value.toLowerCase()) }
    },
});

module.exports = Account;

// One-to-One Association
Account.hasOne(ContactPerson, { 
    foreignKey: { name: 'accountId', allowNull: false },
    as: 'contact_person' 
});
ContactPerson.belongsTo(Account, { as: 'account'});

Account.hasOne(Detail, {
    foreignKey: { name: 'accountId', allowNull: false },
    as: 'detail'
});
Detail.belongsTo(Account, { as: 'account' });

Account.hasOne(ProfileImage, {
    foreignKey: { name: 'accountId', allowNull: false },
    as: 'profile_photo'
});
ProfileImage.belongsTo(Account, { as: 'account' });

// One-to-Many Association
Account.hasMany(User, { 
    foreignKey: { name: 'accountId', allowNull: false },
    as: 'users' 
});
User.belongsTo(Account, { as: 'account' });

Account.hasMany(TargetGroup, { 
    foreignKey: { name: 'accountId', allowNull: false  }, 
    as: 'target_groups' 
});
TargetGroup.belongsTo(Account, { as: 'account' });

Account.hasMany(Region, { 
    foreignKey: { name: 'accountId', allowNull: false  }, 
    as: 'regions' 
});
Region.belongsTo(Account, { as: 'account' });

Account.hasMany(KeyProgramme, { 
    foreignKey: { name: 'accountId', allowNull: false  }, 
    as: 'programmes' 
});
KeyProgramme.belongsTo(Account, { as: 'account' });

Account.hasMany(Proposal, { 
    foreignKey: { name: 'accountId', allowNull: false  }, 
    as: 'proposals' 
});
Proposal.belongsTo(Account, { as: 'account' });

Account.hasMany(Donor, {
    foreignKey: { name: 'accountId', allowNull: false },
    as: 'donors'
});
Donor.belongsTo(Account, { as: 'account' });