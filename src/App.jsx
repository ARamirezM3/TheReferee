import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import HomeScreen from "./screens/HomeScreen";
import GroupScreen from "./screens/GroupScreen";
import ProfileScreen from "./screens/ProfileScreen";
import "./index.css";

const SIDE_MENU_ITEMS = [
  "Modo oscuro / claro",
  "Historial",
  "Amigos",
  "Calendario",
  "Alcoholímetro",
  "Boquillas",
  "Configuración",
];

const TEST_HISTORY = [
  { date: "29 abr", time: "23:14", value: 0.72 },
  { date: "28 abr", time: "21:30", value: 0.45 },
  { date: "26 abr", time: "22:05", value: 0.18 },
  { date: "24 abr", time: "20:48", value: 0.61 },
  { date: "22 abr", time: "23:55", value: 0.33 },
  { date: "19 abr", time: "01:12", value: 0.55 },
  { date: "17 abr", time: "22:40", value: 0.09 },
  { date: "15 abr", time: "21:20", value: 0.42 },
];

const HOUR_CHART_DATA = [
  { h: "20h", n: 2 }, { h: "21h", n: 5 }, { h: "22h", n: 7 },
  { h: "23h", n: 9 }, { h: "00h", n: 6 }, { h: "01h", n: 3 },
  { h: "02h", n: 2 }, { h: "03h", n: 1 }, { h: "04h", n: 0 },
];

const CALENDAR_TESTS = {
  "2026-04-29": 0.72, "2026-04-28": 0.45, "2026-04-26": 0.18,
  "2026-04-24": 0.61, "2026-04-22": 0.33, "2026-04-19": 0.55,
  "2026-04-17": 0.09, "2026-04-15": 0.42, "2026-04-12": 0.28,
  "2026-04-05": 0.15, "2026-03-28": 0.51, "2026-03-15": 0.38,
};

function getTestColor(v) {
  if (v > 0.5) return "#ef4444";
  if (v > 0.25) return "#ca8a04";
  return "#22c55e";
}

/* PUNTO 1: solo círculos azules en el calendario */
function getCalDayStyle(value, isToday) {
  if (value === undefined) {
    if (isToday) return { borderRadius: "50%", border: "2px solid #2563eb", boxSizing: "border-box" };
    return {};
  }
  let opacity;
  if (value < 0.25) opacity = 0.15;
  else if (value < 0.50) opacity = 0.45;
  else if (value < 0.75) opacity = 0.75;
  else opacity = 1.0;

  const style = {
    background: `rgba(37,99,235,${opacity})`,
    borderRadius: "50%",
    color: opacity >= 0.75 ? "white" : "#1e1b4b",
  };
  if (isToday) style.border = "2px solid #2563eb";
  return style;
}

/* ---- Shared helpers ---- */
function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? "#7c3aed" : "#d1d5db",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: on ? 22 : 2,
        width: 20, height: 20, borderRadius: "50%",
        background: "white", transition: "left 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)", display: "block",
      }} />
    </button>
  );
}

function ToggleRow({ label, on, onChange, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: last ? "none" : "1px solid var(--border)" }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", paddingRight: 12 }}>{label}</span>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

function PasswordField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: "100%", padding: "12px 44px 12px 12px", border: "2px solid var(--border)", borderRadius: 10, fontSize: 14, fontFamily: "Nunito,sans-serif", color: "var(--text)", outline: "none", background: "white" }}
        />
        <button
          onClick={() => setShow(s => !s)}
          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-muted)" }}
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
}

