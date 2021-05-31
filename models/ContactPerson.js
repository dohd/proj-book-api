const { db, DataTypes } = require('../utils/database');

const ContactPerson = db.define('contact_person', {
    fName: { type: DataTypes.STRING, allowNull: false },
    lName: { type: DataTypes.STRING, allowNull: false },
    telephone: { type: DataTypes.STRING(15), allowNull: false },
    email: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: { isEmail: true } 
    }
});

module.exports = ContactPerson;