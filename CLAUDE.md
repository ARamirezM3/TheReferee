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
    GroupScreen.jsx   → grupos reales + creación de grupos
    ProfileScreen.jsx → perfil y ajustes (datos reales desde Supabase)
    LoginScreen.jsx   → login con email/contraseña via Supabase Auth
    RegisterScreen.jsx → registro con foto opcional + insert en tabla usuarios
    WelcomeScreen.jsx → pantalla post-registro: pide peso, altura, fecha de nacimiento
public/images/
  logo.png                → logo para el menú lateral
  thereferee_bien.png     → árbitro estado ok (≤ 0.01 g/L)
  thereferee_amarilla.png → árbitro tarjeta amarilla (0.01–0.25 g/L)
  thereferee_roja.png     → árbitro tarjeta roja (> 0.25 g/L)

## Autenticación y base de datos

### Supabase Auth
- Login: `supabase.auth.signInWithPassword({ email, password })`
- Registro: `supabase.auth.signUp({ email, password })` → upload foto → insert en `usuarios` → `onRegistered(uid)` → WelcomeScreen
- Logout: `supabase.auth.signOut()` desde Configuración → Cerrar sesión
- Sin confirmación de email (desactivada en Supabase Dashboard)
- Estado de auth en App.jsx via `supabase.auth.onAuthStateChange`:
  - `undefined` → cargando (splash screen)
  - `null` → no autenticado (muestra LoginScreen o RegisterScreen)
  - `User` + `showWelcome=true` → muestra WelcomeScreen (solo tras registro nuevo)
  - `User` → autenticado (muestra app principal)
- `currentUser` se pasa como prop a todas las pantallas y paneles que acceden a Supabase

### Esquema de base de datos (Supabase / PostgreSQL)

```
usuarios (
  id               uuid PK → auth.users(id)
  created_at       timestamptz
  nombre           text
  email            text
  foto_perfil      text  (URL pública del bucket "avatars")
  peso             int2
  altura           int2
  fecha_nacimiento date
)
  RLS SELECT: USING (true) → cualquier usuario autenticado puede ver a todos los usuarios

grupos (
  id                  bigint IDENTITY PK
  created_at          timestamptz
  nombre              text
  creado_por          uuid → usuarios(id)
  fecha_creacion      date
  codigo_invitacion   text UNIQUE DEFAULT gen_random_uuid()::text
)
  RLS: creado_por = auth.uid()

tests (
  id          bigint IDENTITY PK
  created_at  timestamptz
  usuario_id  uuid → usuarios(id)
  valor_gl    numeric(4,2)
  fecha       date
  grupo_id    bigint → grupos(id)
)
  RLS: usuario_id = auth.uid()

amigos (
  id          bigint IDENTITY PK
  created_at  timestamptz
  usuario_id  uuid → usuarios(id)   ← quien envía la solicitud
  amigo_id    uuid → usuarios(id)   ← quien la recibe
  estado      text DEFAULT 'pendiente'  ('pendiente' | 'aceptado')
)
  RLS SELECT: usuario_id = auth.uid() OR amigo_id = auth.uid()
  RLS INSERT: usuario_id = auth.uid()
  RLS UPDATE: amigo_id = auth.uid()  (solo el receptor puede aceptar)
  RLS DELETE: amigo_id = auth.uid() OR usuario_id = auth.uid()

grupo_miembros (
  id          bigint IDENTITY PK
  created_at  timestamptz
  grupo_id    bigint → grupos(id)
  usuario_id  uuid → usuarios(id)
)
  RLS INSERT: usuario_id = auth.uid() OR creador del grupo puede añadir a otros

notificaciones (
  id            bigint IDENTITY PK
  created_at    timestamptz
  usuario_id    uuid → usuarios(id)    ← destinatario
  de_usuario_id uuid → usuarios(id)    ← remitente
  tipo          text                   ('solicitud_amistad' | 'amigos_aceptado')
  leida         boolean DEFAULT false
  mensaje       text
)
  RLS SELECT: usuario_id = auth.uid()
  RLS INSERT: WITH CHECK (true) → cualquier usuario autenticado puede insertar
  RLS UPDATE: usuario_id = auth.uid()
```

### Storage
- Bucket: `avatars` (público)
- Ruta de archivo: `{uid}.{ext}` (se sobreescribe con upsert al editar)
- Subida en RegisterScreen y en CambiarDatosPanel de ProfileScreen
- URL almacenada en `usuarios.foto_perfil`

### Avatares
En todos los sitios donde aparece un avatar:
- Si el usuario tiene `foto_perfil`: se muestra la imagen
- Si no: círculo de color determinista (`AVATAR_COLORS[id.charCodeAt(0) % 5]`) con la primera letra del nombre en blanco
- Colores disponibles: `["#3498db", "#e91e8c", "#e67e22", "#9b59b6", "#2ecc71"]`
- Mismo patrón en HomeScreen (PersonaCard), GroupScreen (UserAvatar), App.jsx (MiniAvatar), ProfileScreen

## Estado actual de las pantallas

