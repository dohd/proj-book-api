const express = require('express');
const router = express.Router();
const User = require('../controllers/User');
const authRole = require('../middlewares/authRole');

router.post('/', authRole.isAdmin, User.create);

router.get('/', authRole.isAdmin, User.findAll);

router.patch('/:id', authRole.isAdmin, User.update);

router.delete('/:id', authRole.isAdmin, User.delete);

module.exports = router;