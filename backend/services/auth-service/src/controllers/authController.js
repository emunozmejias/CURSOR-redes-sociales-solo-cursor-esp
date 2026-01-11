const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require(path.resolve(__dirname, '../../../..', 'shared/database/connection'));
const config = require(path.resolve(__dirname, '../../../..', 'shared/config'));

const register = async (req, res) => {
  try {
    console.log('[Auth Controller] 🔵 Iniciando registro de usuario');
    console.log('[Auth Controller] Datos recibidos:', { email: req.body?.email, username: req.body?.username, name: req.body?.name });
    
    const { email, username, password, name } = req.body;

    // Validaciones
    if (!email || !username || !password || !name) {
      console.log('[Auth Controller] ⚠️ Validación fallida - campos faltantes');
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    console.log('[Auth Controller] ✅ Validaciones pasadas, verificando usuario existente...');

    // Verificar si el usuario ya existe
    console.log('[Auth Controller] 🔍 Verificando si usuario existe en BD...');
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userExists.rows.length > 0) {
      console.log('[Auth Controller] ⚠️ Usuario ya existe');
      return res.status(400).json({ error: 'El email o username ya existe' });
    }
    
    console.log('[Auth Controller] ✅ Usuario no existe, creando hash de contraseña...');

    // Hash de la contraseña
    const saltRounds = 10;
    console.log('[Auth Controller] 🔐 Hasheando contraseña...');
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('[Auth Controller] ✅ Contraseña hasheada');

    // Crear usuario
    console.log('[Auth Controller] 💾 Insertando usuario en BD...');
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash, name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, name, created_at`,
      [email, username, passwordHash, name]
    );

    const user = result.rows[0];
    console.log('[Auth Controller] ✅ Usuario creado con ID:', user.id);

    // Generar JWT
    console.log('[Auth Controller] 🎫 Generando JWT...');
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    console.log('[Auth Controller] ✅ JWT generado');

    console.log('[Auth Controller] 📤 Enviando respuesta exitosa');
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name
      }
    });
  } catch (error) {
    console.error('[Auth Controller] ❌ ERROR en registro:');
    console.error('[Auth Controller] Mensaje:', error.message);
    console.error('[Auth Controller] Stack:', error.stack);
    console.error('[Auth Controller] Código:', error.code);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const result = await pool.query(
      'SELECT id, email, username, password_hash, name, bio, avatar FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const verify = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Obtener información completa del usuario desde la base de datos
    const result = await pool.query(
      'SELECT id, email, username, name, bio, avatar, cover_image, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ valid: false, error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    
    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        bio: user.bio || '',
        avatar: user.avatar,
        coverImage: user.cover_image,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Error en verify:', error);
    res.status(500).json({ valid: false, error: 'Error interno del servidor' });
  }
};

const refresh = async (req, res) => {
  // Implementar refresh token si es necesario
  res.status(501).json({ error: 'No implementado aún' });
};

module.exports = {
  register,
  login,
  verify,
  refresh
};
