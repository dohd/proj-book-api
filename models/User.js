const { db, DataTypes } = require('../utils/database');
const Login = require('./Login');
const { Role } = require('./Permission');

const User = db.define('user', {
    username: { type: DataTypes.STRING, allowNull: false },
    initial: { 
        type: DataTypes.STRING, 
        allowNull: false,
        set(value) {
            this.setDataValue('initial', value.toLowerCase());
        }
    },
    email: { 
        type: DataTypes.STRING, 
        allowNull: false,        
        validate: { isEmail: true } 
    }   
});

module.exports = User;

// One-to-One Association
User.hasOne(Login, {
    foreignKey: { name: 'userId', allowNull: false },
    as: 'login'
});
Login.belongsTo(User, { as: 'user' });

// Many-to-Many Association
Role.hasMany(User, {
    foreignKey: { name: 'roleId', allowNull: false },
    as: 'users',
    onDelete: 'set null'
});
User.belongsTo(Role, { as: 'role' });