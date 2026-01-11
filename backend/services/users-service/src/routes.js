const express = require('express');
const router = express.Router();
const usersController = require('./controllers/usersController');
const { authenticateToken } = require('./middleware/authMiddleware');

// Obtener perfil del usuario autenticado
router.get('/me', authenticateToken, usersController.getMe);

// Obtener usuario por ID
router.get('/:id', usersController.getUserById);

// Actualizar perfil del usuario autenticado
router.put('/me', authenticateToken, usersController.updateMe);

// Obtener todos los usuarios (paginado)
router.get('/', usersController.getAllUsers);

module.exports = router;
