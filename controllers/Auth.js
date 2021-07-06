const createError = require('http-errors');
const { UniqueConstraintError } = require('sequelize');

const { db, Op } = require('../utils/database');
const sendMail = require('../utils/sendMail');
const { 
    signAccessToken, signRefreshToken, 
    verifyRefreshToken
} = require('../utils/JWT');
// const redisClient = require('../utils/redis');

const Account = require('../models/Account');
const User = require('../models/User');
const Login = require('../models/Login');
const Detail = require('../models/Detail');
const ContactPerson = require('../models/ContactPerson');

module.exports = {
    register: async (req, res, next) => {
        try {
            const data = req.body;

            const result = await db.transaction(async transaction => {
                // Account
                const account = await Account.create({ 
                    name: data.orgName,
                    key: data.keyName.replace(/\s/g, '') //filter all white spaces
                }, {transaction});

                const username = data.username.split(' ');
                const initial = `${username[0][0]}.${username[1]}`;

                // User
                const user = await User.create({
                    initial,
                    username: data.username,
                    email: data.email,
                    roleId: 1, //admin
                    accountId: account.id
                }, {transaction});

                const accountEmail = `${user.initial}@${account.key}${account.type}`;
                // Login
                const login = await Login.create({
                    email: accountEmail,
                    password: data.password,
                    userId: user.id,
                }, {transaction});

                // Detail (Org profile)
                await Detail.create({
                    name: data.orgName,
                    telephone: data.orgTelephone,
                    email: data.orgEmail,
                    accountId: account.id
                }, {transaction});
                
                // Contact person
                const name = data.name.split(' ');
                await ContactPerson.create({
                    telephone: data.cpTelephone,
                    email: data.cpEmail,
                    fName: name[0],
                    lName: name[1],
                    accountId: account.id
                }, {transaction});

                const credentials = { 
                    username: user.username,
                    email: login.email,
                    password: data.password
                }
                
                return { credentials, email: user.email };
            });

            const { credentials, email } = result;
            const messageId = sendMail.loginCredentials(credentials, email);
            
            res.send({ messageId, email });
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                const errItem = error.errors[0];
                const msg = `${errItem.value} already exists!`;
                return next(new createError.UnprocessableEntity(msg));
            }
            next(error);
        }
    },

    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            if(!email || !password) throw new createError.Unauthorized(
                'Email or password is required!'
            ); 
            
            // Login
            const login = await Login.findOne({ 
                where: { email }, attributes: ['userId','password']
            });
            if(!login) throw new createError.Unauthorized(
                'Email or password is invalid!'
            );
    
            const isValid = await login.isValidPassword(password);
            if (!isValid) throw new createError.Unauthorized(
                'Email or password is invalid!'
            );

            // User
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
            console.log('Logout accountId: '+ accountId);
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    },

    resetPassword: async (req, res, next) => {
        try {
            const { userId } = req.payload;
            const { password, newPassword } = req.body; 

            const login = await Login.findOne({
                where: { userId },
                attributes: ['id','password']
            });

            const isValid = await login.isValidPassword(password);
            if (!isValid) throw new createError.Unauthorized('Invalid password!');

            login.password = newPassword;
            await login.save();

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    },

    recoverPassword: async (req, res, next) => {
        try {
            const { email } = req.body;

            const user = await User.findOne({
                where: { email }, attributes: ['id','username']
            });
            if (!user) throw new createError.Unauthorized('Invalid email!');

            const login = await Login.findOne({
                where: { userId: user.id },
                attributes: ['id','passwordToken','tokenExp']
            });

            login.generateRecoveryToken();
            await login.save();
            await login.reload();

            const link = `${process.env.CLIENT_URL}/reset-password/${login.passwordToken}`;
            const messageId = await sendMail.passwordResetLink(user.username, email, link);
            
            res.send({messageId, email});
        } catch (error) {
            next(error);
        }
    },

    recoveryPassword: async (req, res, next) => {
        try {
            const { confirm, password, passwordToken } = req.body;
            if (confirm !== password) throw new createError.Unauthorized(
                'Passwords do not match!'
            );
            
            const login = await Login.findOne({
                where: { 
                    passwordToken, 
                    tokenExp: { [Op.gt]: Date.now() } 
                },
                attributes: ['id','passwordToken','tokenExp','password']
            });
            if (!login) throw new createError.Unauthorized();

            login.password = password;
            login.passwordToken = null;
            login.tokenExp = null;
            await login.save();

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    },

    refreshToken: async (req, res, next) => {
        try {
            const token  = req.cookies.refreshToken;
            if (!token) throw new createError.BadRequest();

            const userId = await verifyRefreshToken(token);
            
            const accessToken = await signAccessToken(userId);
            const refreshToken = await signRefreshToken(userId);

            res.cookie('refreshToken', refreshToken, { httpOnly: true });
            res.send({ accessToken });
        } catch (err) {
            next(err);
        }
    },
};