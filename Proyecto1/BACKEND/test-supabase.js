const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Intentando conectar a Supabase...');
console.log('URL:', supabaseUrl ? 'Configurada' : 'No configurada');
console.log('Key:', supabaseKey ? 'Configurada' : 'No configurada');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL o SUPABASE_KEY no están configuradas en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Probar conexión listando tablas
supabase
  .from('_test_connection')
  .select('*')
  .then(({ data, error }) => {
    if (error) {
      // Error esperado si la tabla no existe, pero confirma que hay conexión
      if (error.code === '42P01') {
        console.log('✅ Conexión exitosa a Supabase (tabla de prueba no existe, pero conexión funciona)');
        process.exit(0);
      } else {
        console.error('❌ Error de conexión:', error.message);
        console.error('Código:', error.code);
        process.exit(1);
      }
    } else {
      console.log('✅ Conexión exitosa a Supabase');
      process.exit(0);
    }
  })
  .catch(err => {
    console.error('❌ Error inesperado:', err.message);
    process.exit(1);
  });
