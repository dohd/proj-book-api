const createError = require('http-errors');
const User = require('../models/User');

module.exports = {
    isAdmin: async (req, res, next) => {
        try {
            const id = req.payload.userId;
            const user = await User.findByPk(id, {
                attributes: ['roleId'],
            });
            // roleId = 1 for Admin;
            if (user.roleId === 1) return next();
            throw new createError.Unauthorized();
        } catch (error) {
            next(error);
        }
    }
};