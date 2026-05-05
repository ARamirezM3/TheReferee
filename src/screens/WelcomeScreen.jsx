import { useState } from "react";
import { supabase } from "../supabase";

export default function WelcomeScreen({ userId, onDone }) {
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleContinue(skip = false) {
    setSaving(true);
    if (!skip) {
      await supabase.from("usuarios").update({
        peso: peso ? Number(peso) : null,
        altura: altura ? Number(altura) : null,
        fecha_nacimiento: fechaNacimiento || null,
      }).eq("id", userId);
    }
    setSaving(false);
    onDone();
  }

  return (
    <div className="screen" style={{ justifyContent: "center", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <img src="/images/logo.png" alt="TheReferee" style={{ height: 56, objectFit: "contain", marginBottom: 10 }} />
        <div style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: 28, color: "#7c3aed", letterSpacing: 2 }}>
          ¡Bienvenido!
        </div>
        <div style={{ fontSize: 14, color: "#6b7280", marginTop: 8 }}>
          Completa tu perfil para empezar
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 18, padding: 24, boxShadow: "0 4px 24px rgba(124,58,237,0.12)", border: "1px solid #e5e7eb" }}>
        <Field label="Peso (kg)" type="number" value={peso} onChange={setPeso} placeholder="Ej: 70" />
        <Field label="Altura (cm)" type="number" value={altura} onChange={setAltura} placeholder="Ej: 175" />
        <Field label="Fecha de nacimiento" type="date" value={fechaNacimiento} onChange={setFechaNacimiento} placeholder="" />
        <button
          onClick={() => handleContinue(false)}
          disabled={saving}
          style={{ width: "100%", background: "#7c3aed", color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 800, fontFamily: "Nunito, sans-serif", cursor: "pointer", marginTop: 8, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? "Guardando..." : "Continuar"}
        </button>
      </div>

      <button
        onClick={() => handleContinue(true)}
        style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", marginTop: 20, fontSize: 13, fontFamily: "Nunito, sans-serif", display: "block", margin: "20px auto 0" }}
      >
        Omitir por ahora
      </button>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: 14, fontFamily: "Nunito, sans-serif", color: "#1e1b4b", outline: "none", background: "white", boxSizing: "border-box" }}
      />
    </div>
  );
}
