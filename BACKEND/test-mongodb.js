const mongoose = require('mongoose');

const uri = 'mongodb+srv://JorgePrograIA:Cokorita2020+@cluster0.bmwbrki.mongodb.net/?appName=Cluster0';

console.log('Intentando conectar a MongoDB Atlas...');

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Conexión exitosa a MongoDB Atlas');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err.message);
    console.error('Código de error:', err.code);
    process.exit(1);
  });
