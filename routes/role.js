const express = require('express');
const router = express.Router();
const Role = require('../controllers/Role');

router.get('/', Role.findAll);

module.exports = router;