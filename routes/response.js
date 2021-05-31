const express = require('express');
const router = express.Router();
const Response = require('../controllers/Response');

router.get('/', Response.findAll);

router.patch('/:id', Response.update);

router.delete('/:id', Response.delete);

module.exports = router;