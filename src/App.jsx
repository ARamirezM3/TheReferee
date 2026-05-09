import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "./supabase";
import { getT } from "./i18n";
import HomeScreen from "./screens/HomeScreen";
import GroupScreen from "./screens/GroupScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import "./index.css";

const SIDE_MENU_KEYS = [
  "dark",
  "historial",
  "amigos",
  "calendario",
  "alcoholimetro",
  "boquillas",
  "configuracion",
];

function getTestColor(v) {
  if (v > 0.5) return "#ef4444";
  if (v > 0.25) return "#ca8a04";
  return "#22c55e";
}

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
  const style = { background: `rgba(37,99,235,${opacity})`, borderRadius: "50%", color: opacity >= 0.75 ? "white" : "#1e1b4b" };
  if (isToday) style.border = "2px solid #2563eb";
  return style;
}

const AVATAR_COLORS = ["#3498db", "#e91e8c", "#e67e22", "#9b59b6", "#2ecc71"];
function avatarColor(id) {
  if (!id) return "#7c3aed";
  return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
}

function MiniAvatar({ userId, usuario, fotoPerfil, size = 38 }) {
  const bg = avatarColor(userId);
  const letter = (usuario || "?")[0].toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {fotoPerfil
        ? <img src={fotoPerfil} alt={usuario} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ color: "white", fontWeight: 800, fontSize: Math.round(size * 0.38) }}>{letter}</span>}
    </div>
  );
}

function calcEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function UserProfileModal({ user, onClose, lang }) {
  const t = getT(lang);
  const [fullData, setFullData] = useState(null);
  useEffect(() => {
    supabase.from("usuarios").select("usuario, foto_perfil, peso, altura, fecha_nacimiento, created_at")
      .eq("id", user.id).single()
      .then(({ data }) => setFullData(data));
  }, [user.id]);
  const rows = fullData ? [
    { label: t.weightLabel, value: fullData.peso ? `${fullData.peso} ${t.kg}` : "—" },
    { label: t.heightLabel, value: fullData.altura ? `${fullData.altura} ${t.cm}` : "—" },
    { label: t.ageLabel, value: fullData.fecha_nacimiento ? `${calcEdad(fullData.fecha_nacimiento)} ${t.years}` : "—" },
    { label: t.memberSince, value: fullData.created_at ? new Date(fullData.created_at).toLocaleDateString(t.locale, { month: "long", year: "numeric" }) : "—" },
  ] : [];
  return (
    <div className="slide-panel" style={{ zIndex: 55 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.profile}</h2>
        <span />
      </header>
      <div className="panel-body" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <MiniAvatar userId={user.id} usuario={fullData?.usuario || user.usuario} fotoPerfil={fullData?.foto_perfil || user.foto_perfil} size={80} />
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginTop: 12 }}>
          @{fullData?.usuario || user.usuario || "—"}
        </div>
        {!fullData && <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 16 }}>{t.loading}</p>}
        {fullData && (
          <div style={{ marginTop: 24, width: "100%", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
            {rows.map((row, i) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 700 }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{ width: 44, height: 24, borderRadius: 12, background: on ? "#7c3aed" : "#d1d5db", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
    >
      <span style={{ position: "absolute", top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", display: "block" }} />
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
        <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
          style={{ width: "100%", padding: "12px 44px 12px 12px", border: "2px solid var(--border)", borderRadius: 10, fontSize: 14, fontFamily: "Nunito,sans-serif", color: "var(--text)", outline: "none", background: "var(--input-bg)" }} />
        <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-muted)" }}>
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
}

/* ---- Panel: Notificaciones ---- */
function NotificacionesPanel({ currentUser, onClose, lang }) {
  const t = getT(lang);
  const [requests, setRequests] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    async function load() {
      const { data: meData } = await supabase.from("usuarios").select("usuario").eq("id", currentUser.id).single();
      setCurrentUserName(meData?.usuario || "");
      const { data: pendingRows } = await supabase
        .from("amigos").select("id, usuario_id")
        .eq("amigo_id", currentUser.id).eq("estado", "pendiente");
      if (pendingRows && pendingRows.length > 0) {
        const senderIds = pendingRows.map(r => r.usuario_id);
        const { data: senders } = await supabase.from("usuarios").select("id, usuario, foto_perfil").in("id", senderIds);
        setRequests(pendingRows.map(r => ({ ...r, sender: senders?.find(s => s.id === r.usuario_id) })));
      }
      const { data: notifs } = await supabase.from("notificaciones")
        .select("id, mensaje, tipo, leida, created_at, de_usuario_id")
        .eq("usuario_id", currentUser.id)
        .order("created_at", { ascending: false }).limit(20);
      if (notifs && notifs.length > 0) {
        const senderIds = [...new Set(notifs.map(n => n.de_usuario_id).filter(Boolean))];
        let sendersMap = {};
        if (senderIds.length > 0) {
          const { data: sendersData } = await supabase.from("usuarios").select("id, usuario, foto_perfil").in("id", senderIds);
          sendersMap = Object.fromEntries((sendersData || []).map(s => [s.id, s]));
        }
        setActivity(notifs.map(n => ({ ...n, sender: sendersMap[n.de_usuario_id] })));
        const unreadIds = notifs.filter(n => !n.leida).map(n => n.id);
        if (unreadIds.length > 0) {
          supabase.from("notificaciones").update({ leida: true }).in("id", unreadIds).then(() => {});
        }
      }
      setLoading(false);
    }
    load();
  }, [currentUser?.id]);

  async function handleAccept(req) {
    await supabase.from("amigos").update({ estado: "aceptado" }).eq("id", req.id);
    await supabase.from("notificaciones").insert([
      { usuario_id: currentUser.id, de_usuario_id: req.usuario_id, tipo: "amigos_aceptado", mensaje: `Ahora tú y ${req.sender?.usuario || "alguien"} sois amigos`, leida: false },
      { usuario_id: req.usuario_id, de_usuario_id: currentUser.id, tipo: "amigos_aceptado", mensaje: `${currentUserName || "Alguien"} aceptó tu solicitud. ¡Ahora sois amigos!`, leida: false },
    ]);
    setActivity(prev => [{ id: Date.now(), mensaje: `Ahora tú y ${req.sender?.usuario || "alguien"} sois amigos`, tipo: "amigos_aceptado", sender: req.sender }, ...prev]);
    setRequests(prev => prev.filter(r => r.id !== req.id));
  }

  async function handleReject(req) {
    await supabase.from("amigos").delete().eq("id", req.id);
    setRequests(prev => prev.filter(r => r.id !== req.id));
  }

  return (
    <div className="slide-panel">
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.notifications}</h2>
        <span />
      </header>
      <div className="panel-body">
        <div className="panel-section-title">{t.friendRequests}</div>
        {loading
          ? <p className="notif-empty">{t.loading}</p>
          : requests.length === 0
            ? <p className="notif-empty">{t.noPendingRequests}</p>
            : requests.map(r => (
              <div key={r.id} className="friend-request-row">
                <MiniAvatar userId={r.usuario_id} usuario={r.sender?.usuario} fotoPerfil={r.sender?.foto_perfil} />
                <span className="notif-name">{r.sender?.usuario || "Usuario"}</span>
                <button className="friend-btn accept" onClick={() => handleAccept(r)}>{t.accept}</button>
                <button className="friend-btn reject" onClick={() => handleReject(r)}>{t.reject}</button>
              </div>
            ))
        }
        <div className="panel-section-title" style={{ marginTop: 20 }}>{t.activity}</div>
        {!loading && activity.length === 0 && <p className="notif-empty">{t.noRecentActivity}</p>}
        {activity.map(a => (
          <div key={a.id} className="activity-row">
            <MiniAvatar userId={a.de_usuario_id} usuario={a.sender?.usuario} fotoPerfil={a.sender?.foto_perfil} />
            <span className="notif-text">{a.mensaje}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Panel: Historial ---- */
function HistorialPanel({ currentUser, onClose, lang }) {
  const t = getT(lang);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    supabase.from("tests").select("id, created_at, valor_gl")
      .eq("usuario_id", currentUser.id)
      .order("created_at", { ascending: false }).limit(30)
      .then(({ data }) => { setTests(data || []); setLoading(false); });
  }, [currentUser?.id]);

  const empty = !loading && tests.length === 0;
  const avg = tests.length > 0
    ? (tests.reduce((s, tt) => s + parseFloat(tt.valor_gl), 0) / tests.length).toFixed(2) : "—";

  const hourMap = {};
  tests.forEach(tt => {
    const h = new Date(tt.created_at).getHours();
    hourMap[h] = (hourMap[h] || 0) + 1;
  });
  const hourData = Object.entries(hourMap).map(([h, n]) => ({ h: `${h}h`, n })).sort((a, b) => parseInt(a.h) - parseInt(b.h));

  return (
    <div className="slide-panel">
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.history}</h2>
        <span />
      </header>
      <div className="panel-body">
        {loading && <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>{t.loading}</p>}
        {empty && (
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: "40px 0" }}>
            {t.noTestsYet}
          </p>
        )}
        {!loading && !empty && (
          <>
            <div className="panel-section-title">{t.summary}</div>
            <div className="history-stats">
              <div className="stat-row"><span>{t.average}</span><b>{avg} g/L</b></div>
              <div className="stat-row"><span>{t.totalTests}</span><b>{tests.length}</b></div>
              <div className="stat-row"><span>{t.lastTest}</span><b>{new Date(tests[0].created_at).toLocaleDateString(t.locale, { day: "numeric", month: "short" })}</b></div>
            </div>
            {hourData.length > 0 && (
              <>
                <div className="panel-section-title" style={{ marginTop: 20 }}>{t.testsByHour}</div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={hourData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <XAxis dataKey="h" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => [`${v} ${t.tests}`]} />
                    <Bar dataKey="n" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
            <div className="panel-section-title" style={{ marginTop: 20 }}>{t.latestTests}</div>
            <div className="test-list">
              {tests.slice(0, 15).map(tt => {
                const d = new Date(tt.created_at);
                const date = d.toLocaleDateString(t.locale, { day: "numeric", month: "short" });
                const time = d.toLocaleTimeString(t.locale, { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={tt.id} className="test-row">
                    <div className="test-datetime">
                      <span className="test-date">{date}</span>
                      <span className="test-time">{time}</span>
                    </div>
                    <span className="test-value" style={{ color: getTestColor(parseFloat(tt.valor_gl)) }}>
                      {parseFloat(tt.valor_gl).toFixed(2)}<span className="test-unit"> g/L</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---- Panel: Amigos ---- */
function AmigosPanel({ currentUser, onClose, lang }) {
  const t = getT(lang);
  const [amigos, setAmigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    async function load() {
      const [{ data: sent }, { data: received }] = await Promise.all([
        supabase.from("amigos").select("amigo_id").eq("usuario_id", currentUser.id).eq("estado", "aceptado"),
        supabase.from("amigos").select("usuario_id").eq("amigo_id", currentUser.id).eq("estado", "aceptado"),
      ]);
      const ids = [...(sent || []).map(a => a.amigo_id), ...(received || []).map(a => a.usuario_id)];
      if (ids.length === 0) { setLoading(false); return; }
      const { data: users } = await supabase.from("usuarios").select("id, usuario, foto_perfil").in("id", ids);
      setAmigos(users || []);
      setLoading(false);
    }
    load();
  }, [currentUser?.id]);

  const filtered = amigos.filter(f => !search || f.usuario?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="slide-panel">
        <header className="panel-header">
          <button className="panel-back" onClick={onClose}>←</button>
          <h2 className="panel-title">{t.friends}</h2>
          <span />
        </header>
        <div className="panel-body">
          <input type="text" placeholder={t.searchFriends} value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "2px solid var(--border)", borderRadius: 10, fontSize: 14, fontFamily: "Nunito,sans-serif", color: "var(--text)", marginBottom: 16, outline: "none", background: "var(--input-bg)" }} />
          {loading
            ? <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px 0" }}>{t.loading}</p>
            : filtered.length === 0
              ? <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: "24px 0" }}>
                  {amigos.length === 0 ? t.noFriendsYet : t.noResults}
                </p>
              : (
                <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
                  {filtered.map((f, i) => (
                    <div key={f.id} onClick={() => setSelectedUser(f)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer" }}>
                      <MiniAvatar userId={f.id} usuario={f.usuario} fotoPerfil={f.foto_perfil} />
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{f.usuario}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: 20 }}>›</span>
                    </div>
                  ))}
                </div>
              )
          }
        </div>
      </div>
      {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} lang={lang} />}
    </>
  );
}

/* ---- Panel: Calendario ---- */
function CalendarioPanel({ currentUser, onClose, lang }) {
  const t = getT(lang);
  const [view, setView] = useState("mes");
  const [calTests, setCalTests] = useState({});
  const today = new Date();
  const [displayDate, setDisplayDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  useEffect(() => {
    if (!currentUser) return;
    supabase.from("tests").select("valor_gl, fecha, created_at")
      .eq("usuario_id", currentUser.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!data) return;
        const map = {};
        data.forEach(tt => {
          const d = tt.fecha || tt.created_at?.slice(0, 10);
          if (d) map[d] = Math.max(map[d] || 0, parseFloat(tt.valor_gl));
        });
        setCalTests(map);
      });
  }, [currentUser?.id]);

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
      const val = calTests[key];
      const isTd = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
      cells.push(
        <div key={d} className="cal-cell">
          <span className="cal-num" style={getCalDayStyle(val, isTd)}>{d}</span>
        </div>
      );
    }
    const label = displayDate.toLocaleString(t.locale, { month: "long", year: "numeric" });
    return (
      <>
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={() => setDisplayDate(new Date(year, month - 1, 1))}>‹</button>
          <span className="cal-month-label">{label}</span>
          <button className="cal-nav-btn" onClick={() => setDisplayDate(new Date(year, month + 1, 1))}>›</button>
        </div>
        <div className="cal-weekdays">{t.weekDays.map((wd, i) => <div key={i} className="cal-wd">{wd}</div>)}</div>
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
        {t.weekDays.map((wd, i) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
          const val = calTests[key];
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
          const hasData = Object.keys(calTests).some(k => { const [y, mo] = k.split("-").map(Number); return y === year && mo - 1 === m; });
          const lbl = new Date(year, m, 1).toLocaleString(t.locale, { month: "short" });
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

  const views = [
    { key: "semana", label: t.weekView },
    { key: "mes", label: t.monthView },
    { key: "año", label: t.yearView },
  ];

  return (
    <div className="slide-panel">
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.calendar}</h2>
        <span />
      </header>
      <div className="panel-body">
        <div className="view-selector">
          {views.map(v => (
            <button key={v.key} className={`view-btn${view === v.key ? " active" : ""}`} onClick={() => setView(v.key)}>
              {v.label}
            </button>
          ))}
        </div>
        {Object.keys(calTests).length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "8px 0 16px" }}>
            {t.noTestsRecorded}
          </p>
        )}
        {view === "mes" && renderMonth()}
        {view === "semana" && renderWeek()}
        {view === "año" && renderYear()}
      </div>
    </div>
  );
}

/* ---- Panel: Alcoholímetro ---- */
function AlcohimetroPanel({ onClose, lang }) {
  const t = getT(lang);
  return (
    <div className="slide-panel">
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.breathalyzer}</h2>
        <span />
      </header>
      <div className="panel-body product-panel">
        <img src="/images/thereferee_alcmet.png" alt="Alcoholímetro" className="product-img" />
        <div className="product-name">{t.breathalyzerProductName}</div>
        <button className="product-btn-secondary">{t.viewSpecs}</button>
        <button className="product-btn-primary">{t.buy}</button>
      </div>
    </div>
  );
}

/* ---- Panel: Boquillas ---- */
function BoquillasPanel({ onClose, lang }) {
  const t = getT(lang);
  return (
    <div className="slide-panel">
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.mouthpieces}</h2>
        <span />
      </header>
      <div className="panel-body product-panel">
        <img src="/images/thereferee_boquilla.png" alt="Boquillas" className="product-img" />
        <div className="product-name">{t.mouthpiecePack}</div>
        <div className="product-price">3,99 €</div>
        <button className="product-btn-primary">{t.buyMouthpieces}</button>
      </div>
    </div>
  );
}

/* ---- Config sub-panels ---- */
function CambioContrasenaPanel({ onClose, lang }) {
  const t = getT(lang);
  const [curr, setCurr] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  return (
    <div className="slide-panel" style={{ zIndex: 53 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.changePassword}</h2>
        <span />
      </header>
      <div className="panel-body">
        <PasswordField label={t.currentPassword} value={curr} onChange={setCurr} />
        <PasswordField label={t.newPasswordLabel} value={newPass} onChange={setNewPass} />
        <PasswordField label={t.confirmNewPassword} value={confirm} onChange={setConfirm} />
        <button style={{ width: "100%", background: "#7c3aed", color: "white", border: "none", borderRadius: 12, padding: 14, fontSize: 16, fontWeight: 800, fontFamily: "Nunito,sans-serif", cursor: "pointer", marginTop: 8 }}>
          {t.accept}
        </button>
      </div>
    </div>
  );
}

function VisibilidadPerfilPanel({ onClose, lang }) {
  const t = getT(lang);
  const [vis, setVis] = useState({ sugerencias: true, fotos: true, noAmigos: false });
  function toggle(key) { setVis(p => ({ ...p, [key]: !p[key] })); }
  const items = [
    { key: "sugerencias", label: t.appearInSuggestions },
    { key: "fotos", label: t.showPhotosToMembers },
    { key: "noAmigos", label: t.profilePicVisible },
  ];
  return (
    <div className="slide-panel" style={{ zIndex: 53 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.profileVisibility}</h2>
        <span />
      </header>
      <div className="panel-body">
        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          {items.map((item, i) => (
            <ToggleRow key={item.key} label={item.label} on={vis[item.key]} onChange={() => toggle(item.key)} last={i === items.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BluetoothPanel({ onClose, lang }) {
  const t = getT(lang);
  return (
    <div className="slide-panel" style={{ zIndex: 53 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.bluetooth}</h2>
        <span />
      </header>
      <div className="panel-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
        <svg viewBox="0 0 24 24" width="80" height="80" className="bt-icon-anim">
          <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
        </svg>
        <p style={{ marginTop: 20, fontSize: 16, fontWeight: 700, color: "var(--text)", textAlign: "center" }}>{t.syncingDevice}</p>
        <p style={{ marginTop: 8, fontSize: 13, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>{t.ensureDevice1}<br />{t.ensureDevice2}</p>
      </div>
    </div>
  );
}

function ConfiguracionPanel({ onClose, lang }) {
  const t = getT(lang);
  const [subPanel, setSubPanel] = useState(null);
  const ITEMS = [
    { label: t.changePassword, panel: "contrasena" },
    { label: t.profileVisibility, panel: "visibilidad" },
    { label: t.bluetooth, panel: "bluetooth" },
  ];
  return (
    <div className="slide-panel">
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.settings}</h2>
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
          <button className="menu-item logout-btn" onClick={() => supabase.auth.signOut()}>
            <span>{t.signOut}</span>
          </button>
        </div>
      </div>
      {subPanel === "contrasena" && <CambioContrasenaPanel onClose={() => setSubPanel(null)} lang={lang} />}
      {subPanel === "visibilidad" && <VisibilidadPerfilPanel onClose={() => setSubPanel(null)} lang={lang} />}
      {subPanel === "bluetooth" && <BluetoothPanel onClose={() => setSubPanel(null)} lang={lang} />}
    </div>
  );
}

/* ---- App ---- */
export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("thereferee_dark") === "1");
  const [activePanel, setActivePanel] = useState(null);
  const [fontSize, setFontSize] = useState("normal");
  const [lang, setLang] = useState(() => localStorage.getItem("thereferee_lang") || "es");
  const [currentUser, setCurrentUser] = useState(undefined);
  const [authView, setAuthView] = useState("login");
  const [showWelcome, setShowWelcome] = useState(false);

  const t = getT(lang);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") setActiveTab("home");
      setCurrentUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  function handleSetDarkMode(val) {
    setDarkMode(val);
    localStorage.setItem("thereferee_dark", val ? "1" : "0");
  }

  function handleSetLang(newLang) {
    setLang(newLang);
    localStorage.setItem("thereferee_lang", newLang);
  }

  if (currentUser === undefined) {
    return (
      <div className="app-shell">
        <div className="phone-frame" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: 28, color: "#7c3aed", letterSpacing: 2 }}>TheReferee</div>
            <div style={{ marginTop: 16, color: "#6b7280", fontSize: 14 }}>{t.loading}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="app-shell">
        <div className={`phone-frame${darkMode ? " dark-mode" : ""}`}>
          <div className="screen-content">
            {authView === "login"
              ? <LoginScreen onGoRegister={() => setAuthView("register")} lang={lang} />
              : <RegisterScreen
                  onGoLogin={() => setAuthView("login")}
                  onRegistered={() => setShowWelcome(true)}
                  lang={lang}
                />
            }
          </div>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="app-shell">
        <div className={`phone-frame${darkMode ? " dark-mode" : ""}`}>
          <div className="screen-content">
            <WelcomeScreen userId={currentUser.id} onDone={() => setShowWelcome(false)} lang={lang} />
          </div>
        </div>
      </div>
    );
  }

  function handleTabChange(tab) { setActiveTab(tab); setSideMenuOpen(false); }
  function openPanel(name) { setActivePanel(name); setSideMenuOpen(false); }

  function handleMenuItemClick(key) {
    if (key === "dark") {
      handleSetDarkMode(!darkMode);
      setSideMenuOpen(false);
      return;
    }
    openPanel(key);
  }

  const fontClass = fontSize !== "normal" ? ` font-${fontSize}` : "";

  const sideMenuLabels = {
    dark: darkMode ? t.menuLightMode : t.menuDarkMode,
    historial: t.menuHistory,
    amigos: t.menuFriends,
    calendario: t.menuCalendar,
    alcoholimetro: t.menuBreathalyzer,
    boquillas: t.menuMouthpieces,
    configuracion: t.menuSettings,
  };

  return (
    <div className="app-shell">
      <div className={`phone-frame${darkMode ? " dark-mode" : ""}${fontClass}`}>
        <div className="screen-content">
          {activeTab === "home" && (
            <HomeScreen
              onHamburger={() => setSideMenuOpen(true)}
              onOpenNotifications={() => openPanel("notificaciones")}
              currentUser={currentUser}
              lang={lang}
            />
          )}
          {activeTab === "group" && (
            <GroupScreen
              onHamburger={() => setSideMenuOpen(true)}
              currentUser={currentUser}
              lang={lang}
            />
          )}
          {activeTab === "profile" && (
            <ProfileScreen
              onHamburger={() => setSideMenuOpen(true)}
              darkMode={darkMode}
              setDarkMode={handleSetDarkMode}
              fontSize={fontSize}
              setFontSize={setFontSize}
              currentUser={currentUser}
              lang={lang}
              setLang={handleSetLang}
            />
          )}
        </div>
        <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} lang={lang} />

        <div className={`side-overlay${sideMenuOpen ? " visible" : ""}`} onClick={() => setSideMenuOpen(false)} />
        <div className={`side-menu${sideMenuOpen ? " open" : ""}`}>
          <div className="side-menu-header">
            <img src="/images/logo.png" alt="TheReferee" className="side-logo" />
          </div>
          <nav className="side-nav">
            {SIDE_MENU_KEYS.map((key) => (
              <button key={key} className="side-nav-item" onClick={() => handleMenuItemClick(key)}>
                {sideMenuLabels[key]}
              </button>
            ))}
          </nav>
        </div>

        {activePanel === "notificaciones" && <NotificacionesPanel currentUser={currentUser} onClose={() => setActivePanel(null)} lang={lang} />}
        {activePanel === "historial" && <HistorialPanel currentUser={currentUser} onClose={() => setActivePanel(null)} lang={lang} />}
        {activePanel === "amigos" && <AmigosPanel currentUser={currentUser} onClose={() => setActivePanel(null)} lang={lang} />}
        {activePanel === "calendario" && <CalendarioPanel currentUser={currentUser} onClose={() => setActivePanel(null)} lang={lang} />}
        {activePanel === "alcoholimetro" && <AlcohimetroPanel onClose={() => setActivePanel(null)} lang={lang} />}
        {activePanel === "boquillas" && <BoquillasPanel onClose={() => setActivePanel(null)} lang={lang} />}
        {activePanel === "configuracion" && <ConfiguracionPanel onClose={() => setActivePanel(null)} lang={lang} />}
      </div>
    </div>
  );
}

function BottomNav({ activeTab, setActiveTab, lang }) {
  const t = getT(lang);
  const tabs = [
    { id: "home", label: t.tabHome, icon: <HomeIcon /> },
    { id: "group", label: t.tabGroup, icon: <GroupIcon /> },
    { id: "profile", label: t.tabProfile, icon: <ProfileIcon /> },
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button key={tab.id} className={`nav-btn ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

function HomeIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>;
}
function GroupIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>;
}
function ProfileIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>;
}
