const express = require('express');
const router = express.Router();
const Auth = require('../controllers/Auth');
const { verifyAccessToken } = require('../utils/JWT');

router.post('/register', Auth.register);

router.post('/login', Auth.login);

router.post('/recover-password', Auth.recoverPassword);

router.post('/recovery-password', Auth.recoveryPassword);

router.delete('/logout/:id', Auth.logout);

router.post('/reset-password', verifyAccessToken, Auth.resetPassword);

router.get('/refresh-token', Auth.refreshToken);

module.exports = router;
