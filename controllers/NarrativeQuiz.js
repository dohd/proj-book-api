const { NarrativeQuiz } = require('../models/NarrativeReport');

module.exports = {
    findAll: async (req, res, next) => {
        try {
            const quiz = await NarrativeQuiz.findAll();
            res.send(quiz);
        } catch (error) {
            next(error);
        }
    }
};