/* ---- Panel: Notificaciones (HomeScreen mailbox) ---- */
function NotificacionesPanel({ onClose }) {
  const [requests, setRequests] = useState([
    { id: 1, name: "Ana García", initials: "AG", color: "#e91e8c" },
    { id: 2, name: "Javi López", initials: "JL", color: "#2196f3" },
  ]);
  const ACTIVITY = [
    { id: 1, text: "Noa aceptó tu solicitud de amistad", initials: "N", color: "#9b59b6" },
    { id: 2, text: "Rafa subió una foto en Cumple de Rafa", initials: "R", color: "#2ecc71" },
    { id: 3, text: "Marta realizó un nuevo test", initials: "M", color: "#e91e8c" },
  ];
  return (
    <div className="slide-panel">
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">Notificaciones</h2>
        <span />
      </header>
      <div className="panel-body">
        <div className="panel-section-title">Solicitudes de amistad</div>
        {requests.length === 0 && <p className="notif-empty">No hay solicitudes pendientes</p>}
        {requests.map(r => (
          <div key={r.id} className="friend-request-row">
            <div className="notif-avatar" style={{ background: r.color }}>{r.initials}</div>
            <span className="notif-name">{r.name}</span>
            <button className="friend-btn accept" onClick={() => setRequests(p => p.filter(x => x.id !== r.id))}>Aceptar</button>
            <button className="friend-btn reject" onClick={() => setRequests(p => p.filter(x => x.id !== r.id))}>Rechazar</button>
          </div>
        ))}
        <div className="panel-section-title" style={{ marginTop: 20 }}>Actividad</div>
        {ACTIVITY.map(a => (
          <div key={a.id} className="activity-row">
            <div className="notif-avatar" style={{ background: a.color }}>{a.initials}</div>
            <span className="notif-text">{a.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Panel: Historial ---- */
function HistorialPanel({ onClose }) {
  const avg = (TEST_HISTORY.reduce((s, t) => s + t.value, 0) / TEST_HISTORY.length).toFixed(2);
  return (
    <div className="slide-panel">
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">Historial</h2>
        <span />
      </header>
      <div className="panel-body">
        <div className="panel-section-title">Resumen</div>
        <div className="history-stats">
          <div className="stat-row"><span>Promedio</span><b>{avg} g/L</b></div>
          <div className="stat-row"><span>Total de tests</span><b>24</b></div>
          <div className="stat-row"><span>Último test</span><b>hace 2 horas</b></div>
          <div className="stat-row"><span>Racha sin alcohol</span><b>0 días</b></div>
        </div>
        <div className="panel-section-title" style={{ marginTop: 20 }}>Tests por hora del día</div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={HOUR_CHART_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="h" tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => [`${v} tests`]} />
            <Bar dataKey="n" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="panel-section-title" style={{ marginTop: 20 }}>Últimos tests</div>
        <div className="test-list">
          {TEST_HISTORY.map((t, i) => (
            <div key={i} className="test-row">
              <div className="test-datetime">
                <span className="test-date">{t.date}</span>
                <span className="test-time">{t.time}</span>
              </div>
              <span className="test-value" style={{ color: getTestColor(t.value) }}>
                {t.value.toFixed(2)}<span className="test-unit"> g/L</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Panel: Amigos ---- */
function AmigosPanel({ onClose }) {
  const [search, setSearch] = useState("");
  const FRIENDS = [
    { name: "Lucas Martínez", initials: "LM", color: "#3498db" },
    { name: "Elena García", initials: "EG", color: "#e91e8c" },
    { name: "Pablo Rodríguez", initials: "PR", color: "#e67e22" },
    { name: "Sara López", initials: "SL", color: "#9b59b6" },
    { name: "Tomás Fernández", initials: "TF", color: "#2ecc71" },
    { name: "Marta Sánchez", initials: "MS", color: "#e74c3c" },
  ];
  const filtered = FRIENDS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="slide-panel">
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">Amigos</h2>
        <span />
      </header>
      <div className="panel-body">
        <input
          type="text"
          placeholder="Buscar amigos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", border: "2px solid var(--border)", borderRadius: 10, fontSize: 14, fontFamily: "Nunito,sans-serif", color: "var(--text)", marginBottom: 16, outline: "none", background: "white" }}
        />
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: "24px 0" }}>Aún no tienes amigos añadidos</p>
        ) : (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
            {filtered.map((f, i) => (
              <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: f.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{f.initials}</div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{f.name}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 20 }}>›</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Panel: Calendario ---- */
function CalendarioPanel({ onClose }) {
  const [view, setView] = useState("mes");
  const today = new Date();
  const [displayDate, setDisplayDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  function renderMonth() {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const offset = firstDow === 0 ? 6 : firstDow - 1;
    const total = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(<div key={`e${i}`} className="cal-cell" />);
    for (let d = 1; d <= total; d++) {
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const val = CALENDAR_TESTS[key];
      const isTd = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
      cells.push(
        <div key={d} className="cal-cell">
          <span className="cal-num" style={getCalDayStyle(val, isTd)}>{d}</span>
        </div>
      );
    }
    const label = displayDate.toLocaleString("es-ES", { month: "long", year: "numeric" });
    return (
      <>
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={() => setDisplayDate(new Date(year, month - 1, 1))}>‹</button>
          <span className="cal-month-label">{label}</span>
          <button className="cal-nav-btn" onClick={() => setDisplayDate(new Date(year, month + 1, 1))}>›</button>
        </div>
        <div className="cal-weekdays">
          {["L","M","X","J","V","S","D"].map(wd => <div key={wd} className="cal-wd">{wd}</div>)}
        </div>
        <div className="cal-grid">{cells}</div>
      </>
    );
  }

  function renderWeek() {
    const dow = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dow);
    return (
      <div className="week-view">
        {["L","M","X","J","V","S","D"].map((wd, i) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
          const val = CALENDAR_TESTS[key];
          const isTd = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
          return (
            <div key={i} className="week-col">
              <div className="week-wd">{wd}</div>
              <div className="week-num" style={getCalDayStyle(val, isTd)}>{d.getDate()}</div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderYear() {
    const year = today.getFullYear();
    return (
      <div className="year-grid">
        {Array.from({ length: 12 }, (_, m) => {
          const hasData = Object.keys(CALENDAR_TESTS).some(k => {
            const [y, mo] = k.split("-").map(Number);
            return y === year && mo - 1 === m;
          });
          const lbl = new Date(year, m, 1).toLocaleString("es-ES", { month: "short" });
          return (
            <div key={m} className="year-month-cell">
              <span className="year-month-label">{lbl}</span>
              {hasData && <span className="year-dot" />}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="slide-panel">
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">Calendario</h2>
        <span />
      </header>
      <div className="panel-body">
        <div className="view-selector">
          {["semana","mes","año"].map(v => (
            <button key={v} className={`view-btn${view === v ? " active" : ""}`} onClick={() => setView(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        {view === "mes" && renderMonth()}
        {view === "semana" && renderWeek()}
        {view === "año" && renderYear()}
      </div>
    </div>
  );
}

/* ---- Panel: Alcoholímetro ---- */
function AlcohimetroPanel({ onClose }) {
  return (
    <div className="slide-panel">
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">Alcoholímetro</h2>
        <span />
      </header>
      <div className="panel-body product-panel">
        <img src="/images/thereferee_alcmet.png" alt="Alcoholímetro" className="product-img" />
        <div className="product-name">Alcoholímetro TheReferee</div>
        <button className="product-btn-secondary">Ver especificaciones</button>
        <button className="product-btn-primary">Comprar · 18,99 €</button>
      </div>
    </div>
  );
}

/* ---- Panel: Boquillas ---- */
function BoquillasPanel({ onClose }) {
  return (
    <div className="slide-panel">
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">Boquillas</h2>
        <span />
      </header>
      <div className="panel-body product-panel">
        <img src="/images/thereferee_boquilla.png" alt="Boquillas" className="product-img" />
        <div className="product-name">Pack de 12 boquillas</div>
        <div className="product-price">3,99 €</div>
        <button className="product-btn-primary">Comprar · 3,99 €</button>
      </div>
    </div>
  );
}

/* ---- Config sub-panels ---- */
function CambioContrasenaPanel({ onClose }) {
  const [curr, setCurr] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  return (
    <div className="slide-panel" style={{ zIndex: 53 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">Cambiar contraseña</h2>
        <span />
      </header>
      <div className="panel-body">
        <PasswordField label="Contraseña actual" value={curr} onChange={setCurr} />
        <PasswordField label="Nueva contraseña" value={newPass} onChange={setNewPass} />
        <PasswordField label="Confirmar nueva contraseña" value={confirm} onChange={setConfirm} />
        <button style={{ width: "100%", background: "#7c3aed", color: "white", border: "none", borderRadius: 12, padding: 14, fontSize: 16, fontWeight: 800, fontFamily: "Nunito,sans-serif", cursor: "pointer", marginTop: 8 }}>
          Aceptar
        </button>
      </div>
    </div>
  );
}

function VisibilidadPerfilPanel({ onClose }) {
  const [vis, setVis] = useState({ sugerencias: true, fotos: true, noAmigos: false });
  function toggle(key) { setVis(p => ({ ...p, [key]: !p[key] })); }
  const items = [
    { key: "sugerencias", label: "Aparecer en sugerencias de amigos de amigos" },
    { key: "fotos", label: "Mostrar fotos a miembros de mis grupos" },
    { key: "noAmigos", label: "Foto de perfil visible para no amigos" },
  ];
  return (
    <div className="slide-panel" style={{ zIndex: 53 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">Visibilidad del perfil</h2>
        <span />
      </header>
      <div className="panel-body">
        <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          {items.map((item, i) => (
            <ToggleRow key={item.key} label={item.label} on={vis[item.key]} onChange={() => toggle(item.key)} last={i === items.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BluetoothPanel({ onClose }) {
  return (
    <div className="slide-panel" style={{ zIndex: 53 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">Bluetooth</h2>
        <span />
      </header>
      <div className="panel-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
        <svg viewBox="0 0 24 24" width="80" height="80" className="bt-icon-anim">
          <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
        </svg>
        <p style={{ marginTop: 20, fontSize: 16, fontWeight: 700, color: "var(--text)", textAlign: "center" }}>Sincronizando dispositivo...</p>
        <p style={{ marginTop: 8, fontSize: 13, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>Asegúrate de que el alcoholímetro<br />está encendido y cerca</p>
      </div>
    </div>
  );
}

/* ---- Panel: Configuración ---- */
function ConfiguracionPanel({ onClose }) {
  const [subPanel, setSubPanel] = useState(null);
  const ITEMS = [
    { label: "Cambio de contraseña", panel: "contrasena" },
    { label: "Visibilidad del perfil", panel: "visibilidad" },
    { label: "Bluetooth", panel: "bluetooth" },
  ];
  return (
    <div className="slide-panel">
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">Configuración</h2>
        <span />
      </header>
      <div className="panel-body">
        <div className="profile-menu" style={{ margin: 0 }}>
          {ITEMS.map(item => (
            <button key={item.label} className="menu-item" onClick={() => setSubPanel(item.panel)}>
              <span>{item.label}</span>
              <span className="menu-arrow">›</span>
            </button>
          ))}
        </div>
        <div className="menu-divider" />
        <div className="profile-menu" style={{ margin: 0 }}>
          <button className="menu-item logout-btn">
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {subPanel === "contrasena" && <CambioContrasenaPanel onClose={() => setSubPanel(null)} />}
      {subPanel === "visibilidad" && <VisibilidadPerfilPanel onClose={() => setSubPanel(null)} />}
      {subPanel === "bluetooth" && <BluetoothPanel onClose={() => setSubPanel(null)} />}
    </div>
  );
}

/* ---- App ---- */
export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [fontSize, setFontSize] = useState("normal");

  function handleTabChange(tab) {
    setActiveTab(tab);
    setSideMenuOpen(false);
  }

  function openPanel(name) {
    setActivePanel(name);
    setSideMenuOpen(false);
  }

  function handleMenuItemClick(item) {
    if (item === "Modo oscuro / claro") {
      setDarkMode(d => !d);
      setSideMenuOpen(false);
      return;
    }
    const MAP = {
      "Historial": "historial",
      "Amigos": "amigos",
      "Calendario": "calendario",
      "Alcoholímetro": "alcoholimetro",
      "Boquillas": "boquillas",
      "Configuración": "configuracion",
    };
    if (MAP[item]) openPanel(MAP[item]);
  }

  const fontClass = fontSize !== "normal" ? ` font-${fontSize}` : "";

  return (
    <div className="app-shell">
      <div className={`phone-frame${darkMode ? " dark-mode" : ""}${fontClass}`}>
        <div className="screen-content">
          {activeTab === "home" && (
            <HomeScreen
              onHamburger={() => setSideMenuOpen(true)}
              onOpenNotifications={() => openPanel("notificaciones")}
            />
          )}
          {activeTab === "group" && <GroupScreen onHamburger={() => setSideMenuOpen(true)} />}
          {activeTab === "profile" && (
            <ProfileScreen
              onHamburger={() => setSideMenuOpen(true)}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              fontSize={fontSize}
              setFontSize={setFontSize}
            />
          )}
        </div>
        <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />

        <div
          className={`side-overlay${sideMenuOpen ? " visible" : ""}`}
          onClick={() => setSideMenuOpen(false)}
        />
        <div className={`side-menu${sideMenuOpen ? " open" : ""}`}>
          <div className="side-menu-header">
            <img src="/images/logo.png" alt="TheReferee" className="side-logo" />
          </div>
          <nav className="side-nav">
            {SIDE_MENU_ITEMS.map((item) => (
              <button key={item} className="side-nav-item" onClick={() => handleMenuItemClick(item)}>
                {item === "Modo oscuro / claro" ? (darkMode ? "☀️ Modo claro" : "🌙 Modo oscuro") : item}
              </button>
            ))}
          </nav>
        </div>

        {activePanel === "notificaciones" && <NotificacionesPanel onClose={() => setActivePanel(null)} />}
        {activePanel === "historial" && <HistorialPanel onClose={() => setActivePanel(null)} />}
        {activePanel === "amigos" && <AmigosPanel onClose={() => setActivePanel(null)} />}
        {activePanel === "calendario" && <CalendarioPanel onClose={() => setActivePanel(null)} />}
        {activePanel === "alcoholimetro" && <AlcohimetroPanel onClose={() => setActivePanel(null)} />}
        {activePanel === "boquillas" && <BoquillasPanel onClose={() => setActivePanel(null)} />}
        {activePanel === "configuracion" && <ConfiguracionPanel onClose={() => setActivePanel(null)} />}
      </div>
    </div>
  );
}

function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "home", label: "Inicio", icon: <HomeIcon /> },
    { id: "group", label: "Grupo", icon: <GroupIcon /> },
    { id: "profile", label: "Perfil", icon: <ProfileIcon /> },
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-btn ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}
function GroupIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}
