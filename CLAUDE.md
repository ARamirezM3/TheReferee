# TheReferee — Alcoholímetro Social

## Descripción
App móvil de alcoholímetro social. El usuario realiza un test 
y ve su nivel de alcohol en tiempo real. Puede compararse con 
amigos en un grupo y ver el historial de tests.

## Stack técnico
- React 18 + Vite
- Supabase (Auth + PostgreSQL + Storage)
- Recharts (gráficos)
- CSS puro con variables (sin Tailwind)
- Mobile-first, ancho máximo 390px simulando pantalla de móvil

## Estructura
src/
  App.jsx             → navegación + auth state + menú lateral + paneles globales
  supabase.js         → cliente Supabase (URL + anon key)
  index.css           → todos los estilos globales
  screens/
    HomeScreen.jsx    → pantalla principal del test
    GroupScreen.jsx   → lista social de participantes
    ProfileScreen.jsx → perfil y ajustes (datos reales desde Supabase)
    LoginScreen.jsx   → login con email/contraseña via Supabase Auth
    RegisterScreen.jsx → registro con foto opcional + insert en tabla usuarios
public/images/
  logo.png                → logo para el menú lateral
  thereferee_bien.png     → árbitro estado ok (≤ 0.01 g/L)
  thereferee_amarilla.png → árbitro tarjeta amarilla (0.01–0.25 g/L)
  thereferee_roja.png     → árbitro tarjeta roja (> 0.25 g/L)

## Autenticación y base de datos

### Supabase Auth
- Login: `supabase.auth.signInWithPassword({ email, password })`
- Registro: `supabase.auth.signUp({ email, password })` → luego insert en `usuarios`
- Logout: `supabase.auth.signOut()` desde Configuración → Cerrar sesión
- Estado de auth en App.jsx via `supabase.auth.onAuthStateChange`:
  - `undefined` → cargando (splash screen)
  - `null` → no autenticado (muestra LoginScreen o RegisterScreen)
  - `User` → autenticado (muestra app principal)
- `currentUser` se pasa como prop a ProfileScreen para fetch de datos

### Esquema de base de datos (Supabase / PostgreSQL)
Todas las tablas tienen RLS activado con políticas "cada usuario solo ve y edita sus propios datos".

```
usuarios (
  id               uuid PK → auth.users(id)   ← clave para RLS: auth.uid() = id
  created_at       timestamptz
  nombre           text
  email            text
  foto_perfil      text  (URL pública del bucket "avatars")
  peso             int2
  altura           int2
  fecha_nacimiento date
)

grupos (
  id             bigint IDENTITY PK
  created_at     timestamptz
  nombre         text
  creado_por     uuid → usuarios(id)           ← RLS: auth.uid() = creado_por
  fecha_creacion date
)

tests (
  id          bigint IDENTITY PK
  created_at  timestamptz
  usuario_id  uuid → usuarios(id)              ← RLS: auth.uid() = usuario_id
  valor_gl    numeric(4,2)
  fecha       date
  grupo_id    bigint → grupos(id)
)

amigos (
  id          bigint IDENTITY PK
  created_at  timestamptz
  usuario_id  uuid → usuarios(id)              ← RLS: auth.uid() = usuario_id
  amigo_id    uuid → usuarios(id)
)

grupo_miembros (
  id          bigint IDENTITY PK
  created_at  timestamptz
  grupo_id    bigint → grupos(id)
  usuario_id  uuid → usuarios(id)              ← RLS: auth.uid() = usuario_id
)
```

### Storage
- Bucket: `avatars` (público)
- Ruta de archivo: `{uid}.{ext}`
- Subida en RegisterScreen y en CambiarDatosPanel de ProfileScreen

## Estado actual de las pantallas

### App.jsx
- Auth state con onAuthStateChange (3 estados: cargando / no-auth / autenticado)
- Menú lateral hamburger con paneles slide (z-52)
- Modo oscuro/claro global (clase `dark-mode` en phone-frame)
- Tamaño de fuente global (clase `font-small/large/xlarge` en phone-frame, CSS var `--base-font-size`)
- Paneles globales (desde menú lateral):
  - Historial: estadísticas mock + gráfico de barras por hora + lista de tests
  - Amigos: barra de búsqueda + lista de amigos (mock)
  - Calendario: vistas semana/mes/año; círculos azules con opacidad según nivel (0.15/0.45/0.75/1.0); hoy con borde azul fino
  - Alcoholímetro: imagen de producto + botones compra
  - Boquillas: imagen de producto + botón compra
  - Configuración → sub-paneles (z-53):
    - Cambio de contraseña: 3 campos con toggle ojo + botón Aceptar
    - Visibilidad del perfil: 3 toggles funcionales
    - Bluetooth: icono SVG animado azul↔gris cada 1.5s
    - Cerrar sesión: llama a supabase.auth.signOut()

### HomeScreen
- Círculo de resultado con color interpolado (verde→ámbar→rojo)
- Imagen del árbitro cambia según valor (bien/amarilla/roja)
- "Nuevo test" genera valor aleatorio y actualiza gráfico (últimos 10)
- Estado positivo/negativo: botones Uber/SOS vs. icono coche
- Buzón de notificaciones: solicitudes de amistad + actividad (mock)
- "Personas que quizás conozcas": scroll horizontal, 5 tarjetas + botón Seguir (mock)

### GroupScreen
- Selector de evento (dropdown) + botón "+" + menú "···"
- Sub-tabs copa/grupo con indicador deslizante animado
- Tab copa: ranking con barras de color, "Cargar test" actualiza datos (mock)
- Tab fotos: placeholder vacío

### ProfileScreen
- Datos reales desde tabla `usuarios` (nombre, email, foto_perfil)
- Avatar: imagen de Supabase Storage o SVG por defecto
- "Cambiar Datos": carga datos reales de Supabase, guarda con UPDATE, sube foto al bucket
- "Preferencias": slider fuente, selector idioma, toggle modo oscuro
- "Notificaciones": 7 toggles (estado local, no persistido aún)

### LoginScreen / RegisterScreen
- Login: signInWithPassword, mensajes de error en español
- Registro: signUp + upload foto opcional a Storage + insert en tabla usuarios
- Sin confirmación de email (desactivada en Supabase Dashboard)

## Diseño base
- Color primario: #7c3aed (morado)
- Fuentes: Black Han Sans (título) + Bebas Neue (valores numéricos) + Nunito (texto)
- Estilo: tarjetas blancas sobre fondo #f8f7ff
- Semáforo: verde #22c55e (< 0.25) → ámbar #ca8a04 (0.25–0.50) → rojo #ef4444 (> 0.50)

## Próximos pasos
- Conectar historial de tests a tabla `tests` (guardar test real al pulsar "Nuevo test")
- Conectar amigos a tabla `amigos` (búsqueda, solicitudes, aceptar/rechazar)
- Conectar grupos a tablas `grupos` y `grupo_miembros`
- Persistir preferencias de notificaciones en Supabase
- Conexión con dispositivo Arduino/Bluetooth real
