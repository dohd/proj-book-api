const { db, DataTypes } = require('../utils/database');
const bcrypt = require('bcrypt');
const createError = require('http-errors');

const Login = db.define('login', {
    password: { type: DataTypes.STRING, allowNull: false },
    email: { 
        type: DataTypes.STRING, 
        allowNull: false,
        unique: true,        
        validate: { isEmail: true } 
    } 
});

// Hooks
Login.afterValidate(async (login, options) => {
    try {
        if (!login.password) return;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(login.password, salt);
        login.password = hash;
    } catch (err) {
        console.log(err.message);
        throw new createError.InternalServerError();
    }
});

// Custom instance method
Login.prototype.isValidPassword = async function (value) {
    try {
        return await bcrypt.compare(value, this.password);
    } catch (err) {
        console.log(err.message);
        throw new createError.InternalServerError();
    }
};

module.exports = Login;