const path = require('path');
const pool = require(path.resolve(__dirname, '../../../..', 'shared/database/connection'));

const createPost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { content, images } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'El contenido es requerido' });
    }

    const result = await pool.query(
      `INSERT INTO posts (user_id, content, images)
       VALUES ($1, $2, $3::jsonb)
       RETURNING id, user_id, content, images, created_at, updated_at`,
      [userId, content.trim(), JSON.stringify(images || [])]
    );

    // Obtener información del usuario
    const userResult = await pool.query(
      'SELECT id, username, name, avatar FROM users WHERE id = $1',
      [userId]
    );

    const post = result.rows[0];
    post.user = userResult.rows[0];

    res.status(201).json({
      message: 'Publicación creada exitosamente',
      post
    });
  } catch (error) {
    console.error('Error al crear publicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        p.id, p.user_id, p.content, p.images, p.created_at, p.updated_at,
        u.id as user_id, u.username, u.name, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM posts');
    const total = parseInt(countResult.rows[0].count);

    const posts = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      content: row.content,
      images: row.images || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        id: row.user_id,
        username: row.username,
        name: row.name,
        avatar: row.avatar
      },
      likesCount: parseInt(row.likes_count),
      commentsCount: parseInt(row.comments_count)
    }));

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        p.id, p.user_id, p.content, p.images, p.created_at, p.updated_at,
        u.id as user_id, u.username, u.name, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const row = result.rows[0];
    const post = {
      id: row.id,
      userId: row.user_id,
      content: row.content,
      images: row.images || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        id: row.user_id,
        username: row.username,
        name: row.name,
        avatar: row.avatar
      },
      likesCount: parseInt(row.likes_count),
      commentsCount: parseInt(row.comments_count)
    };

    res.json({ post });
  } catch (error) {
    console.error('Error al obtener publicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        p.id, p.user_id, p.content, p.images, p.created_at, p.updated_at,
        u.id as user_id, u.username, u.name, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM posts WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    const posts = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      content: row.content,
      images: row.images || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        id: row.user_id,
        username: row.username,
        name: row.name,
        avatar: row.avatar
      },
      likesCount: parseInt(row.likes_count),
      commentsCount: parseInt(row.comments_count)
    }));

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener publicaciones del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { content, images } = req.body;

    // Verificar que la publicación pertenece al usuario
    const postCheck = await pool.query(
      'SELECT user_id FROM posts WHERE id = $1',
      [id]
    );

    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    if (postCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para actualizar esta publicación' });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (content !== undefined) {
      if (content.trim().length === 0) {
        return res.status(400).json({ error: 'El contenido no puede estar vacío' });
      }
      updates.push(`content = $${paramCount++}`);
      values.push(content.trim());
    }

    if (images !== undefined) {
      updates.push(`images = $${paramCount++}::jsonb`);
      values.push(JSON.stringify(images));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE posts 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, user_id, content, images, created_at, updated_at
    `;

    const result = await pool.query(query, values);

    res.json({
      message: 'Publicación actualizada exitosamente',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar publicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verificar que la publicación pertenece al usuario
    const postCheck = await pool.query(
      'SELECT user_id FROM posts WHERE id = $1',
      [id]
    );

    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    if (postCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta publicación' });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [id]);

    res.json({ message: 'Publicación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByUser,
  updatePost,
  deletePost
};
