const express = require('express');
const router = express.Router();
const PlanEvent = require('../controllers/PlanEvent');

router.get('/', PlanEvent.findAll);

router.patch('/:id', PlanEvent.update);

module.exports = router;