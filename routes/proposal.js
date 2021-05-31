const express = require('express');
const router = express.Router();
const Proposal = require('../controllers/Proposal');

router.get('/', Proposal.findAll);

router.post('/', Proposal.create);

router.patch('/:id', Proposal.update);

router.delete('/:id', Proposal.delete);

module.exports = router;