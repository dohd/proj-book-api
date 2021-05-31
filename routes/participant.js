const express = require('express');
const router = express.Router();
const Participant = require('../controllers/Participant');

router.get('/', Participant.findAll);

router.post('/', Participant.create);

router.patch('/:id', Participant.update);

router.delete('/:id', Participant.delete);

module.exports = router;
