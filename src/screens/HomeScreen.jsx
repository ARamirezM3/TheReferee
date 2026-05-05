import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const INITIAL_CHART_DATA = [
  { t: "1", gl: 0.05 },
  { t: "2", gl: 0.10 },
  { t: "3", gl: 0.30 },
  { t: "4", gl: 0.55 },
  { t: "5", gl: 0.72 },
  { t: "6", gl: 0.60 },
  { t: "7", gl: 0.45 },
  { t: "8", gl: 0.30 },
  { t: "9", gl: 0.15 },
  { t: "10", gl: 0.05 },
];

const COLOR_STOPS = [
  { v: 0.00, r: 34,  g: 197, b: 94  },
  { v: 0.20, r: 202, g: 138, b: 4   },
  { v: 0.50, r: 239, g: 68,  b: 68  },
  { v: 1.00, r: 239, g: 68,  b: 68  },
];

function lerpColor(v) {
  const clamped = Math.max(0, Math.min(1, v));
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const s0 = COLOR_STOPS[i], s1 = COLOR_STOPS[i + 1];
    if (clamped <= s1.v) {
      const t = (clamped - s0.v) / (s1.v - s0.v);
      return {
        r: Math.round(s0.r + (s1.r - s0.r) * t),
        g: Math.round(s0.g + (s1.g - s0.g) * t),
        b: Math.round(s0.b + (s1.b - s0.b) * t),
      };
    }
  }
  return { r: 239, g: 68, b: 68 };
}

function getCircleStyle(v, isPulsing) {
  const { r, g, b } = lerpColor(v);
  return {
    background: `rgb(${r},${g},${b})`,
    boxShadow: `0 0 0 6px rgba(${r},${g},${b},0.25), 0 8px 24px rgba(${r},${g},${b},0.4)`,
    animation: isPulsing
      ? "circleIn 0.35s ease-out, pulseRed 1.8s ease-in-out 0.35s infinite"
      : "circleIn 0.35s ease-out",
  };
}

function getRefereeImage(v) {
  if (v <= 0.01) return "/images/thereferee_bien.png";
  if (v <= 0.25) return "/images/thereferee_amarilla.png";
  return "/images/thereferee_roja.png";
}

const USER_COLORS = ["#3498db", "#e91e8c", "#e67e22", "#9b59b6", "#2ecc71"];

