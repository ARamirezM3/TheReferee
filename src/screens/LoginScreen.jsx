import { useState } from "react";
import { supabase } from "../supabase";

export default function LoginScreen({ onGoRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Rellena todos los campos.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: e } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (e) setError(friendlyError(e.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen" style={{ justifyContent: "center", padding: "0 24px", gap: 0 }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <img src="/images/logo.png" alt="TheReferee" style={{ height: 56, objectFit: "contain", marginBottom: 10 }} />
        <div style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: 32, color: "#7c3aed", letterSpacing: 2 }}>
          TheReferee
        </div>
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Alcoholímetro social</div>
      </div>

      <div style={{ background: "white", borderRadius: 18, padding: 24, boxShadow: "0 4px 24px rgba(124,58,237,0.12)", border: "1px solid #e5e7eb" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b", marginBottom: 20 }}>Iniciar sesión</div>

        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="tu@email.com" />

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Contraseña</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Contraseña"
              style={{ ...inputStyle, paddingRight: 44, color: password ? "#1e1b4b" : "#9ca3af" }}
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
          onClick={handleLogin}
          disabled={loading}
          style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#6b7280" }}>
        ¿No tienes cuenta?{" "}
        <button onClick={onGoRegister} style={{ background: "none", border: "none", color: "#7c3aed", fontWeight: 800, cursor: "pointer", fontSize: 13, fontFamily: "Nunito, sans-serif" }}>
          Regístrate
        </button>
      </div>
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

function friendlyError(msg) {
  if (!msg) return "Error al iniciar sesión. Inténtalo de nuevo.";
  if (msg.includes("Invalid login credentials")) return "Email o contraseña incorrectos.";
  if (msg.includes("Email not confirmed")) return "Confirma tu email antes de entrar.";
  if (msg.includes("Too many requests")) return "Demasiados intentos. Espera un momento.";
  return "Error al iniciar sesión. Inténtalo de nuevo.";
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
