const express = require('express');
const router = express.Router();
const users = require('../controllers/users');

router.post('/signup', users.createUser);

router.post('/login', users.userLogin);

module.exports = router;