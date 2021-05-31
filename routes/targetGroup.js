const express = require('express');
const router = express.Router();
const TargetGroup = require('../controllers/TargetGroup');

router.get('/', TargetGroup.findAll);

router.post('/', TargetGroup.create);

router.patch('/:id', TargetGroup.update);

router.delete('/:id', TargetGroup.delete);

module.exports = router;