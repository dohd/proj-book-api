const createError = require('http-errors');
const { db } = require('../utils/database');
const { UniqueConstraintError } = require('sequelize');
// const redisClient = require('../utils/redis');
const { 
    signAccessToken, signRefreshToken, 
    verifyRefreshToken
} = require('../utils/JWT');
const Account = require('../models/Account');
const User = require('../models/User');
const Login = require('../models/Login');
const Detail = require('../models/Detail');
const ContactPerson = require('../models/ContactPerson');

module.exports = {
    register: async (req, res, next) => {
        try {
            const data = req.body;

            const result = await db.transaction(async t => {
                const transaction = t;
                // Account
                const account = await Account.create({ 
                    name: data.orgName,
                    key: data.keyName
                }, {transaction});

                // User
                let names = data.username.split(' ');
                const initial = `${names[0][0]}.${names[1]}`;
                // roleId = 1 for Admin
                const user = await User.create({
                    initial,
                    username: data.username,
                    email: data.email,
                    roleId: 1,
                    accountId: account.id
                }, {transaction});

                // Org profile
                const detail = await Detail.create({
                    name: data.orgName,
                    telephone: data.orgTelephone,
                    email: data.orgEmail,
                    accountId: account.id
                }, {transaction});
                
                // Contact person
                names = data.name.split(' ');
                const person = await ContactPerson.create({
                    telephone: data.cpTelephone,
                    email: data.cpEmail,
                    fName: names[0],
                    lName: names[1],
                    accountId: account.id
                }, {transaction});

                // Login
                const email = `${user.initial}@${account.key}${account.type}`;
                const login = await Login.create({
                    email,
                    password: data.password,
                    userId: user.id,
                }, {transaction});
                
                const accessToken = await signAccessToken(user);
                const refreshToken = await signRefreshToken(user);

                return { accessToken, refreshToken, detail, person, login };
            });
            
            const { accessToken, refreshToken } = result;
            res.cookie('refreshToken', refreshToken, { httpOnly: true });
            res.send({ accessToken });
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                const errItem = error.errors[0];
                const msg = `${errItem.value} already exists`;
                return next(new createError.UnprocessableEntity(msg));
            }
            next(error);
        }
    },

    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            if(!email || !password) throw new createError.NotFound(
                'Email or password is required!'
            );            
            const login = await Login.findOne({ 
                where: { email }, attributes: ['userId','password']
            });
            if(!login) throw new createError.NotFound(
                'Email or password is invalid!'
            );
    
            const isValid = await login.isValidPassword(password);
            if (!isValid) throw new createError.Unauthorized(
                'Email or password is invalid!'
            );

            const user = await User.findByPk(login.userId, { 
                attributes: ['accountId','id','roleId'],
            });
    
            const accessToken = await signAccessToken(user);
            const refreshToken = await signRefreshToken(user);

            res.cookie('refreshToken', refreshToken, { httpOnly: true });
            res.send({ accessToken });
        } catch (err) {
            next(err);
        }
    },

    refreshToken: async (req, res, next) => {
        try {
            const token  = req.cookies.refreshToken;
            if (!token) throw new createError.BadRequest();

            const accountId = await verifyRefreshToken(token);
            
            const accessToken = await signAccessToken(accountId);
            const refreshToken = await signRefreshToken(accountId);

            res.cookie('refreshToken', refreshToken, { httpOnly: true });
            res.send({ accessToken });
        } catch (err) {
            next(err);
        }
    },

    logout: async (req, res, next) => {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) throw new createError.BadRequest();

            const accountId = await verifyRefreshToken(refreshToken);
            // Redis cache
            // redisClient.del(accountId, (err, value) => {
            //     if (err) {
            //         console.log(err.message);
            //         throw new createError.InternalServerError();
            //     }
            //     console.log(value);
            //     res.sendStatus(204);
            // });
            console.log('accountId:',accountId);
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    },

    resetPassword: async (req, res, next) => {
        try {
            const userId = req.payload.userId;
            const { password, newPassword } = req.body;
            
            const login_match = await Login.findOne({
                where: { userId },
                attributes: ['password']
            });

            const isValid = await login_match.isValidPassword(password);
            if (!isValid) throw new createError.Unauthorized('Invalid password!');

            await Login.update({ password: newPassword }, { where: { userId } });
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }
};