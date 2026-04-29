const MENU_ITEMS = [
  { label: "Cambiar nombre", external: false },
  { label: "Preferencias", external: false },
  { label: "Notificaciones", external: false },
  { label: "Valora la app", external: false },
  { label: "Términos legales", external: false },
];

const EXTERNAL_ITEMS = [];

export default function ProfileScreen({ onHamburger }) {
  return (
    <div className="screen">
      <header className="app-header">
        <span className="hamburger" onClick={onHamburger}>&#9776;</span>
        <h1 className="app-title">TheReferee</h1>
        <span />
      </header>

      {/* Avatar section */}
      <div className="profile-avatar-section">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            <svg viewBox="0 0 100 100" width="72" height="72">
              <circle cx="50" cy="35" r="22" fill="#f0c27f" />
              <rect x="20" y="58" width="60" height="42" rx="12" fill="#2ecc71" />
              <circle cx="50" cy="35" r="18" fill="#f5d5a0" />
              <path d="M32 32 Q50 20 68 32" fill="#6b3a1f" />
              <circle cx="42" cy="37" r="3" fill="#333" />
              <circle cx="58" cy="37" r="3" fill="#333" />
              <path d="M43 47 Q50 53 57 47" stroke="#c0856b" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <button className="camera-btn">📷</button>
        </div>
        <div className="profile-name">Carlos</div>
        <div className="profile-email">carloscarlos@gmail.com</div>
      </div>

      {/* Menu items */}
      <div className="profile-menu">
        {MENU_ITEMS.map((item) => (
          <button key={item.label} className="menu-item">
            <span>{item.label}</span>
            <span className="menu-arrow">›</span>
          </button>
        ))}
      </div>

      {EXTERNAL_ITEMS.length > 0 && (
        <>
          <div className="menu-divider" />
          <div className="profile-menu">
            {EXTERNAL_ITEMS.map((item) => (
              <button key={item.label} className="menu-item">
                <span>{item.label}</span>
                <span className="menu-arrow external">↗</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
