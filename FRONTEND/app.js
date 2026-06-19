// Detectar si estamos en desarrollo o producción
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// En producción, usar la URL del backend (debes configurarla manualmente)
// En desarrollo, usar localhost
const BACKEND_URL = isProduction 
  ? 'https://ejerciciosprograasistidaia-1.onrender.com'
  : 'http://localhost:3000';

const API_URL = `${BACKEND_URL}/api/eventos`;
const AUTH_URL = `${BACKEND_URL}/api/auth`;

let token = localStorage.getItem('token');
let usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

// Verificar si hay sesión activa al cargar
document.addEventListener('DOMContentLoaded', () => {
  if (token && usuario) {
    mostrarAppPrincipal();
    cargarEventos();
  } else {
    mostrarModalAuth();
  }

  // Event listeners para formularios de autenticación
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
  document.getElementById('eventoForm').addEventListener('submit', handleAgregarEvento);
});

// Funciones de UI para autenticación
function mostrarModalAuth() {
  document.getElementById('authModal').classList.remove('hidden');
  document.getElementById('mainApp').classList.add('hidden');
}

function mostrarAppPrincipal() {
  document.getElementById('authModal').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  document.getElementById('userInfo').textContent = `Hola, ${usuario.nombre}`;
}

function mostrarLogin() {
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('authTitle').textContent = 'Iniciar Sesión';
}

function mostrarRegistro() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
  document.getElementById('authTitle').textContent = 'Registrarse';
}

function cerrarModal() {
  // No permitir cerrar el modal si no hay sesión
  if (!token) {
    alert('Debes iniciar sesión para usar la aplicación');
    return;
  }
}

// Manejar login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      token = data.token;
      usuario = data.usuario;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      mostrarAppPrincipal();
      cargarEventos();
    } else {
      alert(data.mensaje || 'Error al iniciar sesión');
    }
  } catch (error) {
    console.error('Error al hacer login:', error);
    alert('Error al conectar con el servidor');
  }
}

// Manejar registro
async function handleRegister(e) {
  e.preventDefault();
  
  const nombre = document.getElementById('registerNombre').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  try {
    const response = await fetch(`${AUTH_URL}/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre, email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      token = data.token;
      usuario = data.usuario;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      mostrarAppPrincipal();
      cargarEventos();
    } else {
      alert(data.mensaje || 'Error al registrar usuario');
    }
  } catch (error) {
    console.error('Error al registrar:', error);
    alert('Error al conectar con el servidor');
  }
}

// Logout
function logout() {
  token = null;
  usuario = null;
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  mostrarModalAuth();
  mostrarLogin();
  document.getElementById('loginForm').reset();
  document.getElementById('registerForm').reset();
}

// Manejar agregar evento
async function handleAgregarEvento(e) {
  e.preventDefault();
  
  const titulo = document.getElementById('titulo').value;
  const fecha = document.getElementById('fecha').value;
  const descripcion = document.getElementById('descripcion').value;
  const latitud = document.getElementById('latitud').value;
  const longitud = document.getElementById('longitud').value;
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ titulo, fecha, descripcion, latitud, longitud })
    });
    
    if (response.ok) {
      document.getElementById('eventoForm').reset();
      cargarEventos();
    }
  } catch (error) {
    console.error('Error al agregar evento:', error);
  }
}

// Cargar todos los eventos
async function cargarEventos() {
  try {
    const response = await fetch(API_URL);
    const eventos = await response.json();
    mostrarEventos(eventos);
  } catch (error) {
    console.error('Error al cargar eventos:', error);
    document.getElementById('eventosList').innerHTML = 
      '<p class="text-red-500 text-center">Error al cargar eventos</p>';
  }
}

// Mostrar eventos en el DOM
function mostrarEventos(eventos) {
  const lista = document.getElementById('eventosList');
  
  if (eventos.length === 0) {
    lista.innerHTML = '<p class="text-gray-500 text-center">No hay eventos</p>';
    return;
  }
  
  lista.innerHTML = eventos.map(evento => `
    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-800">${evento.titulo}</h3>
          <p class="text-sm text-gray-500">📅 ${evento.fecha}</p>
          ${evento.descripcion ? `<p class="text-gray-600 mt-2">${evento.descripcion}</p>` : ''}
        </div>
        <div class="flex gap-2 ml-4">
          <button onclick="eliminarEvento('${evento.id}')" 
            class="text-red-500 hover:text-red-700 transition">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Eliminar evento
async function eliminarEvento(id) {
  if (!confirm('¿Estás seguro de eliminar este evento?')) return;
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      cargarEventos();
    }
  } catch (error) {
    console.error('Error al eliminar evento:', error);
  }
}

// Variables para el mapa
let map = null;
let marker = null;

// Event listener para el botón de obtener ubicación
document.getElementById('obtenerUbicacion').addEventListener('click', obtenerUbicacion);

// Función para obtener ubicación del navegador
function obtenerUbicacion() {
  const status = document.getElementById('ubicacionStatus');
  const mapaDiv = document.getElementById('mapa');
  
  if (!navigator.geolocation) {
    status.textContent = 'Tu navegador no soporta geolocalización';
    return;
  }
  
  status.textContent = 'Obteniendo tu ubicación...';
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      // Guardar coordenadas en campos ocultos
      document.getElementById('latitud').value = lat;
      document.getElementById('longitud').value = lng;
      
      status.textContent = `Ubicación obtenida: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
      // Mostrar mapa con marcador
      mostrarMapa(lat, lng);
    },
    (error) => {
      switch(error.code) {
        case error.PERMISSION_DENIED:
          status.textContent = 'Permiso de ubicación denegado por el usuario';
          break;
        case error.POSITION_UNAVAILABLE:
          status.textContent = 'Información de ubicación no disponible';
          break;
        case error.TIMEOUT:
          status.textContent = 'Tiempo de espera agotado';
          break;
        default:
          status.textContent = 'Error al obtener ubicación';
      }
    }
  );
}

// Función para mostrar el mapa con marcador
function mostrarMapa(lat, lng) {
  const mapaDiv = document.getElementById('mapa');
  mapaDiv.style.display = 'block';
  
  // Si el mapa ya existe, actualizarlo
  if (map) {
    map.setView([lat, lng], 13);
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng]).addTo(map);
    }
    return;
  }
  
  // Crear nuevo mapa
  map = L.map('mapa').setView([lat, lng], 13);
  
  // Agregar capa de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  // Agregar marcador
  marker = L.marker([lat, lng]).addTo(map)
    .bindPopup('Tu ubicación')
    .openPopup();
}
