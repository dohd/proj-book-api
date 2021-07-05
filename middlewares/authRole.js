const createError = require('http-errors');
const User = require('../models/User');

module.exports = {
    isAdmin: async (req, res, next) => {
        try {
            const { userId } = req.payload;
            const user = await User.findByPk(userId, {
                attributes: ['roleId'],
            });
            
            // roleId = 1 for Admin;
            if (user.roleId === 1) return next();
            if (req.method === 'GET') res.send([]);
            throw new createError.Unauthorized();
        } catch (error) {
            next(error);
        }
    }
};