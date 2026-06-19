require('dotenv').config();

console.log('=== Variables de entorno cargadas ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.substring(0, 20) + '...' : 'No configurada');
console.log('=====================================');
