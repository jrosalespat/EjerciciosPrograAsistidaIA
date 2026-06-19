# Agenda Diaria - Backend y Frontend

Aplicación sencilla de agenda diaria para probar el flujo entre backend y frontend.

## Estructura

- **BACKEND**: NodeJS con Express
- **FRONTEND**: JavaScript plano + Tailwind CSS
- Sin base de datos (almacenamiento en memoria)

## Instrucciones

### 1. Iniciar el Backend

```bash
cd BACKEND
npm install
npm start
```

El servidor correrá en `http://localhost:3000`

### 2. Abrir el Frontend

Abre el archivo `FRONTEND/index.html` directamente en tu navegador.

## Funcionalidades

- ✅ Crear eventos (título, fecha, descripción)
- ✅ Ver lista de eventos
- ✅ Eliminar eventos
- ✅ CRUD completo vía API REST

## Endpoints del Backend

- `GET /api/eventos` - Obtener todos los eventos
- `GET /api/eventos/:id` - Obtener un evento específico
- `POST /api/eventos` - Crear nuevo evento
- `PUT /api/eventos/:id` - Actualizar evento
- `DELETE /api/eventos/:id` - Eliminar evento
