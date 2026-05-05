# TheReferee — Alcoholímetro Social

## Descripción
App móvil de alcoholímetro social. El usuario realiza un test 
y ve su nivel de alcohol en tiempo real. Puede compararse con 
amigos en un grupo y ver el historial de tests.

## Stack técnico
- React 18 + Vite
- Recharts (gráficos)
- CSS puro con variables (sin Tailwind)
- Mobile-first, ancho máximo 390px simulando pantalla de móvil

## Estructura
src/
  App.jsx          → navegación entre pantallas + bottom nav + menú lateral global
  index.css        → todos los estilos globales
  screens/
    HomeScreen.jsx → pantalla principal del test
    GroupScreen.jsx → lista social de participantes  
    ProfileScreen.jsx → perfil y ajustes
public/images/
  logo.png                → logo para el menú lateral
  thereferee_bien.png     → árbitro estado ok (≤ 0.01 g/L)
  thereferee_amarilla.png → árbitro tarjeta amarilla (0.01–0.25 g/L)
  thereferee_roja.png     → árbitro tarjeta roja (> 0.25 g/L)

## Estado actual
- UI completamente implementada (3 pantallas)
- Animaciones de transición entre pantallas (fade + slide)
- Modo oscuro/claro: toggle global desde menú lateral, aplica clase `dark-mode` al phone-frame
- Menú lateral global (hamburger): slide-in panel, cada opción abre un panel full-screen (slide desde la derecha, 0.25s ease-out)
- HomeScreen:
  - Círculo de resultado con color interpolado dinámicamente (verde → ámbar → rojo)
  - Imagen del árbitro cambia según valor (bien / amarilla / roja)
  - Animación de entrada del círculo en cada test; pulso si valor > 0.60 g/L
  - "Nuevo test" genera valor aleatorio y actualiza el gráfico (últimos 10 tests)
  - Estado positivo/negativo con UI diferenciada (botones Uber/SOS vs. icono coche)
  - Buzón de notificaciones en la tarjeta de usuario (icono de sobre → panel con solicitudes de amistad + actividad)
  - Sección "Personas que quizás conozcas": scroll horizontal con 5 tarjetas de perfil + botón Seguir
- GroupScreen:
  - Selector de evento (dropdown) + botón "+" para crear evento + menú "···" con opciones (Administrar, Añadir miembros, Invitar)
  - Sub-tabs copa (28px) / grupo (iniciales "GR") con indicador deslizante animado
  - Tab copa: ranking de participantes con barras de color, "Cargar test" actualiza a Carlos (horas en formato 24h)
  - Tab fotos: placeholder vacío
- Paneles del menú lateral (slide desde la derecha):
  - Historial: resumen estadístico + gráfico de barras por hora + lista de últimos 8 tests
  - Amigos: barra de búsqueda + lista vertical de 6 amigos con avatar, nombre y flecha ›
  - Calendario: selector semana/mes/año; círculos azules con opacidad por nivel (0.15/0.45/0.75/1.0); día actual con borde azul fino
  - Alcoholímetro: imagen de producto + botones "Ver especificaciones" y "Comprar · 18,99 €"
  - Boquillas: imagen de producto + precio destacado + botón "Comprar · 3,99 €"
  - Configuración: Cambio de contraseña / Visibilidad del perfil / Bluetooth / Cerrar sesión; cada opción abre sub-panel (z-index 53)
    - Cambio de contraseña: 3 campos password con toggle ojo + botón Aceptar
    - Visibilidad del perfil: 3 toggles funcionales
    - Bluetooth: icono SVG animado azul↔gris 1.5s + texto de sincronización
- ProfileScreen:
  - Avatar SVG (o imagen elegida por usuario) + secciones de menú
  - "Cambiar Datos" abre panel con avatar editable (input file), campos nombre/fecha/peso/altura + Guardar
  - "Preferencias": slider tamaño fuente (4 posiciones), selector idioma Español/English, toggle modo oscuro
  - "Notificaciones": 7 toggles de preferencias de notificación funcionales
  - Tamaño de fuente aplica clase font-small/large/xlarge en phone-frame con CSS custom property --base-font-size
- Sin lógica real de backend ni conexión Arduino todavía

## Diseño base
- Color primario: #7c3aed (morado)
- Fuentes: Black Han Sans (título header) + Bebas Neue (valores) + Nunito (texto)
- Estilo: mobile-first, tarjetas blancas sobre fondo #f8f7ff
- Colores de resultado (semáforo interpolado):
  - verde #22c55e → ámbar #ca8a04 (AA contrast) → rojo #ef4444
  - verde < 0.25, ámbar 0.25–0.50, rojo > 0.50

## Próximos pasos
- Sistema de usuarios y autenticación
- Base de datos para historial de tests
- Interfaz visual de todos los botones
- Sistema social, solicitudes de amistad, buzon, visualización de otros perfiles