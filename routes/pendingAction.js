const express = require('express');
const router = express.Router();
const PendingAction = require('../controllers/PendingAction');

router.get('/activity-plans', PendingAction.activityPlan.findAll);

router.get('/plan-participants', PendingAction.planParticipant.findAll);

router.get('/activity-reports', PendingAction.activityReport.findAll);

module.exports = router;