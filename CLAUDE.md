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
  components/
    Avatar.jsx        → componente Avatar reutilizable: { url, usuario, id, size }
  screens/
    HomeScreen.jsx    → pantalla principal del test
    GroupScreen.jsx   → grupos reales + creación + fotos
    ProfileScreen.jsx → perfil y ajustes (datos reales desde Supabase)
    LoginScreen.jsx   → login con email/contraseña via Supabase Auth
    RegisterScreen.jsx → registro con foto opcional + insert en tabla usuarios
    WelcomeScreen.jsx → pantalla post-registro: pide peso, altura, fecha de nacimiento
public/images/
  logo.png                → logo para el menú lateral
  barman.png              → distintivo de líder del grupo
  thereferee_bien.png     → árbitro estado ok (< 0.2 g/L)
  thereferee_amarilla.png → árbitro tarjeta amarilla (0.2–0.59 g/L)
  thereferee_roja.png     → árbitro tarjeta roja (≥ 0.6 g/L)

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
  - `User` → autenticado (muestra app principal, siempre en pestaña Inicio)
- `currentUser` se pasa como prop a todas las pantallas y paneles que acceden a Supabase
- Al recibir evento `SIGNED_IN` se resetea `activeTab` a "home"

### Esquema de base de datos (Supabase / PostgreSQL)

```
usuarios (
  id               uuid PK → auth.users(id)
  created_at       timestamptz
  usuario          varchar(30) UNIQUE  ← era "nombre", renombrado
  email            text
  foto_perfil      text  (URL pública del bucket "avatars")
  peso             int2
  altura           int2
  fecha_nacimiento date
)
  RLS SELECT: USING (true) → cualquier usuario autenticado puede ver a todos

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

fotos_grupo (
  id           bigint IDENTITY PK
  created_at   timestamptz
  grupo_id     bigint → grupos(id)
  usuario_id   uuid → usuarios(id)
  url          text  (URL pública del bucket "grupos-fotos")
  descripcion  text
)
  RLS SELECT: miembro autenticado puede ver
  RLS INSERT: solo el propio usuario (usuario_id = auth.uid())
```

### Storage
- Bucket: `avatars` (público) — avatares de usuario
  - Ruta: `{uid}.{ext}` (se sobreescribe con upsert al editar)
  - Políticas: SELECT público, INSERT/UPDATE para authenticated
- Bucket: `grupos-fotos` (público) — fotos de grupos
  - Ruta: `{grupo_id}/{uid}-{timestamp}.{ext}`
  - Políticas: SELECT público, INSERT/DELETE para authenticated
- URLs almacenadas en `usuarios.foto_perfil` y `fotos_grupo.url`

### Avatares (componente Avatar.jsx)
En todos los sitios donde aparece un avatar se usa el componente `Avatar`:
- Props: `{ url, usuario, id, size = 40 }`
- Si `url` existe → muestra la imagen
- Si no → círculo de color determinista (`AVATAR_COLORS[id.charCodeAt(0) % 5]`) con la primera letra de `usuario` en blanco
- Colores: `["#3498db", "#e91e8c", "#e67e22", "#9b59b6", "#2ecc71"]`
- También: `MiniAvatar` en App.jsx (interno), `UserAvatar` en GroupScreen (interno)

## Umbrales de alerta (g/L)
- **< 0.2** → verde → "Apto para conducir" + icono coche + árbitro_bien.png
- **0.2 – 0.59** → ámbar → "No apto para conducir" + botón Uber + árbitro_amarilla.png
- **≥ 0.6** → rojo → "Nivel peligroso" + botón 112 + árbitro_roja.png
- Los mismos umbrales se usan en `COLOR_STOPS` del círculo y `getBarColor` del ranking

## Estado actual de las pantallas

