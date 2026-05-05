import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabase";

const AVATAR_COLORS = ["#3498db", "#e91e8c", "#e67e22", "#9b59b6", "#2ecc71"];

function getBarWidth(value) {
  return Math.max(4, Math.round((value / 1.0) * 100));
}

function getBarColor(value) {
  if (value > 0.5) return "#e74c3c";
  if (value > 0.25) return "#e67e22";
  return "#2ecc71";
}

function userInitials(nombre) {
  if (!nombre) return "?";
  return nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function avatarColor(id) {
  if (!id) return "#7c3aed";
  return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
}

function UserAvatar({ user, size = 40 }) {
  const bg = avatarColor(user.id);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
      {user.foto_perfil
        ? <img src={user.foto_perfil} alt={user.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ color: "white", fontWeight: 800, fontSize: Math.round(size * 0.325) }}>{userInitials(user.nombre)}</span>}
    </div>
  );
}

function UserRow({ user, isMember, onToggle, isLast }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: isLast ? "none" : "1px solid var(--border)" }}>
      <UserAvatar user={user} />
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{user.nombre}</span>
      <button
        onClick={() => onToggle(user)}
        style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", background: isMember ? "#e5e7eb" : "#7c3aed", color: isMember ? "#374151" : "white", fontSize: 12, fontWeight: 700, fontFamily: "Nunito,sans-serif", transition: "background 0.2s" }}
      >
        {isMember ? "Quitar" : "Añadir"}
      </button>
    </div>
  );
}

function CrearGrupoModal({ onClose, onCreated, currentUser }) {
  const [nombre, setNombre] = useState("");
  const [amigos, setAmigos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    async function fetchAmigos() {
      const [{ data: sent }, { data: received }] = await Promise.all([
        supabase.from("amigos").select("amigo_id").eq("usuario_id", currentUser.id).eq("estado", "aceptado"),
        supabase.from("amigos").select("usuario_id").eq("amigo_id", currentUser.id).eq("estado", "aceptado"),
      ]);
      const ids = [...(sent || []).map(a => a.amigo_id), ...(received || []).map(a => a.usuario_id)];
      if (ids.length === 0) return;
      const { data: usuarios } = await supabase.from("usuarios").select("id, nombre, foto_perfil").in("id", ids);
      if (usuarios) setAmigos(usuarios);
    }
    fetchAmigos();
  }, [currentUser?.id]);

  async function handleSearch() {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    const { data } = await supabase.from("usuarios").select("id, nombre, foto_perfil")
      .or(`nombre.ilike.%${q}%,email.ilike.%${q}%`)
      .neq("id", currentUser.id).limit(5);
    setSearchResults(data || []);
    setSearching(false);
  }

  function toggleMember(user) {
    setSelectedMembers(prev => prev.some(m => m.id === user.id) ? prev.filter(m => m.id !== user.id) : [...prev, user]);
  }

  function isMember(userId) { return selectedMembers.some(m => m.id === userId); }

  async function handleCreate() {
    if (!nombre.trim()) { setError("Escribe un nombre para el grupo"); return; }
    setLoading(true);
    setError("");
    try {
      const { data: grupo, error: grupoError } = await supabase.from("grupos")
        .insert({ nombre: nombre.trim(), creado_por: currentUser.id }).select().single();
      if (grupoError) throw grupoError;
      const memberIds = [currentUser.id, ...selectedMembers.map(m => m.id)];
      const { error: membersError } = await supabase.from("grupo_miembros")
        .insert(memberIds.map(uid => ({ grupo_id: grupo.id, usuario_id: uid })));
      if (membersError) console.error("Error añadiendo miembros:", membersError);
      onCreated(grupo);
    } catch (e) {
      console.error("Error creando grupo:", e);
      setError("Error al crear el grupo: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const sectionHeader = (label) => (
    <div style={{ padding: "8px 16px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", background: "#f9fafb", borderBottom: "1px solid var(--border)" }}>
      {label}
    </div>
  );

  return (
    <div className="slide-panel" style={{ zIndex: 54 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">Crear grupo</h2>
        <span />
      </header>
      <div className="panel-body">
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Nombre del grupo</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Cumpleaños de Ana"
            style={{ width: "100%", padding: "12px 14px", border: "2px solid var(--border)", borderRadius: 10, fontSize: 14, fontFamily: "Nunito,sans-serif", color: "var(--text)", outline: "none", background: "white", boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 12, fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Añadir miembros</div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Buscar por nombre o email..."
            style={{ flex: 1, padding: "11px 14px", border: "2px solid var(--border)", borderRadius: 10, fontSize: 14, fontFamily: "Nunito,sans-serif", color: "var(--text)", outline: "none", background: "white" }} />
          <button onClick={handleSearch} disabled={searching}
            style={{ width: 44, height: 44, borderRadius: 10, background: "#7c3aed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: searching ? 0.7 : 1 }}>
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
          </button>
        </div>

        {searchResults.length > 0 && (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 16 }}>
            {sectionHeader("Resultados")}
            {searchResults.map((u, i) => <UserRow key={u.id} user={u} isMember={isMember(u.id)} onToggle={toggleMember} isLast={i === searchResults.length - 1} />)}
          </div>
        )}

        {amigos.length > 0 && (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 16 }}>
            {sectionHeader("Tus amigos")}
            {amigos.map((u, i) => <UserRow key={u.id} user={u} isMember={isMember(u.id)} onToggle={toggleMember} isLast={i === amigos.length - 1} />)}
          </div>
        )}

        {amigos.length === 0 && searchResults.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: "12px 0 20px" }}>Usa el buscador para añadir miembros</p>
        )}

        {selectedMembers.length > 0 && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "#ede9fe", borderRadius: 10, fontSize: 13, color: "#7c3aed", fontWeight: 700 }}>
            {selectedMembers.length} miembro{selectedMembers.length !== 1 ? "s" : ""} seleccionado{selectedMembers.length !== 1 ? "s" : ""}
          </div>
        )}

        {error && <div style={{ fontSize: 13, color: "#ef4444", marginBottom: 12, fontWeight: 600 }}>{error}</div>}

        <button onClick={handleCreate} disabled={loading}
          style={{ width: "100%", background: "#7c3aed", color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 800, fontFamily: "Nunito,sans-serif", cursor: "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
          {loading ? "Creando..." : "Crear grupo"}
        </button>
      </div>
    </div>
  );
}

