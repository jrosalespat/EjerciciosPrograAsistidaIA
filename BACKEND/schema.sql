-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  rol TEXT DEFAULT 'usuario',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  fecha DATE NOT NULL,
  descripcion TEXT,
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) para seguridad
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (permitir todas las operaciones para simplificar)
CREATE POLICY "Permitir todo en usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);

-- Políticas para eventos (permitir todas las operaciones para simplificar)
CREATE POLICY "Permitir todo en eventos" ON eventos FOR ALL USING (true) WITH CHECK (true);
