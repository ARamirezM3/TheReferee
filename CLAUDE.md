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
- ProfileScreen:
  - Avatar SVG + secciones de menú (Cambiar nombre, Preferencias, Notificaciones, Valora la app, Términos legales)
  - Eliminadas "Accesibilidad" y "Seguridad y privacidad" (movidas a panel Configuración)
- Paneles del menú lateral (slide desde la derecha):
  - Historial: resumen estadístico + gráfico de barras por hora + lista de últimos 8 tests
  - Calendario: selector semana/mes/año, días con tests coloreados por valor, día actual en morado
  - Alcoholímetro: imagen de producto + botones "Ver especificaciones" y "Comprar · 18,99 €"
  - Boquillas: imagen de producto + precio destacado + botón "Comprar · 3,99 €"
  - Configuración: lista de ajustes + "Cerrar sesión" en rojo
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