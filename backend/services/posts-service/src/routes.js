const express = require('express');
const router = express.Router();
const postsController = require('./controllers/postsController');
const { authenticateToken } = require('./middleware/authMiddleware');

// Crear nueva publicación
router.post('/', authenticateToken, postsController.createPost);

// Obtener todas las publicaciones (feed)
router.get('/', postsController.getAllPosts);

// Obtener publicación por ID
router.get('/:id', postsController.getPostById);

// Obtener publicaciones de un usuario
router.get('/user/:userId', postsController.getPostsByUser);

// Actualizar publicación
router.put('/:id', authenticateToken, postsController.updatePost);

// Eliminar publicación
router.delete('/:id', authenticateToken, postsController.deletePost);

module.exports = router;
