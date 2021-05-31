const express = require('express');
const router = express.Router();
const Auth = require('../controllers/Auth');

router.post('/register', Auth.register);

router.post('/login', Auth.login);

router.post('/reset-password', Auth.resetPassword);

router.delete('/logout/:id', Auth.logout);

router.get('/refresh-token', Auth.refreshToken);

module.exports = router;