### App.jsx
- Auth state con onAuthStateChange: evento SIGNED_IN resetea tab a "home"
- `showWelcome` state: si `true` y `currentUser` existe → muestra WelcomeScreen
- Menú lateral hamburger con paneles slide (z-52)
- Modo oscuro/claro global
- Tamaño de fuente global
- `MiniAvatar({ userId, usuario, fotoPerfil, size })` — helper interno
- `UserProfileModal({ user, onClose })` — muestra perfil de un usuario (usuario, peso, altura, edad, fecha registro)
- `calcEdad(fechaNacimiento)` — helper de cálculo de edad
- Paneles globales:
  - **Historial**: datos reales de `tests`; estadísticas + gráfico + lista; vacío con mensaje
  - **Amigos**: datos reales; clic en amigo → `UserProfileModal`; búsqueda por `usuario`
  - **Calendario**: datos reales de `tests`; vistas semana/mes/año
  - **Alcoholímetro**: imagen + botones compra
  - **Boquillas**: imagen + botón compra
  - **Notificaciones**: solicitudes pendientes (acepta/rechaza); actividad; marcar leídas al abrir
  - Configuración → sub-paneles: cambio de contraseña, visibilidad perfil, Bluetooth, cerrar sesión

### WelcomeScreen
- Solo tras registro nuevo (controlado por `showWelcome`)
- Campos: peso, altura, fecha de nacimiento
- UPDATE en tabla `usuarios`

### HomeScreen
- Datos reales del usuario (usuario, peso, altura, edad calculada desde fecha_nacimiento)
- Círculo de resultado con color interpolado según umbrales nuevos
- Imagen del árbitro: bien <0.2, amarilla 0.2-0.59, roja ≥0.6
- 3 estados de status: negativo / no apto (+ Uber) / peligroso (+ 112)
- "Nuevo test" genera valor aleatorio (NO guarda en DB aún)
- Buzón con badge de notificaciones no leídas
- "Personas que quizás conozcas": excluye amigos aceptados Y solicitudes pendientes en AMBAS direcciones

### GroupScreen
- Carga grupos reales con `codigo_invitacion` y `creado_por`
- `isLeader = selectedGroup?.creado_por === currentUser?.id`
- Estado vacío: logo + "Crea tu primer grupo" + botón
- Tab copa: ranking con barras de color (getBarColor calculado en render)
  - Junto al líder: imagen barman.png como distintivo
  - Solo líder ve botón "+" y opciones "Añadir miembros" / "Código de invitación"
- `CrearGrupoModal`: crear grupo con nombre + buscar miembros
- `AñadirMiembrosModal`: solo buscar y añadir personas (sin crear grupo)
- Panel código de invitación: muestra los primeros 8 chars del UUID en mayúsculas
- Tab fotos: funcional
  - Upload a bucket `grupos-fotos` → insert en `fotos_grupo`
  - Muestra fotos con avatar+usuario del subidor y fecha

### ProfileScreen
- Datos reales: `usuario`, email, foto_perfil, peso, altura, fecha_nacimiento
- "Cambiar Datos": label "Usuario", validación máx 30 chars, guarda con UPDATE
- Avatar: foto o círculo de color + letra
- "Términos legales": política de privacidad completa

### LoginScreen
- signInWithPassword; errores en español
- Campo contraseña: placeholder "Contraseña", icono Eye/EyeOff SVG

### RegisterScreen
- signUp + upload foto opcional + INSERT en `usuarios`
- Campo "Usuario" (no "Nombre"): máx 30 chars, contador visible, EyeIcon/EyeOffIcon SVG
- Error "Este usuario ya está en uso" si viola constraint UNIQUE
- `onRegistered(uid)` → activa WelcomeScreen

## Diseño base
- Color primario: #7c3aed (morado)
- Fuentes: Black Han Sans (título) + Bebas Neue (valores numéricos) + Nunito (texto)
- Estilo: tarjetas blancas sobre fondo #f8f7ff

## Próximos pasos
- Guardar test real en tabla `tests` al pulsar "Nuevo test"
- Persistir preferencias de notificaciones en Supabase
- Conexión con dispositivo Arduino/Bluetooth real
- Sistema de búsqueda de usuarios para hacer amigos (desde panel Amigos)
- Gestión de grupos: editar nombre, expulsar miembros
- Perfil de usuario en miembros del grupo (igual que en AmigosPanel)
