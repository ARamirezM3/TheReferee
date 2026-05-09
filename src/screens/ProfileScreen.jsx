import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabase";
import { getT } from "../i18n";

const AVATAR_COLORS = ["#3498db", "#e91e8c", "#e67e22", "#9b59b6", "#2ecc71"];
function avatarColor(id) {
  if (!id) return "#7c3aed";
  return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 44, height: 24, borderRadius: 12, background: on ? "#7c3aed" : "#d1d5db", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
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

function InputField({ label, value, onChange, type }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "12px", border: "2px solid var(--border)", borderRadius: 10, fontSize: 14, fontFamily: "Nunito,sans-serif", color: "var(--text)", outline: "none", background: "var(--input-bg)" }} />
    </div>
  );
}

/* ---- Panel: Cambiar Datos ---- */
function CambiarDatosPanel({ onClose, userId, initialData, avatarImg, setAvatarImg, onSaved, lang }) {
  const t = getT(lang);
  const [name, setName] = useState(initialData?.usuario ?? "");
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
      const url = urlData.publicUrl + "?t=" + Date.now();
      setAvatarImg(url);
      await supabase.from("usuarios").update({ foto_perfil: urlData.publicUrl }).eq("id", userId);
    }
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setSaveError("");
    const { error } = await supabase.from("usuarios").update({
      usuario: name.trim(),
      fecha_nacimiento: birthDate || null,
      peso: weight ? Number(weight) : null,
      altura: height ? Number(height) : null,
    }).eq("id", userId);
    setSaving(false);
    if (error) { setSaveError(t.errorSaving); return; }
    onSaved?.({ usuario: name.trim(), fecha_nacimiento: birthDate, peso: weight, altura: height });
    onClose();
  }

  const letter = (name || "?")[0].toUpperCase();
  const bg = avatarColor(userId);

  return (
    <div className="slide-panel" style={{ zIndex: 53 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.myData}</h2>
        <span />
      </header>
      <div className="panel-body">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ position: "relative" }}>
            <div onClick={() => fileInputRef.current.click()}
              style={{ width: 90, height: 90, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 0 0 4px white, 0 4px 20px rgba(124,58,237,0.2)", cursor: "pointer" }}>
              {avatarImg
                ? <img src={avatarImg} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ color: "white", fontWeight: 800, fontSize: 36 }}>{letter}</span>}
            </div>
            <button onClick={e => { e.stopPropagation(); fileInputRef.current.click(); }}
              style={{ position: "absolute", bottom: 2, right: 2, background: "white", border: "none", borderRadius: "50%", width: 28, height: 28, fontSize: 14, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>📷</button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <InputField label={t.usernameField} value={name} onChange={val => setName(val.slice(0, 30))} type="text" />
          <InputField label={t.birthDateField} value={birthDate} onChange={setBirthDate} type="date" />
          <InputField label={t.weightField} value={weight} onChange={setWeight} type="number" />
          <InputField label={t.heightField} value={height} onChange={setHeight} type="number" />
        </div>
        {saveError && <div style={{ fontSize: 13, color: "#ef4444", fontWeight: 600, marginTop: 12 }}>{saveError}</div>}
        <button onClick={handleSave} disabled={saving}
          style={{ width: "100%", background: "#7c3aed", color: "white", border: "none", borderRadius: 12, padding: 14, fontSize: 16, fontWeight: 800, fontFamily: "Nunito,sans-serif", cursor: "pointer", marginTop: 16, opacity: saving ? 0.7 : 1 }}>
          {saving ? t.saving : t.saveChanges}
        </button>
      </div>
    </div>
  );
}

