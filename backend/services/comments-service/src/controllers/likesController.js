const path = require('path');
const pool = require(path.resolve(__dirname, '../../../..', 'shared/database/connection'));

const toggleLike = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;

    // Verificar que la publicación existe
    const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    // Verificar si ya existe el like
    const existingLike = await pool.query(
      'SELECT id FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    if (existingLike.rows.length > 0) {
      // Eliminar like
      await pool.query(
        'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );

      // Obtener nuevo conteo
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM likes WHERE post_id = $1',
        [postId]
      );

      return res.json({
        message: 'Like eliminado',
        liked: false,
        likesCount: parseInt(countResult.rows[0].count)
      });
    } else {
      // Crear like
      await pool.query(
        'INSERT INTO likes (post_id, user_id) VALUES ($1, $2)',
        [postId, userId]
      );

      // Obtener nuevo conteo
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM likes WHERE post_id = $1',
        [postId]
      );

      return res.json({
        message: 'Like agregado',
        liked: true,
        likesCount: parseInt(countResult.rows[0].count)
      });
    }
  } catch (error) {
    console.error('Error al toggle like:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const checkLike = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;

    const result = await pool.query(
      'SELECT id FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    res.json({
      liked: result.rows.length > 0
    });
  } catch (error) {
    console.error('Error al verificar like:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getLikesByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await pool.query(
      `SELECT 
        l.id, l.post_id, l.user_id, l.created_at,
        u.id as user_id, u.username, u.name, u.avatar
       FROM likes l
       JOIN users u ON l.user_id = u.id
       WHERE l.post_id = $1
       ORDER BY l.created_at DESC`,
      [postId]
    );

    const likes = result.rows.map(row => ({
      id: row.id,
      postId: row.post_id,
      userId: row.user_id,
      createdAt: row.created_at,
      user: {
        id: row.user_id,
        username: row.username,
        name: row.name,
        avatar: row.avatar
      }
    }));

    res.json({
      likes,
      count: likes.length
    });
  } catch (error) {
    console.error('Error al obtener likes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  toggleLike,
  checkLike,
  getLikesByPost
};
