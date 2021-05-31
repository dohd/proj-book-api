const express = require('express');
const router = express.Router();
const PlanGroup = require('../controllers/PlanGroup');

router.get('/', PlanGroup.findAll);

router.patch('/:id', PlanGroup.update);

module.exports = router;