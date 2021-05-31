const { db, DataTypes } = require('../utils/database');

const Detail = db.define('detail', {
    name: { type: DataTypes.STRING, allowNull: false },
    telephone: { type: DataTypes.STRING(15), allowNull: false },
    email: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        validate: { isEmail: true } 
    },
});

module.exports = Detail;