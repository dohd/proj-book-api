const express = require('express');
const router = express.Router();
const ActivityPlan = require('../controllers/ActivityPlan');

router.post('/', ActivityPlan.create);

router.get('/', ActivityPlan.findAll);

router.delete('/:id', ActivityPlan.delete);

module.exports = router;