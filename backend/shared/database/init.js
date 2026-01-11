// Cargar variables de entorno ANTES de requerir cualquier otro módulo
const path = require('path');
const fs = require('fs');

// Cargar .env desde la raíz del backend
// __dirname es backend/shared/database, subimos 2 niveles para llegar a backend/
const envPath = path.resolve(__dirname, '../../.env');
const result = require('dotenv').config({ path: envPath });

if (result.error) {
  console.error('❌ No se pudo cargar .env desde:', envPath);
  console.error('   Error:', result.error.message);
  // Intentar cargar desde el directorio actual de trabajo como fallback
  require('dotenv').config();
}

// Ahora sí, cargar los módulos que dependen de las variables de entorno
const pool = require('./connection');

const initDatabase = async () => {
  try {
    console.log('🔄 Inicializando base de datos...');
    
    // Verificar que DATABASE_URL esté configurado y no sea un placeholder
    // Usar directamente process.env ya que dotenv ya lo cargó
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      console.error('\n❌ ERROR: DATABASE_URL no está configurado');
      console.error('   Por favor, edita el archivo backend/.env y agrega tu connection string de Neon.tech');
      console.error('   Ejemplo: DATABASE_URL=postgresql://usuario:password@host/dbname?sslmode=require');
      console.error('   Obtén tu connection string en: https://neon.tech/');
      throw new Error('DATABASE_URL no configurado');
    }
    
    // Verificar si es un placeholder
    if (dbUrl.includes('user:password@host/dbname') || 
        dbUrl === 'postgresql://user:password@host/dbname?sslmode=require') {
      console.error('\n❌ ERROR: DATABASE_URL tiene un valor placeholder');
      console.error('   Por favor, edita el archivo backend/.env y reemplaza el valor placeholder');
      console.error('   Ejemplo: DATABASE_URL=postgresql://usuario:password@host/dbname?sslmode=require');
      console.error('   Obtén tu connection string en: https://neon.tech/');
      throw new Error('DATABASE_URL tiene valor placeholder');
    }
    
    console.log('   Conectando a la base de datos...');
    
    // Leer el archivo schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Archivo schema.sql no encontrado en: ${schemaPath}`);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Ejecutar el schema
    console.log('   Ejecutando schema SQL...');
    await pool.query(schema);
    
    console.log('✅ Base de datos inicializada correctamente');
    console.log('   Tablas creadas: users, posts, likes, comments');
    console.log('   Índices creados');
    
    // Cerrar el pool de conexiones
    await pool.end();
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack.split('\n')[0]);
    }
    await pool.end().catch(() => {}); // Intentar cerrar el pool
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('\n✅ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Proceso falló:', error);
      process.exit(1);
    });
}

module.exports = initDatabase;
