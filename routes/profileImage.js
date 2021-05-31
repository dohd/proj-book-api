const express = require('express');
const router = express.Router();
const ProfileImage = require('../controllers/ProfileImage');
const authRole = require('../middlewares/authRole');

router.post('/', authRole.isAdmin, ProfileImage.create);

router.get('/', ProfileImage.findOne);

module.exports = router;
