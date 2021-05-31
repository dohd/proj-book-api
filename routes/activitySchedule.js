const express = require('express');
const router = express.Router();
const ActivitySchedule = require('../controllers/ActivitySchedule');

router.get('/', ActivitySchedule.findAll);

module.exports = router;