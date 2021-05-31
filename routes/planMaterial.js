const express = require('express');
const router = express.Router();
const PlanMaterial = require('../controllers/PlanMaterial');

router.get('/', PlanMaterial.findAll);

router.patch('/:id', PlanMaterial.update);

module.exports = router;