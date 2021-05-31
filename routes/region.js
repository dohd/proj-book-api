const express = require('express');
const router = express.Router();
const Region = require('../controllers/Region');
const authRole = require('../middlewares/authRole');

router.get('/', Region.findAll);

router.post('/', authRole.isAdmin, Region.create);

router.patch('/:id', authRole.isAdmin, Region.update);

router.delete('/:id', authRole.isAdmin, Region.delete);

module.exports = router;