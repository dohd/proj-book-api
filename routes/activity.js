const express = require('express');
const router = express.Router();
const Activity = require('../controllers/Activity');

router.post('/', Activity.create);

router.get('/', Activity.findAll);

router.delete('/:id', Activity.delete);

router.patch('/:id', Activity.update);

module.exports = router;