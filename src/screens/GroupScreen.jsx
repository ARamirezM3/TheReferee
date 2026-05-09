import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabase";
import { getT } from "../i18n";

const AVATAR_COLORS = ["#3498db", "#e91e8c", "#e67e22", "#9b59b6", "#2ecc71"];

function getBarWidth(value) {
  return Math.max(4, Math.round((value / 1.0) * 100));
}

function getBarColor(value) {
  if (value >= 0.6) return "#e74c3c";
  if (value >= 0.2) return "#e67e22";
  return "#2ecc71";
}

function avatarColor(id) {
  if (!id) return "#7c3aed";
  return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
}

function UserAvatar({ user, size = 40 }) {
  const bg = avatarColor(user?.id);
  const letter = (user?.usuario || "?")[0].toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
      {user?.foto_perfil
        ? <img src={user.foto_perfil} alt={user.usuario} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ color: "white", fontWeight: 800, fontSize: Math.round(size * 0.325) }}>{letter}</span>}
    </div>
  );
}

function UserRow({ user, isMember, onToggle, isLast, lang }) {
  const t = getT(lang);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: isLast ? "none" : "1px solid var(--border)" }}>
      <UserAvatar user={user} />
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{user.usuario}</span>
      <button
        onClick={() => onToggle(user)}
        style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", background: isMember ? "#e5e7eb" : "#7c3aed", color: isMember ? "#374151" : "white", fontSize: 12, fontWeight: 700, fontFamily: "Nunito,sans-serif", transition: "background 0.2s" }}
      >
        {isMember ? t.remove : t.add}
      </button>
    </div>
  );
}

const sectionHeader = (label) => (
  <div style={{ padding: "8px 16px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", background: "var(--surface-dim)", borderBottom: "1px solid var(--border)" }}>
    {label}
  </div>
);

/* ---- Modal: Crear grupo ---- */
function CrearGrupoModal({ onClose, onCreated, currentUser, lang }) {
  const t = getT(lang);
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
      const { data: usuarios } = await supabase.from("usuarios").select("id, usuario, foto_perfil").in("id", ids);
      if (usuarios) setAmigos(usuarios);
    }
    fetchAmigos();
  }, [currentUser?.id]);

  async function handleSearch() {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    const { data } = await supabase.from("usuarios").select("id, usuario, foto_perfil")
      .ilike("usuario", `%${q}%`)
      .neq("id", currentUser.id).limit(5);
    setSearchResults(data || []);
    setSearching(false);
  }

  function toggleMember(user) {
    setSelectedMembers(prev => prev.some(m => m.id === user.id) ? prev.filter(m => m.id !== user.id) : [...prev, user]);
  }

  function isMember(userId) { return selectedMembers.some(m => m.id === userId); }

  async function handleCreate() {
    if (!nombre.trim()) { setError(t.groupNameLabel + " requerido"); return; }
    setLoading(true);
    setError("");
    try {
      const { data: grupo, error: grupoError } = await supabase.from("grupos")
        .insert({ nombre: nombre.trim(), creado_por: currentUser.id }).select().single();
      if (grupoError) throw grupoError;
      const memberIds = [currentUser.id, ...selectedMembers.map(m => m.id)];
      await supabase.from("grupo_miembros")
        .insert(memberIds.map(uid => ({ grupo_id: grupo.id, usuario_id: uid })));
      onCreated(grupo);
    } catch (e) {
      setError(t.errorCreatingGroup + " " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const selCount = selectedMembers.length;
  const selLabel = selCount === 1 ? `1 ${t.membersSelected}` : `${selCount} ${t.membersSelectedPlural}`;

  return (
    <div className="slide-panel" style={{ zIndex: 54 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.createGroupAction}</h2>
        <span />
      </header>
      <div className="panel-body">
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.groupNameLabel}</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder={t.groupNameLabel}
            style={{ width: "100%", padding: "12px 14px", border: "2px solid var(--border)", borderRadius: 10, fontSize: 14, fontFamily: "Nunito,sans-serif", color: "var(--text)", outline: "none", background: "var(--input-bg)", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 12, fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.addMembersTitle}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder={t.searchByUser}
            style={{ flex: 1, padding: "11px 14px", border: "2px solid var(--border)", borderRadius: 10, fontSize: 14, fontFamily: "Nunito,sans-serif", color: "var(--text)", outline: "none", background: "var(--input-bg)" }} />
          <button onClick={handleSearch} disabled={searching}
            style={{ width: 44, height: 44, borderRadius: 10, background: "#7c3aed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: searching ? 0.7 : 1 }}>
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
          </button>
        </div>
        {searchResults.length > 0 && (
          <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 16 }}>
            {sectionHeader(t.searchResults)}
            {searchResults.map((u, i) => <UserRow key={u.id} user={u} isMember={isMember(u.id)} onToggle={toggleMember} isLast={i === searchResults.length - 1} lang={lang} />)}
          </div>
        )}
        {amigos.length > 0 && (
          <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 16 }}>
            {sectionHeader(t.yourFriends)}
            {amigos.map((u, i) => <UserRow key={u.id} user={u} isMember={isMember(u.id)} onToggle={toggleMember} isLast={i === amigos.length - 1} lang={lang} />)}
          </div>
        )}
        {amigos.length === 0 && searchResults.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: "12px 0 20px" }}>{t.useSearchAdd}</p>
        )}
        {selCount > 0 && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "#ede9fe", borderRadius: 10, fontSize: 13, color: "#7c3aed", fontWeight: 700 }}>
            {selLabel}
          </div>
        )}
        {error && <div style={{ fontSize: 13, color: "#ef4444", marginBottom: 12, fontWeight: 600 }}>{error}</div>}
        <button onClick={handleCreate} disabled={loading}
          style={{ width: "100%", background: "#7c3aed", color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 800, fontFamily: "Nunito,sans-serif", cursor: "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
          {loading ? t.creatingGroup : t.createGroupAction}
        </button>
      </div>
    </div>
  );
}

