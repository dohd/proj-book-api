const express = require('express');
const router = express.Router();
const KeyProgramme = require('../controllers/KeyProgramme');

router.get('/', KeyProgramme.findAll);

router.post('/', KeyProgramme.create);

router.patch('/:id', KeyProgramme.update);

router.delete('/:id', KeyProgramme.delete);

module.exports = router;