export default function GroupScreen({ onHamburger, currentUser }) {
  const [grupos, setGrupos] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("drinks");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const optionsRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    async function loadGroups() {
      const { data: rows } = await supabase.from("grupo_miembros").select("grupo_id").eq("usuario_id", currentUser.id);
      if (!rows || rows.length === 0) { setGrupos([]); return; }
      const ids = rows.map(r => r.grupo_id);
      const { data: groupData } = await supabase.from("grupos").select("id, nombre, created_at, creado_por").in("id", ids).order("created_at", { ascending: false });
      const list = groupData || [];
      setGrupos(list);
      if (list.length > 0) setSelectedGroup(list[0]);
    }
    loadGroups();
  }, [currentUser?.id]);

  useEffect(() => {
    if (!selectedGroup) { setMembers([]); return; }
    async function loadMembers() {
      const { data: rows } = await supabase.from("grupo_miembros").select("usuario_id").eq("grupo_id", selectedGroup.id);
      if (!rows || rows.length === 0) { setMembers([]); return; }
      const ids = rows.map(r => r.usuario_id);
      const { data: users } = await supabase.from("usuarios").select("id, nombre, foto_perfil").in("id", ids);
      setMembers((users || []).map(u => ({ ...u, value: 0, time: "—" })));
    }
    loadMembers();
  }, [selectedGroup?.id]);

  useEffect(() => {
    if (!showOptions) return;
    function handleClick(e) {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) setShowOptions(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showOptions]);

  function handleGroupCreated(grupo) {
    setGrupos(prev => [grupo, ...(prev || [])]);
    setSelectedGroup(grupo);
    setShowCreateGroup(false);
  }

  function handleLoadTest() {
    if (!currentUser) return;
    const newValue = parseFloat(Math.random().toFixed(2));
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}, Hoy`;
    setMembers(prev =>
      prev.map(p => p.id === currentUser.id ? { ...p, value: newValue, time: timeStr } : p)
        .sort((a, b) => b.value - a.value)
    );
  }

  const worstDrunk = members.length > 0 ? members.reduce((a, b) => (a.value > b.value ? a : b)) : null;

  const createdAt = selectedGroup?.created_at
    ? new Date(selectedGroup.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="screen">
      <header className="app-header">
        <span className="hamburger" onClick={onHamburger}>&#9776;</span>
        <h1 className="app-title">TheReferee</h1>
        <span />
      </header>

      {grupos === null && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Cargando...</p>
        </div>
      )}

      {grupos !== null && grupos.length === 0 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
          <img src="/images/logo.png" alt="TheReferee" style={{ height: 64, objectFit: "contain", marginBottom: 16 }} />
          <div style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: 24, color: "#7c3aed", letterSpacing: 2, marginBottom: 8 }}>TheReferee</div>
          <div style={{ fontSize: 15, color: "#6b7280", marginBottom: 28 }}>Crea tu primer grupo</div>
          <button
            onClick={() => setShowCreateGroup(true)}
            style={{ background: "#7c3aed", color: "white", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 16, fontWeight: 800, fontFamily: "Nunito,sans-serif", cursor: "pointer" }}
          >
            + Crear grupo
          </button>
        </div>
      )}

      {grupos !== null && grupos.length > 0 && (
        <>
          <div className="event-section">
            <div className="event-row">
              <div className="event-dropdown-wrap">
                <button className="event-dropdown-btn" onClick={() => setShowDropdown(v => !v)}>
                  {selectedGroup?.nombre || "Seleccionar grupo"} <span className="arrow">▼</span>
                </button>
                {showDropdown && (
                  <div className="dropdown-menu">
                    {grupos.map(g => (
                      <div key={g.id} className="dropdown-item" onClick={() => { setSelectedGroup(g); setShowDropdown(false); }}>
                        {g.nombre}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="add-event-btn" onClick={() => setShowCreateGroup(true)}>+</button>
              <div className="options-wrap" ref={optionsRef}>
                <button className="options-btn" onClick={() => setShowOptions(v => !v)}>···</button>
                {showOptions && (
                  <div className="options-menu">
                    <div className="dropdown-item" onClick={() => setShowOptions(false)}>Administrar grupo</div>
                    <div className="dropdown-item" onClick={() => { setShowOptions(false); setShowCreateGroup(true); }}>Añadir miembros</div>
                    <div className="dropdown-item" onClick={() => setShowOptions(false)}>Invitar por enlace o QR</div>
                  </div>
                )}
              </div>
            </div>

            <div className="event-meta">Creado: {createdAt}</div>

            <div className="sub-tabs">
              <button className={`sub-tab-btn${activeSubTab === "drinks" ? " active" : ""}`} onClick={() => setActiveSubTab("drinks")}><CupIcon /></button>
              <button className={`sub-tab-btn${activeSubTab === "photos" ? " active" : ""}`} onClick={() => setActiveSubTab("photos")}><GroupPhotoIcon /></button>
              <div className={`sub-tab-indicator${activeSubTab === "photos" ? " right" : ""}`} />
            </div>

            {activeSubTab === "drinks" && (
              <div className="tab-panel">
                {worstDrunk && worstDrunk.value > 0 && (
                  <div className="penalty-row">
                    <span className="penalty-emoji">😡</span>
                    <span className="penalty-text"><b>{worstDrunk.nombre}</b> paga el Uber</span>
                    <span className="bottle-small">🍾</span>
                  </div>
                )}
                <button className="load-test-btn" onClick={handleLoadTest}>Cargar test</button>
              </div>
            )}
          </div>

          {activeSubTab === "drinks" && (
            <div className="participants-list tab-panel">
              {members.length === 0 && (
                <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "20px 0" }}>No hay miembros en este grupo</p>
              )}
              {members.map(p => (
                <div key={p.id} className="participant-row">
                  <UserAvatar user={p} size={38} />
                  <div className="participant-info">
                    <div className="participant-name">{p.nombre}</div>
                    <div className="bar-wrap">
                      <div className="bar-fill" style={{ width: `${getBarWidth(p.value)}%`, background: getBarColor(p.value) }} />
                    </div>
                  </div>
                  <div className="participant-result">
                    <span className="result-big">{p.value.toFixed(2)}</span>
                    <span className="result-gl"> g/L</span>
                    <div className="result-time">{p.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSubTab === "photos" && (
            <div className="photos-empty tab-panel">
              <p>Aún no hay fotos en este evento</p>
            </div>
          )}
        </>
      )}

      {showCreateGroup && (
        <CrearGrupoModal onClose={() => setShowCreateGroup(false)} onCreated={handleGroupCreated} currentUser={currentUser} />
      )}
    </div>
  );
}

function CupIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M20 3H4v2l6.5 9V19H8v2h8v-2h-2.5v-5L20 5V3z" /></svg>;
}
function GroupPhotoIcon() {
  return <div className="group-photo-icon">GR</div>;
}
