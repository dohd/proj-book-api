const express = require('express');
const router = express.Router();
const Agenda = require('../controllers/Agenda');

router.get('/', Agenda.findAll);

router.post('/', Agenda.create);

router.patch('/:id', Agenda.update);

router.delete('/:id', Agenda.delete);

module.exports = router;