const express = require('express');
const router = express.Router();
const Donor = require('../controllers/Donor');

router.get('/', Donor.findAll);

router.post('/', Donor.create);

router.delete('/:id', Donor.delete);

router.patch('/:id', Donor.update);

module.exports = router;