/* ---- Modal: Añadir miembros ---- */
function AñadirMiembrosModal({ onClose, currentUser, grupoId, currentMemberIds, onMembersAdded, lang }) {
  const t = getT(lang);
  const [amigos, setAmigos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    async function fetchAmigos() {
      const [{ data: sent }, { data: received }] = await Promise.all([
        supabase.from("amigos").select("amigo_id").eq("usuario_id", currentUser.id).eq("estado", "aceptado"),
        supabase.from("amigos").select("usuario_id").eq("amigo_id", currentUser.id).eq("estado", "aceptado"),
      ]);
      const ids = [...(sent || []).map(a => a.amigo_id), ...(received || []).map(a => a.usuario_id)]
        .filter(id => !currentMemberIds.includes(id));
      if (ids.length === 0) return;
      const { data: usuarios } = await supabase.from("usuarios").select("id, usuario, foto_perfil").in("id", ids);
      if (usuarios) setAmigos(usuarios);
    }
    fetchAmigos();
  }, [currentUser?.id]);

  async function handleSearch() {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    const { data } = await supabase.from("usuarios").select("id, usuario, foto_perfil")
      .ilike("usuario", `%${q}%`)
      .neq("id", currentUser.id).limit(5);
    setSearchResults((data || []).filter(u => !currentMemberIds.includes(u.id)));
    setSearching(false);
  }

  function toggleMember(user) {
    setSelectedMembers(prev => prev.some(m => m.id === user.id) ? prev.filter(m => m.id !== user.id) : [...prev, user]);
  }

  function isMember(userId) { return selectedMembers.some(m => m.id === userId); }

  async function handleAdd() {
    if (selectedMembers.length === 0) return;
    setLoading(true);
    await supabase.from("grupo_miembros")
      .insert(selectedMembers.map(m => ({ grupo_id: grupoId, usuario_id: m.id })));
    setLoading(false);
    onMembersAdded(selectedMembers);
    onClose();
  }

  const selCount = selectedMembers.length;
  const selLabel = selCount === 1 ? `1 ${t.membersSelected}` : `${selCount} ${t.membersSelectedPlural}`;
  const addLabel = loading ? t.addingMembers : selCount > 0 ? selLabel : t.addMembersTitle;

  return (
    <div className="slide-panel" style={{ zIndex: 54 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.addMembersTitle}</h2>
        <span />
      </header>
      <div className="panel-body">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder={t.searchByUser}
            style={{ flex: 1, padding: "11px 14px", border: "2px solid var(--border)", borderRadius: 10, fontSize: 14, fontFamily: "Nunito,sans-serif", color: "var(--text)", outline: "none", background: "var(--input-bg)" }} />
          <button onClick={handleSearch} disabled={searching}
            style={{ width: 44, height: 44, borderRadius: 10, background: "#7c3aed", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: searching ? 0.7 : 1 }}>
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
          </button>
        </div>
        {searchResults.length > 0 && (
          <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 16 }}>
            {sectionHeader(t.searchResults)}
            {searchResults.map((u, i) => <UserRow key={u.id} user={u} isMember={isMember(u.id)} onToggle={toggleMember} isLast={i === searchResults.length - 1} lang={lang} />)}
          </div>
        )}
        {amigos.length > 0 && (
          <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 16 }}>
            {sectionHeader(t.nonMembers)}
            {amigos.map((u, i) => <UserRow key={u.id} user={u} isMember={isMember(u.id)} onToggle={toggleMember} isLast={i === amigos.length - 1} lang={lang} />)}
          </div>
        )}
        {amigos.length === 0 && searchResults.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: "12px 0 20px" }}>{t.useSearchFind}</p>
        )}
        {selCount > 0 && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "#ede9fe", borderRadius: 10, fontSize: 13, color: "#7c3aed", fontWeight: 700 }}>
            {selLabel}
          </div>
        )}
        <button onClick={handleAdd} disabled={loading || selCount === 0}
          style={{ width: "100%", background: "#7c3aed", color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 800, fontFamily: "Nunito,sans-serif", cursor: "pointer", opacity: (loading || selCount === 0) ? 0.5 : 1, marginTop: 4 }}>
          {addLabel}
        </button>
      </div>
    </div>
  );
}

