const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');
const { authenticateToken } = require('./middleware/authMiddleware');

// Registro
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Verificar token
router.get('/verify', authenticateToken, authController.verify);

// Refresh token (opcional)
router.post('/refresh', authController.refresh);

module.exports = router;
