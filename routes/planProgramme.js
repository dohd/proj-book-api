const express = require('express');
const router = express.Router();
const PlanProgramme = require('../controllers/PlanProgramme');

router.get('/', PlanProgramme.findAll);

router.patch('/:id', PlanProgramme.update);

module.exports = router;