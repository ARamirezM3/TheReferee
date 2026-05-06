import { useState, useRef } from "react";
import { supabase } from "../supabase";

export default function RegisterScreen({ onGoLogin, onRegistered }) {
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleRegister() {
    if (!usuario.trim() || !email.trim() || !password) {
      setError("Rellena usuario, email y contraseña.");
      return;
    }
    if (usuario.trim().length > 30) {
      setError("El usuario no puede superar 30 caracteres.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signUpError) {
        console.error("Error en signUp:", signUpError);
        setError(friendlyError(signUpError.message));
        return;
      }
      if (!data.user) {
        setError("No se pudo crear la cuenta. Inténtalo de nuevo.");
        return;
      }

      const uid = data.user.id;

      let fotoURL = "";
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(`${uid}.${ext}`, photoFile, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(`${uid}.${ext}`);
          fotoURL = urlData.publicUrl;
        }
      }

      const { error: insertError } = await supabase.from("usuarios").insert({
        id: uid,
        usuario: usuario.trim(),
        email: email.trim(),
        foto_perfil: fotoURL || null,
      });
      if (insertError) {
        setError(friendlyError(insertError.message));
        return;
      }

      onRegistered?.(uid);
    } catch (e) {
      setError("Error al crear la cuenta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen" style={{ padding: "0 24px", gap: 0, overflowY: "auto" }}>
      <div style={{ textAlign: "center", marginTop: 32, marginBottom: 24 }}>
        <img src="/images/logo.png" alt="TheReferee" style={{ height: 48, objectFit: "contain", marginBottom: 8 }} />
        <div style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: 28, color: "#7c3aed", letterSpacing: 2 }}>
          TheReferee
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 18, padding: 24, boxShadow: "0 4px 24px rgba(124,58,237,0.12)", border: "1px solid #e5e7eb", marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b", marginBottom: 20 }}>Crear cuenta</div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => fileRef.current.click()}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "3px solid #7c3aed" }}>
              {photoPreview
                ? <img src={photoPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 32 }}>👤</span>
              }
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, background: "#7c3aed", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>📷</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#6b7280", marginBottom: 16 }}>Foto de perfil (opcional)</div>

        <div style={{ marginBottom: 4 }}>
          <label style={labelStyle}>Usuario</label>
          <input
            type="text"
            value={usuario}
            onChange={e => setUsuario(e.target.value.slice(0, 30))}
            placeholder="Tu nombre de usuario"
            maxLength={30}
            style={inputStyle}
          />
          <div style={{ textAlign: "right", fontSize: 11, color: "#9ca3af", marginTop: 4, marginBottom: 8 }}>{usuario.length}/30</div>
        </div>
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="tu@email.com" />

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Contraseña</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <button
              onClick={() => setShowPass(s => !s)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#9ca3af" }}
            >
              {showPass ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {error && <div style={{ fontSize: 13, color: "#ef4444", marginBottom: 12, fontWeight: 600 }}>{error}</div>}

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: 32, fontSize: 13, color: "#6b7280" }}>
        ¿Ya tienes cuenta?{" "}
        <button onClick={onGoLogin} style={{ background: "none", border: "none", color: "#7c3aed", fontWeight: 800, cursor: "pointer", fontSize: 13, fontFamily: "Nunito, sans-serif" }}>
          Inicia sesión
        </button>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function friendlyError(msg) {
  if (!msg) return "Error al crear la cuenta. Inténtalo de nuevo.";
  const m = msg.toLowerCase();
  if (m.includes("rate limit") || m.includes("over_email_send_rate_limit") || m.includes("too many")) return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
  if (m.includes("already registered") || m.includes("user already registered")) return "Este email ya tiene una cuenta.";
  if (m.includes("duplicate") || m.includes("unique") || m.includes("usuarios_usuario")) return "Este usuario ya está en uso.";
  if (m.includes("password should be") || m.includes("password is too short")) return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("invalid email") || m.includes("unable to validate")) return "El email introducido no es válido.";
  return `Error al crear la cuenta: ${msg}`;
}

const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 700, color: "#6b7280",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px",
};
const inputStyle = {
  width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb",
  borderRadius: 10, fontSize: 14, fontFamily: "Nunito, sans-serif",
  color: "#1e1b4b", outline: "none", background: "white", boxSizing: "border-box",
};
const btnStyle = {
  width: "100%", background: "#7c3aed", color: "white", border: "none",
  borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 800,
  fontFamily: "Nunito, sans-serif", cursor: "pointer", marginTop: 4,
};
