const { db, DataTypes } = require('../utils/database');

const Role = db.define('role', {
    value: DataTypes.STRING
}, { timestamps: false });

module.exports = { Role };