/* ---- Panel: Preferencias ---- */
function PreferenciasPanel({ onClose, darkMode, setDarkMode, fontSize, setFontSize, lang, setLang }) {
  const t = getT(lang);
  const FONT_OPTIONS = [t.fontSmall, t.fontNormal, t.fontLarge, t.fontXlarge];
  const fontIndexMap = { small: 0, normal: 1, large: 2, xlarge: 3 };
  const fontSizeKeys = ["small", "normal", "large", "xlarge"];
  const fontIndex = fontIndexMap[fontSize] ?? 1;

  function handleLangChange(newLang) {
    setLang(newLang);
    localStorage.setItem("thereferee_lang", newLang);
  }

  return (
    <div className="slide-panel" style={{ zIndex: 53 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.preferences}</h2>
        <span />
      </header>
      <div className="panel-body">
        <div className="panel-section-title">{t.fontSizeLabel}</div>
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: 16, border: "1px solid var(--border)", marginBottom: 16 }}>
          <input type="range" min={0} max={3} step={1} value={fontIndex} onChange={e => setFontSize(fontSizeKeys[parseInt(e.target.value)])} style={{ width: "100%", accentColor: "#7c3aed" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {FONT_OPTIONS.map((opt, i) => (
              <span key={opt} style={{ fontSize: 11, fontWeight: fontIndex === i ? 800 : 600, color: fontIndex === i ? "#7c3aed" : "var(--text-muted)" }}>{opt}</span>
            ))}
          </div>
        </div>
        <div className="panel-section-title">{t.languageLabel}</div>
        <div style={{ background: "var(--surface)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 16, display: "flex" }}>
          {[["es", "Español"], ["en", "English"]].map(([code, label]) => (
            <button key={code} onClick={() => handleLangChange(code)}
              style={{ flex: 1, padding: "12px 0", border: "none", cursor: "pointer", background: lang === code ? "#7c3aed" : "var(--surface)", color: lang === code ? "white" : "var(--text)", fontWeight: 700, fontSize: 14, fontFamily: "Nunito,sans-serif", transition: "background 0.2s, color 0.2s" }}>
              {label}
            </button>
          ))}
        </div>
        <div className="panel-section-title">{t.appearanceLabel}</div>
        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          <ToggleRow label={t.darkModeLabel} on={darkMode} onChange={setDarkMode} last />
        </div>
      </div>
    </div>
  );
}

/* ---- Panel: Notificaciones (preferencias) ---- */
function NotificacionesPanel({ onClose, lang }) {
  const t = getT(lang);
  const [notifs, setNotifs] = useState({ amistad: true, aceptada: true, grupo: true, nuevoTest: false, recordatorio: false, foto: true, nuevaPersona: false });
  function toggle(key) { setNotifs(p => ({ ...p, [key]: !p[key] })); }
  const items = [
    { key: "amistad", label: t.notifFriendRequest },
    { key: "aceptada", label: t.notifAccepted },
    { key: "grupo", label: t.notifGroup },
    { key: "nuevoTest", label: t.notifNewTest },
    { key: "recordatorio", label: t.notifReminder },
    { key: "foto", label: t.notifPhoto },
    { key: "nuevaPersona", label: t.notifNewPerson },
  ];
  return (
    <div className="slide-panel" style={{ zIndex: 53 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.notifSettings}</h2>
        <span />
      </header>
      <div className="panel-body">
        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          {items.map((item, i) => (
            <ToggleRow key={item.key} label={item.label} on={notifs[item.key]} onChange={() => toggle(item.key)} last={i === items.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Panel: Términos legales ---- */
function TerminosLegalesPanel({ onClose, lang }) {
  const t = getT(lang);
  const sections = [
    { title: "Política de privacidad", body: null },
    { title: "Quiénes somos", body: "Somos un grupo de estudiantes desarrollando TheReferee, un proyecto tecnológico cuyo objetivo es mejorar la seguridad en entornos sociales mediante el uso de un alcoholímetro conectado a una aplicación móvil. Nuestro propósito es ofrecer una herramienta útil, accesible y responsable para el control del consumo de alcohol." },
    { title: "Comentarios", body: "Cuando los usuarios dejan comentarios en nuestra web, recopilamos la información introducida en el formulario, junto con la dirección IP y los datos del navegador, con el fin de prevenir el spam." },
    { title: "Medios", body: "En caso de subir imágenes a la web, se recomienda evitar aquellas que contengan datos de localización incrustados (EXIF GPS)." },
    { title: "Cookies", body: "Si dejas un comentario, puedes elegir guardar tu nombre, correo electrónico y sitio web en cookies para facilitar futuras interacciones. Estas cookies tendrán una duración de un año." },
    { title: "Contenido incrustado", body: "El contenido de este sitio puede incluir elementos incrustados como vídeos, imágenes o artículos. Este tipo de contenido se comporta como si el usuario accediera directamente a la web de origen." },
    { title: "Con quién compartimos tus datos", body: "En caso de solicitar un cambio de contraseña, la dirección IP del usuario se incluirá en el correo electrónico correspondiente por motivos de seguridad." },
    { title: "Cuánto tiempo conservamos tus datos", body: "Los comentarios realizados se almacenan de forma indefinida. Los usuarios registrados pueden consultar, modificar o eliminar sus datos en cualquier momento." },
    { title: "Qué derechos tienes sobre tus datos", body: "Puedes solicitar un archivo con tus datos personales o pedir su eliminación, salvo los que deban conservarse por razones legales." },
    { title: "Dónde se envían tus datos", body: "Los comentarios pueden ser analizados mediante sistemas automáticos destinados a la detección de spam." },
  ];

  return (
    <div className="slide-panel" style={{ zIndex: 53 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.legalTerms}</h2>
        <span />
      </header>
      <div className="panel-body">
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: i === 0 ? 17 : 14, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>{s.title}</div>
            {s.body && <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65 }}>{s.body}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- Cambio #11: Eliminado "Valora la app" del menú --- */
const MENU_ITEMS = [
  { key: "editData", panel: "cambiarDatos" },
  { key: "preferences", panel: "preferencias" },
  { key: "notifSettings", panel: "notificaciones" },
  { key: "legalTerms", panel: "terminos" },
];

export default function ProfileScreen({ onHamburger, darkMode, setDarkMode, fontSize, setFontSize, currentUser, lang, setLang }) {
  const t = getT(lang);
  const [activePanel, setActivePanel] = useState(null);
  const [avatarImg, setAvatarImg] = useState(null);
  const [userData, setUserData] = useState({ usuario: "", email: currentUser?.email ?? "", foto_perfil: "", fecha_nacimiento: "", peso: "", altura: "" });

  useEffect(() => {
    if (!currentUser?.id) return;
    supabase.from("usuarios").select("usuario,email,foto_perfil,fecha_nacimiento,peso,altura").eq("id", currentUser.id).single()
      .then(({ data }) => {
        if (!data) return;
        setUserData({
          usuario: data.usuario ?? "",
          email: data.email ?? currentUser.email ?? "",
          foto_perfil: data.foto_perfil ?? "",
          fecha_nacimiento: data.fecha_nacimiento ?? "",
          peso: data.peso ?? "",
          altura: data.altura ?? "",
        });
        if (data.foto_perfil) setAvatarImg(data.foto_perfil);
      });
  }, [currentUser?.id]);

  const avatarBg = avatarColor(currentUser?.id);
  const avatarLetter = (userData.usuario || currentUser?.email || "?")[0].toUpperCase();

  return (
    <div className="screen">
      <header className="app-header">
        <span className="hamburger" onClick={onHamburger}>&#9776;</span>
        <h1 className="app-title">TheReferee</h1>
        <span />
      </header>

      <div className="profile-avatar-section">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar" style={{ overflow: "hidden", background: avatarImg ? "transparent" : avatarBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {avatarImg
              ? <img src={avatarImg} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ color: "white", fontWeight: 800, fontSize: 40 }}>{avatarLetter}</span>}
          </div>
          <button className="camera-btn" onClick={() => setActivePanel("cambiarDatos")}>📷</button>
        </div>
        <div className="profile-name">{userData.usuario || "—"}</div>
        <div className="profile-email">{userData.email}</div>
      </div>

      <div className="profile-menu">
        {MENU_ITEMS.map((item) => (
          <button key={item.key} className="menu-item" onClick={() => item.panel && setActivePanel(item.panel)}>
            <span>{t[item.key]}</span>
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
          lang={lang}
        />
      )}
      {activePanel === "preferencias" && (
        <PreferenciasPanel
          onClose={() => setActivePanel(null)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          fontSize={fontSize}
          setFontSize={setFontSize}
          lang={lang}
          setLang={setLang}
        />
      )}
      {activePanel === "notificaciones" && <NotificacionesPanel onClose={() => setActivePanel(null)} lang={lang} />}
      {activePanel === "terminos" && <TerminosLegalesPanel onClose={() => setActivePanel(null)} lang={lang} />}
    </div>
  );
}
