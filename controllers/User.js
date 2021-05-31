const { db, Op } = require('../utils/database');
const createError = require('http-errors');
const User = require('../models/User');
const Account = require('../models/Account');
const Login = require('../models/Login');
const { Role } = require('../models/Permission');

module.exports = {
    create: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { username, initial, email, roleId } = req.body;

            const userMatch = await User.findOne({
                where: { username, email, accountId }, 
                attributes: ['id']
            });
            if (userMatch) throw new createError.Conflict(`User exists!`);

            const initMatch = await User.findOne({
                where: { initial, accountId }, attributes: ['id']
            });
            if (initMatch) throw new createError.Conflict(`Initial exists!`);

            const result = await db.transaction(async t => {
                const transaction = t;

                const user = await User.create({ 
                    username, initial, email, roleId, accountId 
                }, {transaction});
    
                const account = await Account.findByPk(user.accountId, { 
                    attributes: ['domain'], transaction
                });
    
                const loginEmail = `${user.initial}@${account.key}${account.type}`;
                const login = await Login.create({
                    accountId,
                    email: loginEmail, 
                    password: username, 
                    userId: user.id,
                }, {transaction});    
    
                const saved_user = user.toJSON();
                delete saved_user.accountId;

                const saved_login = login.toJSON();
                delete saved_login.userId;
                delete saved_login.password;
                delete saved_login.accountId;

                return { user: saved_user, login: saved_login };
            });
            res.send(result);
        } catch (err) {
            next(err);
        }
    },

    findAll: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const userId = req.payload.userId;
            const users = await User.findAll({
                where: { accountId, id: { [Op.ne]: userId } }, 
                attributes: { exclude: ['accountId','roleId','createdAt','updatedAt'] },
                include: { model: Role, as: 'role' }
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

            const userMatch = await User.findOne({
                where: { id: { [Op.ne]: id }, username, email, accountId }, 
                attributes: ['id']
            });
            if (userMatch) throw new createError.Conflict(`User exists!`);

            const initMatch = await User.findOne({
                where: { id: { [Op.ne]: id }, initial, accountId },
                attributes: ['id']
            });
            if (initMatch) throw new createError.Conflict(`Initial exists!`);
            
            await db.transaction(async t => {
                const transaction = t;

                await User.update(req.body, { where: { id, accountId }, transaction });

                const account = await Account.findByPk(accountId, {
                    attributes: ['key','type'], transaction 
                });
                const user = await User.findByPk(id, { 
                    attributes: ['initial','id'], transaction 
                });

                const loginEmail = `${user.initial}@${account.key}${account.type}`;
                await Login.update({ email: loginEmail }, { 
                    where: { userId: user.id }, transaction 
                });
                return;
            });
            res.sendStatus(200);
        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            const accountId = req.payload.aud;
            const { id } = req.params;
            
            await User.destroy({ where: { id, accountId } });
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}