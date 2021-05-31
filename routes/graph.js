const express = require('express');
const router = express.Router();
const ProgrammeGraph = require('../controllers/ProgrammeGraph');
const RegionGraph = require('../controllers/RegionGraph');

router.get('/participants-per-programme', ProgrammeGraph.findAll);
router.get('/participants-per-region', RegionGraph.findAll);

module.exports = router;