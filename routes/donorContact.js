const express = require('express');
const router = express.Router();
const DonorContact = require('../controllers/DonorContact');

router.get('/', DonorContact.findAll);

router.post('/', DonorContact.create);

router.delete('/:id', DonorContact.delete);

router.patch('/:id', DonorContact.update);

module.exports = router;