/* ---- Modal: Unirse por código ---- */
function UnirseGrupoModal({ onClose, currentUser, onJoined, lang }) {
  const t = getT(lang);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin() {
    const c = code.trim();
    if (!c) return;
    setLoading(true);
    setError("");
    const { data: grupos } = await supabase.from("grupos")
      .select("id, nombre, created_at, creado_por, codigo_invitacion, imagen_url")
      .ilike("codigo_invitacion", `${c}%`);
    const grupo = (grupos || []).find(g => g.codigo_invitacion?.slice(0, c.length).toUpperCase() === c.toUpperCase());
    if (!grupo) {
      setError(t.invalidCode);
      setLoading(false);
      return;
    }
    const { data: existing } = await supabase.from("grupo_miembros")
      .select("id").eq("grupo_id", grupo.id).eq("usuario_id", currentUser.id).maybeSingle();
    if (!existing) {
      await supabase.from("grupo_miembros").insert({ grupo_id: grupo.id, usuario_id: currentUser.id });
    }
    setLoading(false);
    onJoined(grupo);
  }

  return (
    <div className="slide-panel" style={{ zIndex: 54 }}>
      <header className="panel-header">
        <button className="panel-back" onClick={onClose}>←</button>
        <h2 className="panel-title">{t.joinGroupTitle}</h2>
        <span />
      </header>
      <div className="panel-body" style={{ paddingTop: 32 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {t.enterInviteCode}
        </label>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && handleJoin()}
          placeholder="XXXXXXXX"
          maxLength={36}
          style={{ width: "100%", padding: "14px", border: "2px solid var(--border)", borderRadius: 12, fontSize: 20, fontFamily: "monospace", letterSpacing: 4, color: "var(--text)", outline: "none", background: "var(--input-bg)", textAlign: "center", textTransform: "uppercase", boxSizing: "border-box", marginBottom: 16 }}
        />
        {error && <div style={{ fontSize: 13, color: "#ef4444", fontWeight: 600, marginBottom: 12, textAlign: "center" }}>{error}</div>}
        <button onClick={handleJoin} disabled={loading || !code.trim()}
          style={{ width: "100%", background: "#7c3aed", color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 800, fontFamily: "Nunito,sans-serif", cursor: "pointer", opacity: (loading || !code.trim()) ? 0.6 : 1 }}>
          {loading ? t.joiningBtn : t.joinBtn}
        </button>
      </div>
    </div>
  );
}

/* ---- Main GroupScreen ---- */
export default function GroupScreen({ onHamburger, currentUser, lang }) {
  const t = getT(lang);
  const [grupos, setGrupos] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("drinks");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingGroupImage, setUploadingGroupImage] = useState(false);
  const optionsRef = useRef(null);
  const photoInputRef = useRef(null);
  const groupImageInputRef = useRef(null);

  const isLeader = selectedGroup?.creado_por === currentUser?.id;

  /* --- Cambio #3a: query que incluye grupos donde es creador O miembro --- */
  useEffect(() => {
    if (!currentUser) return;
    async function loadGroups() {
      const { data: memberRows } = await supabase.from("grupo_miembros")
        .select("grupo_id").eq("usuario_id", currentUser.id);
      const memberGroupIds = (memberRows || []).map(r => r.grupo_id);

      let query = supabase.from("grupos")
        .select("id, nombre, created_at, creado_por, codigo_invitacion, imagen_url")
        .order("created_at", { ascending: false });

      if (memberGroupIds.length > 0) {
        query = query.or(`creado_por.eq.${currentUser.id},id.in.(${memberGroupIds.join(",")})`);
      } else {
        query = query.eq("creado_por", currentUser.id);
      }

      const { data: groupData } = await query;
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
      const { data: users } = await supabase.from("usuarios").select("id, usuario, foto_perfil").in("id", ids);
      setMembers((users || []).map(u => ({ ...u, value: 0, time: "—" })));
    }
    loadMembers();
  }, [selectedGroup?.id]);

  useEffect(() => {
    if (activeSubTab !== "photos" || !selectedGroup) return;
    loadPhotos();
  }, [activeSubTab, selectedGroup?.id]);

  useEffect(() => {
    if (!showOptions) return;
    function handleClick(e) {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) setShowOptions(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showOptions]);

  async function loadPhotos() {
    setPhotosLoading(true);
    const { data } = await supabase.from("fotos_grupo")
      .select("id, url, descripcion, created_at, usuario_id")
      .eq("grupo_id", selectedGroup.id)
      .order("created_at", { ascending: false });
    if (data && data.length > 0) {
      const uids = [...new Set(data.map(p => p.usuario_id))];
      const { data: users } = await supabase.from("usuarios").select("id, usuario, foto_perfil").in("id", uids);
      const userMap = Object.fromEntries((users || []).map(u => [u.id, u]));
      setPhotos(data.map(p => ({ ...p, uploader: userMap[p.usuario_id] })));
    } else {
      setPhotos([]);
    }
    setPhotosLoading(false);
  }

  async function handleUploadPhoto(file) {
    if (!file || !currentUser || !selectedGroup) return;
    setUploadingPhoto(true);
    const ext = file.name.split(".").pop();
    const path = `${selectedGroup.id}/${currentUser.id}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("grupos-fotos").upload(path, file, { upsert: false });
    if (uploadError) { setUploadingPhoto(false); return; }
    const { data: urlData } = supabase.storage.from("grupos-fotos").getPublicUrl(path);
    await supabase.from("fotos_grupo").insert({ grupo_id: selectedGroup.id, usuario_id: currentUser.id, url: urlData.publicUrl });
    await loadPhotos();
    setUploadingPhoto(false);
  }

  /* --- Cambio #10: Subir imagen del grupo --- */
  async function handleUploadGroupImage(file) {
    if (!file || !currentUser || !selectedGroup) return;
    setUploadingGroupImage(true);
    const ext = file.name.split(".").pop();
    const path = `group-${selectedGroup.id}/cover-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("grupos-fotos").upload(path, file, { upsert: true });
    if (uploadError) { setUploadingGroupImage(false); return; }
    const { data: urlData } = supabase.storage.from("grupos-fotos").getPublicUrl(path);
    const newUrl = urlData.publicUrl + "?t=" + Date.now();
    await supabase.from("grupos").update({ imagen_url: newUrl }).eq("id", selectedGroup.id);
    setSelectedGroup(prev => ({ ...prev, imagen_url: newUrl }));
    setGrupos(prev => (prev || []).map(g => g.id === selectedGroup.id ? { ...g, imagen_url: newUrl } : g));
    setUploadingGroupImage(false);
    setShowOptions(false);
  }

  function handleGroupCreated(grupo) {
    setGrupos(prev => [grupo, ...(prev || [])]);
    setSelectedGroup(grupo);
    setShowCreateGroup(false);
  }

  function handleJoined(grupo) {
    setGrupos(prev => {
      const already = (prev || []).some(g => g.id === grupo.id);
      return already ? prev : [grupo, ...(prev || [])];
    });
    setSelectedGroup(grupo);
    setShowJoinGroup(false);
  }

  function handleMembersAdded(newMembers) {
    setMembers(prev => [...prev, ...newMembers.map(m => ({ ...m, value: 0, time: "—" }))]);
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
  const currentMemberIds = members.map(m => m.id);

  const createdAt = selectedGroup?.created_at
    ? new Date(selectedGroup.created_at).toLocaleDateString(t.locale, { day: "numeric", month: "long", year: "numeric" })
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
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{t.loading}</p>
        </div>
      )}

      {/* Estado vacío: botones Crear y Unirse */}
      {grupos !== null && grupos.length === 0 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
          <img src="/images/logo.png" alt="TheReferee" style={{ height: 64, objectFit: "contain", marginBottom: 16 }} />
          <div style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: 24, color: "#7c3aed", letterSpacing: 2, marginBottom: 8 }}>TheReferee</div>
          <div style={{ fontSize: 15, color: "#6b7280", marginBottom: 28 }}>{t.createFirstGroup}</div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setShowCreateGroup(true)}
              style={{ background: "#7c3aed", color: "white", border: "none", borderRadius: 12, padding: "14px 24px", fontSize: 15, fontWeight: 800, fontFamily: "Nunito,sans-serif", cursor: "pointer" }}>
              {t.createGroupBtn}
            </button>
            <button onClick={() => setShowJoinGroup(true)}
              style={{ background: "white", color: "#7c3aed", border: "2px solid #7c3aed", borderRadius: 12, padding: "14px 24px", fontSize: 15, fontWeight: 800, fontFamily: "Nunito,sans-serif", cursor: "pointer" }}>
              {t.joinGroupBtn}
            </button>
          </div>
        </div>
      )}

      {grupos !== null && grupos.length > 0 && (
        <>
          {/* Imagen de cabecera del grupo */}
          {selectedGroup?.imagen_url && (
            <div style={{ width: "100%", height: 120, overflow: "hidden", flexShrink: 0 }}>
              <img src={selectedGroup.imagen_url} alt={selectedGroup.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}

          <div className="event-section">
            <div className="event-row">
              <div className="event-dropdown-wrap">
                <button className="event-dropdown-btn" onClick={() => setShowDropdown(v => !v)}>
                  {selectedGroup?.nombre || t.selectGroup} <span className="arrow">▼</span>
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
              {isLeader && (
                <button className="add-event-btn" onClick={() => setShowAddMembers(true)}>+</button>
              )}
              <div className="options-wrap" ref={optionsRef}>
                <button className="options-btn" onClick={() => setShowOptions(v => !v)}>···</button>
                {showOptions && (
                  <div className="options-menu">
                    <div className="dropdown-item" onClick={() => setShowOptions(false)}>{t.manageGroup}</div>
                    {isLeader && (
                      <div className="dropdown-item" onClick={() => { setShowOptions(false); setShowAddMembers(true); }}>{t.addMembersTitle}</div>
                    )}
                    {isLeader && (
                      <div className="dropdown-item" onClick={() => { setShowOptions(false); setShowInviteCode(true); }}>{t.inviteCode}</div>
                    )}
                    {/* --- Cambio #10: Opción imagen grupo (solo líder) --- */}
                    {isLeader && (
                      <div className="dropdown-item" onClick={() => { groupImageInputRef.current?.click(); setShowOptions(false); }}>
                        {uploadingGroupImage ? "..." : t.changeGroupImage}
                      </div>
                    )}
                    {/* --- Cambio #7: Unirse a grupo también desde menú --- */}
                    <div className="dropdown-item" onClick={() => { setShowOptions(false); setShowJoinGroup(true); }}>{t.joinGroupBtn}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="event-meta">{t.createdLabel} {createdAt}</div>

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
                    <span className="penalty-text"><b>{worstDrunk.usuario}</b> {t.paysUber}</span>
                    <span className="bottle-small">🍾</span>
                  </div>
                )}
                <button className="load-test-btn" onClick={handleLoadTest}>{t.loadTest}</button>
              </div>
            )}
          </div>

          {activeSubTab === "drinks" && (
            <div className="participants-list tab-panel">
              {members.length === 0 && (
                <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "20px 0" }}>{t.noMembers}</p>
              )}
              {members.map(p => (
                <div key={p.id} className="participant-row">
                  <UserAvatar user={p} size={38} />
                  <div className="participant-info">
                    <div className="participant-name" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {p.usuario}
                      {p.id === selectedGroup?.creado_por && (
                        <img src="/images/barman.png" alt="Líder" style={{ height: 16, objectFit: "contain" }} />
                      )}
                    </div>
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
            <div className="tab-panel" style={{ padding: "0 16px 16px", flex: 1, overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <button onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}
                  style={{ background: "#7c3aed", color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, fontFamily: "Nunito,sans-serif", cursor: "pointer", opacity: uploadingPhoto ? 0.7 : 1 }}>
                  {uploadingPhoto ? t.uploadingPhoto : t.uploadPhoto}
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={e => { if (e.target.files[0]) handleUploadPhoto(e.target.files[0]); e.target.value = ""; }} />
              </div>
              {photosLoading ? (
                <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>{t.loadingPhotos}</p>
              ) : photos.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>{t.noPhotosYet}</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {photos.map(photo => (
                    <div key={photo.id} style={{ background: "var(--surface)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
                      <img src={photo.url} alt="foto del grupo" style={{ width: "100%", maxHeight: 240, objectFit: "cover", display: "block" }} />
                      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                        <UserAvatar user={photo.uploader || {}} size={28} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                          {photo.uploader?.usuario || "Usuario"}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
                          {new Date(photo.created_at).toLocaleDateString(t.locale, { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Input oculto para imagen del grupo */}
      <input ref={groupImageInputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { if (e.target.files[0]) handleUploadGroupImage(e.target.files[0]); e.target.value = ""; }} />

      {/* Botones flotantes Crear + Unirse (cuando hay grupos) */}
      {grupos !== null && grupos.length > 0 && (
        <div style={{ position: "absolute", bottom: 70, right: 16, display: "flex", flexDirection: "column", gap: 8, zIndex: 10 }}>
          <button onClick={() => setShowJoinGroup(true)}
            style={{ background: "white", color: "#7c3aed", border: "2px solid #7c3aed", borderRadius: 24, padding: "8px 16px", fontSize: 13, fontWeight: 800, fontFamily: "Nunito,sans-serif", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
            {t.joinGroupBtn}
          </button>
          <button onClick={() => setShowCreateGroup(true)}
            style={{ background: "#7c3aed", color: "white", border: "none", borderRadius: 24, padding: "8px 16px", fontSize: 13, fontWeight: 800, fontFamily: "Nunito,sans-serif", cursor: "pointer", boxShadow: "0 2px 8px rgba(124,58,237,0.3)" }}>
            {t.createGroupBtn}
          </button>
        </div>
      )}

      {showCreateGroup && (
        <CrearGrupoModal onClose={() => setShowCreateGroup(false)} onCreated={handleGroupCreated} currentUser={currentUser} lang={lang} />
      )}

      {showJoinGroup && (
        <UnirseGrupoModal onClose={() => setShowJoinGroup(false)} currentUser={currentUser} onJoined={handleJoined} lang={lang} />
      )}

      {showAddMembers && selectedGroup && (
        <AñadirMiembrosModal
          onClose={() => setShowAddMembers(false)}
          currentUser={currentUser}
          grupoId={selectedGroup.id}
          currentMemberIds={currentMemberIds}
          onMembersAdded={handleMembersAdded}
          lang={lang}
        />
      )}

      {showInviteCode && selectedGroup && (
        <div className="slide-panel" style={{ zIndex: 54 }}>
          <header className="panel-header">
            <button className="panel-back" onClick={() => setShowInviteCode(false)}>←</button>
            <h2 className="panel-title">{t.inviteCode}</h2>
            <span />
          </header>
          <div className="panel-body" style={{ textAlign: "center", paddingTop: 40 }}>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.6 }}>
              {t.shareCodeMsg.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
            </p>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#7c3aed", letterSpacing: 6, padding: "24px 20px", background: "#ede9fe", borderRadius: 16, fontFamily: "monospace" }}>
              {selectedGroup.codigo_invitacion?.slice(0, 8).toUpperCase() || "—"}
            </div>
          </div>
        </div>
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
