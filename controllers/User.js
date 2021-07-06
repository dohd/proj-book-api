const createError = require('http-errors');

const { db, Op } = require('../utils/database');
const sendMail = require('../utils/sendMail');

const User = require('../models/User');
const Account = require('../models/Account');
const Login = require('../models/Login');
const { Role } = require('../models/Permission');

module.exports = {
    create: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { username, initial, email, roleId } = req.body;

            const useExists = await User.findOne({
                where: { username, email, accountId }, 
                attributes: ['id']
            });
            if (useExists) throw new createError.Conflict(`Username or email exists!`);

            const userInitExists = await User.findOne({
                where: { 
                    accountId,
                    initial: { [Op.iLike]: initial }
                },
                attributes: ['id']
            });
            if (userInitExists) throw new createError.Conflict(`User initials exists!`);

            const result = await db.transaction(async transaction => {
                // User
                const user = await User.create({ 
                    username, initial, email, roleId, accountId 
                }, {transaction});
                
                // Account
                const account = await Account.findByPk(user.accountId, { 
                    attributes: ['key','type'], transaction
                });
                const accountEmail = `${user.initial}@${account.key}${account.type}`;

                // Login
                const login = await Login.create({
                    accountId,
                    email: accountEmail, 
                    password: email,
                    userId: user.id,
                }, {transaction});
    
                const savedUser = user.toJSON();
                delete savedUser.accountId;

                const credentials = {
                    username: user.username,
                    email: login.email,
                    password: user.email,
                };

                return { credentials, email: user.email };
            });

            const { credentials } = result;
            const messageId = sendMail.loginCredentials(credentials, result.email);
            
            res.send({ messageId, email });
        } catch (err) {
            next(err);
        }
    },

    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { userId } = req.payload;

            const users = await User.findAll({
                where: { accountId, id: { [Op.ne]: userId } }, 
                attributes: { exclude: ['accountId','createdAt'] },
                order: [['updatedAt', 'DESC']],
                include: { model: Role, as: 'role' },
            });

            res.send(users);
        } catch (err) {
            next(err);
        }
    },

    update: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { id } = req.params;
            const { username, initial, email } = req.body;

            const userExists = await User.findOne({
                where: { 
                    username, email, accountId,
                    id: { [Op.ne]: id }
                }, 
                attributes: ['id']
            });
            if (userExists) throw new createError.Conflict(`Username or email exists!`);

            const userInitExists = await User.findOne({
                where: { 
                    accountId,
                    id: { [Op.ne]: id }, 
                    initial: { [Op.iLike]: initial }
                },
                attributes: ['id']
            });
            if (userInitExists) throw new createError.Conflict(`User initials exists!`);
            
            await db.transaction(async transaction => {
                // User
                await User.update(req.body, { 
                    where: { id, accountId }, transaction 
                });

                // User
                const user = await User.findByPk(id, { 
                    attributes: ['initial','id'], transaction 
                });

                // Account
                const account = await Account.findByPk(accountId, {
                    attributes: ['key','type'], transaction 
                });
                const accountEmail = `${user.initial}@${account.key}${account.type}`;

                // Login
                await Login.update({ email: accountEmail }, { 
                    where: { userId: user.id }, transaction 
                });
            });
            
            res.sendStatus(200);
        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            await User.destroy({ where: { id } });
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}