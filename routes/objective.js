const express = require('express');
const router = express.Router();
const Objective = require('../controllers/Objective');

router.post('/', Objective.create);

router.get('/', Objective.findAll);

router.patch('/:id', Objective.update);

router.delete('/:id', Objective.delete);

module.exports = router;