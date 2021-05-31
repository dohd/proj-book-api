const Gender = require('../models/Gender');

module.exports = {
    findAll: async (req, res, next) => {
        try {
            const gender = await Gender.findAll();
            res.send(gender);
        } catch (error) {
            next(error);
        }
    }
}