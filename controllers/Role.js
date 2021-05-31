const { Role } = require('../models/Permission');

module.exports = {
    findAll: async (req, res, next) => {
        try {
            const roles = await Role.findAll();
            res.send(roles);
        } catch (error) {
            next(error);
        }
    }
};