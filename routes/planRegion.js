const express = require('express');
const router = express.Router();
const PlanRegion = require('../controllers/PlanRegion');

router.get('/', PlanRegion.findAll);

router.patch('/:id', PlanRegion.update);

module.exports = router;