function PersonaCard({ persona }) {
  const [following, setFollowing] = useState(false);
  const initials = persona.nombre
    ? persona.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  const bg = USER_COLORS[persona.id.charCodeAt(0) % USER_COLORS.length];

  return (
    <div className="persona-card">
      <div
        className="persona-avatar"
        style={{ background: bg, overflow: "hidden", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {persona.foto_perfil
          ? <img src={persona.foto_perfil} alt={persona.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : initials}
      </div>
      <div className="persona-name">{persona.nombre}</div>
      <button
        className="persona-follow-btn"
        onClick={() => setFollowing(f => !f)}
        style={following ? { background: "#e5e7eb", color: "#374151" } : {}}
      >
        {following ? "Siguiendo" : "Seguir"}
      </button>
    </div>
  );
}

export default function HomeScreen({ onHamburger, onOpenNotifications, currentUser }) {
  const [gl, setGl] = useState(0.05);
  const [testKey, setTestKey] = useState(0);
  const [chartData, setChartData] = useState(INITIAL_CHART_DATA);
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    supabase
      .from("usuarios")
      .select("id, nombre, foto_perfil")
      .neq("id", currentUser.id)
      .limit(5)
      .then(({ data }) => { if (data) setPersonas(data); });
  }, [currentUser]);

  const isPositive = gl >= 0.50;
  const isPulsing = gl > 0.60;

  function handleNewTest() {
    const newGl = parseFloat(Math.random().toFixed(2));
    setChartData(prev => {
      const lastT = prev.length > 0 ? parseInt(prev[prev.length - 1].t) : 0;
      return [...prev, { t: String(lastT + 1), gl: newGl }].slice(-10);
    });
    setGl(newGl);
    setTestKey(k => k + 1);
  }

  return (
    <div className="screen">
      <header className="app-header">
        <span className="hamburger" onClick={onHamburger}>&#9776;</span>
        <h1 className="app-title">TheReferee</h1>
        <span />
      </header>

      <div className="user-card">
        <div className="user-card-top">
          <div className="user-grid">
            <span><b>Nombre:</b> Carlos</span>
            <span><b>Edad:</b> 28 años</span>
            <span><b>Peso:</b> 75 kg</span>
            <span><b>Altura:</b> 180 cm</span>
          </div>
          <button className="mailbox-btn" onClick={onOpenNotifications} title="Notificaciones">
            <MailboxIcon />
          </button>
        </div>
      </div>

      <div className="result-section">
        <div className="result-row">
          <div
            key={testKey}
            className="result-circle"
            style={getCircleStyle(gl, isPulsing)}
          >
            <span className="result-value">{gl.toFixed(2)}</span>
            <span className="result-unit">g/L</span>
          </div>
          <div className="card-icon-wrap">
            <img
              src={getRefereeImage(gl)}
              alt="resultado"
              className="referee-img"
            />
          </div>
          <button className="share-btn">
            <ShareIcon />
          </button>
        </div>

        {isPositive ? (
          <div className="status-positive">
            <div className="warning-row">
              <WarningIcon />
              <span className="positive-text">Has dado positivo</span>
            </div>
            <div className="status-btn red-status">NO APTO PARA CONDUCIR</div>
            <button className="uber-btn">
              <span className="uber-logo">UBER</span>
              <span>Llamar</span>
            </button>
            <button className="sos-btn">
              📞 <span>SOS 911</span>
            </button>
          </div>
        ) : (
          <div className="status-negative">
            <div className="car-status-row">
              <CarIcon />
              <div className="status-btn green-status">
                <div>Apto para conducir</div>
                <div className="status-sub">Has dado negativo</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bottom-section">
        <div className="wait-row">
          <span className="wait-label">Tiempo de espera</span>
          <div className="days-box">
            <span className="days-num">01</span>
            <span className="days-label">Días sin beber</span>
          </div>
        </div>

        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="t"
                tick={{ fontSize: 9, fill: "#aaa" }}
                label={{ value: "Test nº", position: "insideBottom", offset: -2, fontSize: 9, fill: "#aaa" }}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#aaa" }}
                label={{ value: "g/L", angle: -90, position: "insideLeft", fontSize: 9, fill: "#aaa" }}
                domain={[0, 1.0]}
              />
              <Tooltip
                contentStyle={{ fontSize: 10, padding: "2px 6px" }}
                formatter={(v) => [`${v} g/L`]}
              />
              <Line
                type="monotone"
                dataKey="gl"
                stroke="#bbb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="new-test-row">
          <button
            className="new-test-btn"
            onClick={handleNewTest}
            title="Simular nuevo test"
          >
            <BottleIcon />
          </button>
          <span className="new-test-label">Nuevo test</span>
        </div>
      </div>

      <div className="personas-section">
        <div className="personas-title">Personas que quizás conozcas</div>
        <div className="personas-scroll">
          {personas.length === 0 && (
            <p style={{ color: "#6b7280", fontSize: 13, padding: "8px 4px", whiteSpace: "nowrap" }}>
              No hay usuarios disponibles
            </p>
          )}
          {personas.map(p => (
            <PersonaCard key={p.id} persona={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MailboxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#2ecc71" width="38" height="38">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#f39c12" width="28" height="28">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}

function BottleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" width="26" height="26">
      <path d="M15.5 4l-1-1h-5l-1 1v2h7V4zm1 3h-9l-1 1v11c0 1.1.9 2 2 2h7c1.1 0 2-.9 2-2V8l-1-1zm-2 9h-5v-1h5v1zm0-3h-5v-1h5v1z" />
    </svg>
  );
}
