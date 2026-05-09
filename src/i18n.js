export const TRANSLATIONS = {
  es: {
    locale: "es-ES",
    // Nav
    tabHome: "Inicio", tabGroup: "Grupo", tabProfile: "Perfil",
    // Side menu
    menuDarkMode: "🌙 Modo oscuro", menuLightMode: "☀️ Modo claro",
    menuHistory: "Historial", menuFriends: "Amigos", menuCalendar: "Calendario",
    menuBreathalyzer: "Alcoholímetro", menuMouthpieces: "Boquillas", menuSettings: "Configuración",
    // Common
    loading: "Cargando...", searching: "Buscando...", accept: "Aceptar", reject: "Rechazar",
    add: "Añadir", remove: "Quitar", save: "Guardar", cancel: "Cancelar",
    // UserProfileModal
    profile: "Perfil", weightLabel: "Peso", heightLabel: "Altura", ageLabel: "Edad",
    memberSince: "En la app desde",
    // NotificacionesPanel
    notifications: "Notificaciones", friendRequests: "Solicitudes de amistad",
    noPendingRequests: "No hay solicitudes pendientes", activity: "Actividad",
    noRecentActivity: "No hay actividad reciente",
    // HistorialPanel
    history: "Historial", summary: "Resumen", average: "Promedio",
    totalTests: "Total de tests", lastTest: "Último test",
    testsByHour: "Tests por hora del día", latestTests: "Últimos tests",
    noTestsYet: "Aún no has hecho ningún test", tests: "tests",
    // AmigosPanel
    friends: "Amigos", searchFriends: "Buscar amigos...",
    noFriendsYet: "Aún no tienes amigos", noResults: "No se encontraron resultados",
    // CalendarioPanel
    calendar: "Calendario", weekView: "Semana", monthView: "Mes", yearView: "Año",
    noTestsRecorded: "Aún no hay tests registrados",
    weekDays: ["L","M","X","J","V","S","D"],
    // Alcoholímetro
    breathalyzer: "Alcoholímetro", breathalyzerProductName: "Alcoholímetro TheReferee",
    viewSpecs: "Ver especificaciones", buy: "Comprar · 18,99 €",
    // Boquillas
    mouthpieces: "Boquillas", mouthpiecePack: "Pack de 12 boquillas", buyMouthpieces: "Comprar · 3,99 €",
    // Settings
    settings: "Configuración", changePassword: "Cambio de contraseña",
    profileVisibility: "Visibilidad del perfil", bluetooth: "Bluetooth", signOut: "Cerrar sesión",
    currentPassword: "Contraseña actual", newPasswordLabel: "Nueva contraseña",
    confirmNewPassword: "Confirmar nueva contraseña",
    syncingDevice: "Sincronizando dispositivo...",
    ensureDevice1: "Asegúrate de que el alcoholímetro", ensureDevice2: "está encendido y cerca",
    appearInSuggestions: "Aparecer en sugerencias de amigos de amigos",
    showPhotosToMembers: "Mostrar fotos a miembros de mis grupos",
    profilePicVisible: "Foto de perfil visible para no amigos",
    // HomeScreen
    userLabel: "Usuario:", ageLabel2: "Edad:", weightLabel2: "Peso:", heightLabel2: "Altura:",
    years: "años", kg: "kg", cm: "cm",
    fitToDrive: "Apto para conducir", negativeResult: "Has dado negativo",
    notFitToDrive: "No apto para conducir", notFitToDriveCaps: "NO APTO PARA CONDUCIR",
    dangerousLevel: "Nivel peligroso", dangerousLevelCaps: "NIVEL PELIGROSO",
    callUberLogo: "UBER", callUberBtn: "Llamar", callEmergency: "Llamar al 112",
    waitTime: "Tiempo de espera", soberDays: "Días sin beber",
    testXAxis: "Test nº", newTest: "Nuevo test",
    peopleYouMayKnow: "Personas que quizás conozcas", noUsersAvailable: "No hay usuarios disponibles",
    requested: "Solicitado", follow: "Seguir",
    shareDirect: "Compartir resultado", shareViaWhatsApp: "WhatsApp", shareViaInstagram: "Instagram",
    shareStateOk: "Apto para conducir", shareStateWarning: "No apto para conducir",
    shareStateDanger: "Nivel peligroso", shareTextPrefix: "He hecho un test con TheReferee:",
    // GroupScreen
    createFirstGroup: "Crea tu primer grupo", createGroupBtn: "+ Crear grupo",
    joinGroupBtn: "Unirse a grupo", joinGroupTitle: "Unirse a un grupo",
    enterInviteCode: "Introduce el código de invitación",
    joinBtn: "Unirse", joiningBtn: "Uniéndose...", invalidCode: "Código no válido",
    selectGroup: "Seleccionar grupo", createdLabel: "Creado:", paysUber: "paga el Uber",
    loadTest: "Cargar test", noMembers: "No hay miembros en este grupo",
    groupNameLabel: "Nombre del grupo", addMembersTitle: "Añadir miembros",
    searchByUser: "Buscar por usuario...", creatingGroup: "Creando...",
    yourFriends: "Tus amigos", nonMembers: "Tus amigos (no miembros)",
    useSearchAdd: "Usa el buscador para añadir miembros",
    useSearchFind: "Usa el buscador para encontrar usuarios",
    createGroupAction: "Crear grupo", inviteCode: "Código de invitación",
    shareCodeMsg: "Comparte este código con tus amigos\npara que se unan al grupo",
    uploadPhoto: "+ Subir foto", uploadingPhoto: "Subiendo...",
    loadingPhotos: "Cargando fotos...", noPhotosYet: "Aún no hay fotos en este grupo",
    searchResults: "Resultados", manageGroup: "Administrar grupo",
    changeGroupImage: "Cambiar imagen del grupo", addingMembers: "Añadiendo...",
    membersSelected: "miembro seleccionado", membersSelectedPlural: "miembros seleccionados",
    errorCreatingGroup: "Error al crear el grupo:",
    // ProfileScreen
    myData: "Mis datos", usernameField: "Usuario", birthDateField: "Fecha de nacimiento",
    weightField: "Peso (kg)", heightField: "Altura (cm)",
    saveChanges: "Guardar cambios", saving: "Guardando...", preferences: "Preferencias",
    fontSizeLabel: "Tamaño de fuente", fontSmall: "Pequeño", fontNormal: "Normal",
    fontLarge: "Grande", fontXlarge: "Muy grande", languageLabel: "Idioma",
    appearanceLabel: "Apariencia", darkModeLabel: "Modo oscuro",
    notifSettings: "Notificaciones", legalTerms: "Términos legales", editData: "Cambiar Datos",
    errorSaving: "Error al guardar. Inténtalo de nuevo.",
    // Notif preferences
    notifFriendRequest: "Solicitudes de amistad", notifAccepted: "Solicitudes aceptadas",
    notifGroup: "Añadido a un grupo", notifNewTest: "Nuevo test en un grupo",
    notifReminder: "Recordatorios de tomar test", notifPhoto: "Nueva foto en un grupo",
    notifNewPerson: "Nueva persona añadida al grupo",
  },
  en: {
    locale: "en-US",
    // Nav
    tabHome: "Home", tabGroup: "Group", tabProfile: "Profile",
    // Side menu
    menuDarkMode: "🌙 Dark mode", menuLightMode: "☀️ Light mode",
    menuHistory: "History", menuFriends: "Friends", menuCalendar: "Calendar",
    menuBreathalyzer: "Breathalyzer", menuMouthpieces: "Mouthpieces", menuSettings: "Settings",
    // Common
    loading: "Loading...", searching: "Searching...", accept: "Accept", reject: "Reject",
    add: "Add", remove: "Remove", save: "Save", cancel: "Cancel",
    // UserProfileModal
    profile: "Profile", weightLabel: "Weight", heightLabel: "Height", ageLabel: "Age",
    memberSince: "In the app since",
    // NotificacionesPanel
    notifications: "Notifications", friendRequests: "Friend Requests",
    noPendingRequests: "No pending requests", activity: "Activity",
    noRecentActivity: "No recent activity",
    // HistorialPanel
    history: "History", summary: "Summary", average: "Average",
    totalTests: "Total tests", lastTest: "Last test",
    testsByHour: "Tests by time of day", latestTests: "Latest tests",
    noTestsYet: "You haven't done any tests yet", tests: "tests",
    // AmigosPanel
    friends: "Friends", searchFriends: "Search friends...",
    noFriendsYet: "You have no friends yet", noResults: "No results found",
    // CalendarioPanel
    calendar: "Calendar", weekView: "Week", monthView: "Month", yearView: "Year",
    noTestsRecorded: "No tests recorded yet",
    weekDays: ["M","T","W","T","F","S","S"],
    // Breathalyzer
    breathalyzer: "Breathalyzer", breathalyzerProductName: "TheReferee Breathalyzer",
    viewSpecs: "View specifications", buy: "Buy · €18.99",
    // Mouthpieces
    mouthpieces: "Mouthpieces", mouthpiecePack: "Pack of 12 mouthpieces", buyMouthpieces: "Buy · €3.99",
    // Settings
    settings: "Settings", changePassword: "Change password",
    profileVisibility: "Profile visibility", bluetooth: "Bluetooth", signOut: "Sign out",
    currentPassword: "Current password", newPasswordLabel: "New password",
    confirmNewPassword: "Confirm new password",
    syncingDevice: "Syncing device...",
    ensureDevice1: "Make sure the breathalyzer", ensureDevice2: "is on and nearby",
    appearInSuggestions: "Appear in friend-of-friends suggestions",
    showPhotosToMembers: "Show photos to group members",
    profilePicVisible: "Profile picture visible to non-friends",
    // HomeScreen
    userLabel: "User:", ageLabel2: "Age:", weightLabel2: "Weight:", heightLabel2: "Height:",
    years: "years", kg: "kg", cm: "cm",
    fitToDrive: "Fit to drive", negativeResult: "Negative result",
    notFitToDrive: "Not fit to drive", notFitToDriveCaps: "NOT FIT TO DRIVE",
    dangerousLevel: "Dangerous level", dangerousLevelCaps: "DANGEROUS LEVEL",
    callUberLogo: "UBER", callUberBtn: "Call", callEmergency: "Call 112",
    waitTime: "Wait time", soberDays: "Sober days",
    testXAxis: "Test #", newTest: "New test",
    peopleYouMayKnow: "People you may know", noUsersAvailable: "No users available",
    requested: "Requested", follow: "Follow",
    shareDirect: "Share result", shareViaWhatsApp: "WhatsApp", shareViaInstagram: "Instagram",
    shareStateOk: "Fit to drive", shareStateWarning: "Not fit to drive",
    shareStateDanger: "Dangerous level", shareTextPrefix: "I took a test with TheReferee:",
    // GroupScreen
    createFirstGroup: "Create your first group", createGroupBtn: "+ Create group",
    joinGroupBtn: "Join group", joinGroupTitle: "Join a group",
    enterInviteCode: "Enter the invitation code",
    joinBtn: "Join", joiningBtn: "Joining...", invalidCode: "Invalid code",
    selectGroup: "Select group", createdLabel: "Created:", paysUber: "pays for Uber",
    loadTest: "Load test", noMembers: "No members in this group",
    groupNameLabel: "Group name", addMembersTitle: "Add members",
    searchByUser: "Search by username...", creatingGroup: "Creating...",
    yourFriends: "Your friends", nonMembers: "Your friends (not members)",
    useSearchAdd: "Use the search bar to add members",
    useSearchFind: "Use the search bar to find users",
    createGroupAction: "Create group", inviteCode: "Invitation code",
    shareCodeMsg: "Share this code with your friends\nso they can join the group",
    uploadPhoto: "+ Upload photo", uploadingPhoto: "Uploading...",
    loadingPhotos: "Loading photos...", noPhotosYet: "No photos in this group yet",
    searchResults: "Results", manageGroup: "Manage group",
    changeGroupImage: "Change group image", addingMembers: "Adding...",
    membersSelected: "member selected", membersSelectedPlural: "members selected",
    errorCreatingGroup: "Error creating group:",
    // ProfileScreen
    myData: "My data", usernameField: "Username", birthDateField: "Date of birth",
    weightField: "Weight (kg)", heightField: "Height (cm)",
    saveChanges: "Save changes", saving: "Saving...", preferences: "Preferences",
    fontSizeLabel: "Font size", fontSmall: "Small", fontNormal: "Normal",
    fontLarge: "Large", fontXlarge: "Extra large", languageLabel: "Language",
    appearanceLabel: "Appearance", darkModeLabel: "Dark mode",
    notifSettings: "Notifications", legalTerms: "Legal terms", editData: "Edit Data",
    errorSaving: "Error saving. Please try again.",
    // Notif preferences
    notifFriendRequest: "Friend requests", notifAccepted: "Accepted requests",
    notifGroup: "Added to a group", notifNewTest: "New test in a group",
    notifReminder: "Test reminders", notifPhoto: "New photo in a group",
    notifNewPerson: "New person added to group",
  }
};

export function getT(lang) {
  return TRANSLATIONS[lang] || TRANSLATIONS.es;
}
