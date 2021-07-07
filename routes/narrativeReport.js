const express = require('express');
const router = express.Router();
const NarrativeReport  = require('../controllers/NarrativeReport');

router.post('/', NarrativeReport.create);

router.get('/', NarrativeReport.findAll);

router.delete('/:id', NarrativeReport.delete);

module.exports = router;