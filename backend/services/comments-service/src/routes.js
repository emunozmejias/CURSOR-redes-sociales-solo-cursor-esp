const express = require('express');
const router = express.Router();
const commentsController = require('./controllers/commentsController');
const likesController = require('./controllers/likesController');
const { authenticateToken } = require('./middleware/authMiddleware');

// ========== RUTAS DE COMENTARIOS ==========
// Crear comentario
router.post('/post/:postId', authenticateToken, commentsController.createComment);

// Obtener comentarios de una publicación
router.get('/post/:postId', commentsController.getCommentsByPost);

// Actualizar comentario
router.put('/:id', authenticateToken, commentsController.updateComment);

// Eliminar comentario
router.delete('/:id', authenticateToken, commentsController.deleteComment);

// ========== RUTAS DE LIKES ==========
// Dar like o quitar like
router.post('/post/:postId/like', authenticateToken, likesController.toggleLike);

// Verificar si el usuario dio like
router.get('/post/:postId/like', authenticateToken, likesController.checkLike);

// Obtener todos los likes de una publicación
router.get('/post/:postId/likes', likesController.getLikesByPost);

module.exports = router;
