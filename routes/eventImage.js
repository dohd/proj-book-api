const express = require('express');
const router = express.Router();
const EventImage = require('../controllers/EventImage');

router.get('/', EventImage.findAll);

router.post('/', EventImage.create);

router.delete('/:id', EventImage.delete);

module.exports = router;