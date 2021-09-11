const express = require('express');
const router = express.Router();

const EventPlan = require('../controllers/EventPlan');

router.get('/', EventPlan.findAll);

module.exports = router;
