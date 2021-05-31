const express = require('express');
const router = express.Router();

router.use('/users', require('./user'));
router.use('/roles', require('./role'));
router.use('/donors', require('./donor'));
router.use('/donor-contacts', require('./donorContact'));
router.use('/narrative-quiz', require('./narrativeQuiz'));

router.use('/profile-image', require('./profileImage'));
router.use('/organisation-profile', require('./orgProfile'));
router.use('/target-regions', require('./region'));
router.use('/target-groups', require('./targetGroup'));
router.use('/key-programmes', require('./keyProgramme'));

router.use('/proposals', require('./proposal'));
router.use('/objectives', require('./objective'));
router.use('/activities', require('./activity'));

router.use('/activity-plans', require('./activityPlan'));
router.use('/participants', require('./participant'));
router.use('/agenda', require('./agenda'));

router.use('/narrative-reports', require('./narrativeReport'));
router.use('/case-studies', require('./caseStudy'));
router.use('/event-images', require('./eventImage'));

router.use('/activity-count', require('./activityCount'));
router.use('/activity-schedule', require('./activitySchedule'));
router.use('/participant-analysis', require('./participantAnalysis'));

router.use('/pending-action', require('./pendingAction'));

// graphs
router.use('/graphs', require('./graph'));

// Untargeted endpoints
router.use('/activity-plan-groups', require('./planGroup'));
router.use('/activity-plan-regions', require('./planRegion'));
router.use('/activity-plan-dates', require('./planEvent'));
router.use('/activity-plan-materials', require('./planMaterial'));
router.use('/activity-plan-programmes', require('./planProgramme'));
router.use('/responses', require('./response'));

module.exports = router;