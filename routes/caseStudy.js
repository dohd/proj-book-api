const express = require('express');
const router = express.Router();
const CaseStudy = require('../controllers/CaseStudy');

router.get('/', CaseStudy.findAll);

router.patch('/:id', CaseStudy.update);

router.delete('/:id', CaseStudy.delete);

module.exports = router;