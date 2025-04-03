// Route de connexion
const express = require('express');
const router = express.Router();
const { login } = require('../controllers/auth');

router.post('/login', login); // POST /api/auth/login

module.exports = router;