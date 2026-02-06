const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const { googleLogin } = require('../controllers/googleAuth.controller');

const router = express.Router();

// local auth
router.post('/register', register);
router.post('/login', login);

// google auth
router.post('/google', googleLogin);

module.exports = router;
