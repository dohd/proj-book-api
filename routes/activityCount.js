const express = require('express');
const router = express.Router();
const ActivityCount = require('../controllers/ActivityCount');

router.get('/', ActivityCount.findAll);

module.exports = router;