### App.jsx
- Auth state con onAuthStateChange (3 estados: cargando / no-auth / autenticado)
- `showWelcome` state: si `true` y `currentUser` existe → muestra WelcomeScreen
- Menú lateral hamburger con paneles slide (z-52)
- Modo oscuro/claro global (clase `dark-mode` en phone-frame)
- Tamaño de fuente global (clase `font-small/large/xlarge` en phone-frame)
- `MiniAvatar` helper: componente de avatar reutilizable dentro de App.jsx
- Paneles globales (desde menú lateral):
  - **Historial**: datos reales de tabla `tests`; estadísticas (promedio, total, último), gráfico por hora, lista. Muestra "Aún no has hecho ningún test" si vacío
  - **Amigos**: datos reales de tabla `amigos` (estado='aceptado', ambas direcciones); vacío con mensaje hasta que haya amigos
  - **Calendario**: datos reales de tabla `tests`; vistas semana/mes/año; círculos azules con opacidad según nivel; hoy con borde azul; mensaje si sin datos
  - **Alcoholímetro**: imagen de producto + botones compra
  - **Boquillas**: imagen de producto + botón compra
  - **Notificaciones**: datos reales; solicitudes de amistad pendientes (acepta/rechaza); actividad (notificaciones de DB). Marcar como leídas al abrir
  - Configuración → sub-paneles (z-53):
    - Cambio de contraseña: 3 campos con toggle ojo + botón Aceptar
    - Visibilidad del perfil: 3 toggles funcionales
    - Bluetooth: icono SVG animado azul↔gris cada 1.5s
    - Cerrar sesión: llama a supabase.auth.signOut()

### WelcomeScreen
- Se muestra solo tras registro nuevo (controlado por `showWelcome` en App.jsx)
- Campos: peso (kg), altura (cm), fecha de nacimiento
- "Continuar": guarda en `usuarios` con UPDATE y pasa a la app
- "Omitir": pasa a la app sin guardar

### HomeScreen
- Círculo de resultado con color interpolado (verde→ámbar→rojo via lerpColor)
- Imagen del árbitro cambia según valor (bien/amarilla/roja)
- "Nuevo test" genera valor aleatorio y actualiza gráfico local (últimos 10, NO guarda en DB aún)
- Estado positivo/negativo: botones Uber/SOS vs. icono coche
- Buzón de notificaciones: icono con badge rojo (contador de no leídas desde DB). Al abrir, se resetea el contador localmente
- "Personas que quizás conozcas": usuarios reales excluyendo al usuario actual y amigos aceptados (ambas direcciones). Scroll horizontal con PersonaCard
- PersonaCard "Seguir": INSERT en `amigos` (estado='pendiente') + INSERT en `notificaciones` para el destinatario. Botón cambia a "Solicitado" tras enviar

### GroupScreen
- Carga grupos reales del usuario desde `grupo_miembros` + `grupos`
- Estado vacío (sin grupos): logo centrado + "Crea tu primer grupo" + botón
- Cuando hay grupos: selector dropdown de grupos, botón "+", menú "···"
- Al seleccionar grupo: carga miembros reales desde `grupo_miembros` + `usuarios`
- Sub-tabs copa/grupo con indicador deslizante
- Tab copa: ranking de miembros con barras de color (`getBarColor(value)` calculado en render), "Cargar test" actualiza valor local del usuario actual (simulado, no guarda en DB aún)
- Tab fotos: placeholder vacío
- `CrearGrupoModal`: nombre del grupo + búsqueda de usuarios + lista de amigos → INSERT en `grupos` y `grupo_miembros`

### ProfileScreen
- Datos reales desde tabla `usuarios` (nombre, email, foto_perfil, peso, altura, fecha_nacimiento)
- Avatar: foto de Supabase Storage o círculo de color + letra (sin SVG genérico)
- "Cambiar Datos": carga datos reales, guarda con UPDATE, sube foto al bucket con cache-busting local
- "Preferencias": slider fuente, selector idioma, toggle modo oscuro
- "Notificaciones": 7 toggles (estado local, no persistido aún)
- "Términos legales": panel deslizante con política de privacidad completa

### LoginScreen
- signInWithPassword, mensajes de error en español
- Campo contraseña: placeholder "Contraseña" en gris, icono ojo SVG (EyeIcon/EyeOffIcon) sin emojis

### RegisterScreen
- signUp + upload foto opcional a Storage + INSERT en tabla usuarios
- Prop `onRegistered(uid)`: llamada tras registro exitoso para activar WelcomeScreen en App.jsx
- Mensajes de error amigables incluyendo rate limit

## Diseño base
- Color primario: #7c3aed (morado)
- Fuentes: Black Han Sans (título) + Bebas Neue (valores numéricos) + Nunito (texto)
- Estilo: tarjetas blancas sobre fondo #f8f7ff
- Semáforo: verde #22c55e (< 0.25) → ámbar #ca8a04 (0.25–0.50) → rojo #ef4444 (> 0.50)

## Próximos pasos
- Guardar test real en tabla `tests` al pulsar "Nuevo test" (actualmente solo actualiza estado local)
- Persistir preferencias de notificaciones en Supabase
- Conexión con dispositivo Arduino/Bluetooth real
- Sistema de búsqueda de usuarios para hacer amigos (desde panel Amigos del menú lateral)
- Gestión de grupos: editar nombre, expulsar miembros, invitar por QR/enlace
