const express = require('express');
const router = express.Router();
const Analysis = require('../controllers/ParticipantAnalysis');

router.get('/', Analysis.findAll);

module.exports = router;