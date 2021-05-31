const express = require('express');
const router = express.Router();
const NarrativeQuiz = require('../controllers/NarrativeQuiz');

router.get('/', NarrativeQuiz.findAll);

module.exports = router;