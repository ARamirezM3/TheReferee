import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabase";

/* ---- Shared toggle components ---- */
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

function InputField({ label, value, onChange, type }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "12px", border: "2px solid var(--border)", borderRadius: 10, fontSize: 14, fontFamily: "Nunito,sans-serif", color: "var(--text)", outline: "none", background: "white" }}
      />
    </div>
  );
}

/* ---- Panel: Cambiar Datos ---- */
function CambiarDatosPanel({ onClose, userId, initialData, avatarImg, setAvatarImg, onSaved }) {
  const [name, setName] = useState(initialData?.nombre ?? "");
  const [birthDate, setBirthDate] = useState(initialData?.fecha_nacimiento ?? "");
  const [weight, setWeight] = useState(initialData?.peso ?? "");
  const [height, setHeight] = useState(initialData?.altura ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file || !userId) return;
    const ext = file.name.split(".").pop();
    const path = `${userId}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = urlData.publicUrl;
      setAvatarImg(url);
      await supabase.from("usuarios").update({ foto_perfil: url }).eq("id", userId);
    }
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setSaveError("");
    const { error } = await supabase.from("usuarios").update({
      nombre: name,
      fecha_nacimiento: birthDate || null,
      peso: weight ? Number(weight) : null,
      altura: height ? Number(height) : null,
    }).eq("id", userId);
    setSaving(false);
    if (error) { setSaveError("Error al guardar. Inténtalo de nuevo."); return; }
    onSaved?.({ nombre: name, fecha_nacimiento: birthDate, peso: weight, altura: height });
    onClose();
  }

  return (
    <div className="slide-panel" style={{ zIndex: 53 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">Mis datos</h2>
        <span />
      </header>
      <div className="panel-body">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ position: "relative" }}>
            <div
              onClick={() => fileInputRef.current.click()}
              style={{ width: 90, height: 90, borderRadius: "50%", background: "#bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 0 0 4px white, 0 4px 20px rgba(124,58,237,0.2)", cursor: "pointer" }}
            >
              {avatarImg
                ? <img src={avatarImg} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <AvatarSVG />
              }
            </div>
            <button
              onClick={e => { e.stopPropagation(); fileInputRef.current.click(); }}
              style={{ position: "absolute", bottom: 2, right: 2, background: "white", border: "none", borderRadius: "50%", width: 28, height: 28, fontSize: 14, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >📷</button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <InputField label="Nombre" value={name} onChange={setName} type="text" />
          <InputField label="Fecha de nacimiento" value={birthDate} onChange={setBirthDate} type="date" />
          <InputField label="Peso (kg)" value={weight} onChange={setWeight} type="number" />
          <InputField label="Altura (cm)" value={height} onChange={setHeight} type="number" />
        </div>

        {saveError && <div style={{ fontSize: 13, color: "#ef4444", fontWeight: 600, marginTop: 12 }}>{saveError}</div>}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: "100%", background: "#7c3aed", color: "white", border: "none", borderRadius: 12, padding: 14, fontSize: 16, fontWeight: 800, fontFamily: "Nunito,sans-serif", cursor: "pointer", marginTop: 16, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

/* ---- Panel: Preferencias ---- */
function PreferenciasPanel({ onClose, darkMode, setDarkMode, fontSize, setFontSize }) {
  const FONT_OPTIONS = ["Pequeño", "Normal", "Grande", "Muy grande"];
  const fontIndexMap = { small: 0, normal: 1, large: 2, xlarge: 3 };
  const fontSizeKeys = ["small", "normal", "large", "xlarge"];
  const fontIndex = fontIndexMap[fontSize] ?? 1;
  const [idioma, setIdioma] = useState("Español");

  return (
    <div className="slide-panel" style={{ zIndex: 53 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">Preferencias</h2>
        <span />
      </header>
      <div className="panel-body">
        <div className="panel-section-title">Tamaño de fuente</div>
        <div style={{ background: "white", borderRadius: 12, padding: 16, border: "1px solid var(--border)", marginBottom: 16 }}>
          <input
            type="range"
            min={0} max={3} step={1}
            value={fontIndex}
            onChange={e => setFontSize(fontSizeKeys[parseInt(e.target.value)])}
            style={{ width: "100%", accentColor: "#7c3aed" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {FONT_OPTIONS.map((opt, i) => (
              <span key={opt} style={{ fontSize: 11, fontWeight: fontIndex === i ? 800 : 600, color: fontIndex === i ? "#7c3aed" : "var(--text-muted)" }}>{opt}</span>
            ))}
          </div>
        </div>

        <div className="panel-section-title">Idioma</div>
        <div style={{ background: "white", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 16, display: "flex" }}>
          {["Español", "English"].map(lang => (
            <button
              key={lang}
              onClick={() => setIdioma(lang)}
              style={{ flex: 1, padding: "12px 0", border: "none", cursor: "pointer", background: idioma === lang ? "#7c3aed" : "white", color: idioma === lang ? "white" : "var(--text)", fontWeight: 700, fontSize: 14, fontFamily: "Nunito,sans-serif", transition: "background 0.2s, color 0.2s" }}
            >{lang}</button>
          ))}
        </div>

        <div className="panel-section-title">Apariencia</div>
        <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          <ToggleRow label="Modo oscuro" on={darkMode} onChange={setDarkMode} last />
        </div>
      </div>
    </div>
  );
}

/* ---- Panel: Notificaciones (preferencias) ---- */
function NotificacionesPanel({ onClose }) {
  const [notifs, setNotifs] = useState({
    amistad: true, aceptada: true, grupo: true,
    nuevoTest: false, recordatorio: false, foto: true, nuevaPersona: false,
  });
  function toggle(key) { setNotifs(p => ({ ...p, [key]: !p[key] })); }
  const items = [
    { key: "amistad", label: "Solicitudes de amistad" },
    { key: "aceptada", label: "Solicitudes aceptadas" },
    { key: "grupo", label: "Añadido a un grupo" },
    { key: "nuevoTest", label: "Nuevo test en un grupo" },
    { key: "recordatorio", label: "Recordatorios de tomar test" },
    { key: "foto", label: "Nueva foto en un grupo" },
    { key: "nuevaPersona", label: "Nueva persona añadida al grupo" },
  ];
  return (
    <div className="slide-panel" style={{ zIndex: 53 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">Notificaciones</h2>
        <span />
      </header>
      <div className="panel-body">
        <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          {items.map((item, i) => (
            <ToggleRow key={item.key} label={item.label} on={notifs[item.key]} onChange={() => toggle(item.key)} last={i === items.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Avatar SVG ---- */
function AvatarSVG() {
  return (
    <svg viewBox="0 0 100 100" width="72" height="72">
      <circle cx="50" cy="35" r="22" fill="#f0c27f" />
      <rect x="20" y="58" width="60" height="42" rx="12" fill="#2ecc71" />
      <circle cx="50" cy="35" r="18" fill="#f5d5a0" />
      <path d="M32 32 Q50 20 68 32" fill="#6b3a1f" />
      <circle cx="42" cy="37" r="3" fill="#333" />
      <circle cx="58" cy="37" r="3" fill="#333" />
      <path d="M43 47 Q50 53 57 47" stroke="#c0856b" strokeWidth="2" fill="none" />
    </svg>
  );
}

const MENU_ITEMS = [
  { label: "Cambiar Datos", panel: "cambiarDatos" },
  { label: "Preferencias", panel: "preferencias" },
  { label: "Notificaciones", panel: "notificaciones" },
  { label: "Valora la app", panel: null },
  { label: "Términos legales", panel: null },
];

export default function ProfileScreen({ onHamburger, darkMode, setDarkMode, fontSize, setFontSize, currentUser }) {
  const [activePanel, setActivePanel] = useState(null);
  const [avatarImg, setAvatarImg] = useState(null);
  const [userData, setUserData] = useState({ nombre: "", email: currentUser?.email ?? "", foto_perfil: "", fecha_nacimiento: "", peso: "", altura: "" });

  useEffect(() => {
    if (!currentUser?.id) return;
    supabase.from("usuarios").select("nombre,email,foto_perfil,fecha_nacimiento,peso,altura").eq("id", currentUser.id).single()
      .then(({ data }) => {
        if (!data) return;
        setUserData({
          nombre: data.nombre ?? "",
          email: data.email ?? currentUser.email ?? "",
          foto_perfil: data.foto_perfil ?? "",
          fecha_nacimiento: data.fecha_nacimiento ?? "",
          peso: data.peso ?? "",
          altura: data.altura ?? "",
        });
        if (data.foto_perfil) setAvatarImg(data.foto_perfil);
      });
  }, [currentUser?.id]);

  return (
    <div className="screen">
      <header className="app-header">
        <span className="hamburger" onClick={onHamburger}>&#9776;</span>
        <h1 className="app-title">TheReferee</h1>
        <span />
      </header>

      <div className="profile-avatar-section">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {avatarImg
              ? <img src={avatarImg} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <AvatarSVG />
            }
          </div>
          <button className="camera-btn" onClick={() => setActivePanel("cambiarDatos")}>📷</button>
        </div>
        <div className="profile-name">{userData.nombre || "—"}</div>
        <div className="profile-email">{userData.email}</div>
      </div>

      <div className="profile-menu">
        {MENU_ITEMS.map((item) => (
          <button key={item.label} className="menu-item" onClick={() => item.panel && setActivePanel(item.panel)}>
            <span>{item.label}</span>
            <span className="menu-arrow">›</span>
          </button>
        ))}
      </div>

      {activePanel === "cambiarDatos" && (
        <CambiarDatosPanel
          onClose={() => setActivePanel(null)}
          userId={currentUser?.id}
          initialData={userData}
          avatarImg={avatarImg}
          setAvatarImg={setAvatarImg}
          onSaved={(updated) => setUserData(d => ({ ...d, ...updated }))}
        />
      )}
      {activePanel === "preferencias" && (
        <PreferenciasPanel
          onClose={() => setActivePanel(null)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          fontSize={fontSize}
          setFontSize={setFontSize}
        />
      )}
      {activePanel === "notificaciones" && (
        <NotificacionesPanel onClose={() => setActivePanel(null)} />
      )}
    </div>
  );
}
