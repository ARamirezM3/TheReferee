import { useState, useRef, useEffect } from "react";

const EVENTS = ["Cumple de Rafa", "Fiesta de fin de año", "Cena de empresa"];

const INITIAL_PARTICIPANTS = [
  { id: 1, name: "Carlos", value: 0.72, time: "2:15, Hoy",   color: "#e74c3c", initials: "C", avatarBg: "#3498db" },
  { id: 2, name: "Marta",  value: 0.51, time: "2:02, Hoy",   color: "#e67e22", initials: "M", avatarBg: "#e91e8c" },
  { id: 3, name: "Rafa",   value: 0.38, time: "1:48, Hoy",   color: "#d4ac0d", initials: "R", avatarBg: "#2ecc71" },
  { id: 4, name: "Aaron",  value: 0.14, time: "4:06, Hoy",   color: "#f1c40f", initials: "A", avatarBg: "#e74c3c" },
  { id: 5, name: "Noa",    value: 0.0,  time: "23:48, Ayer", color: "#2ecc71", initials: "N", avatarBg: "#9b59b6" },
];

function getBarWidth(value) {
  return Math.max(4, Math.round((value / 1.0) * 100));
}

function getBarColor(value) {
  if (value > 0.5) return "#e74c3c";
  if (value > 0.25) return "#e67e22";
  return "#2ecc71";
}

export default function GroupScreen({ onHamburger }) {
  const [selectedEvent, setSelectedEvent] = useState(EVENTS[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
  const [activeSubTab, setActiveSubTab] = useState("drinks");
  const optionsRef = useRef(null);

  const worstDrunk = participants.reduce((a, b) => (a.value > b.value ? a : b));

  useEffect(() => {
    if (!showOptions) return;
    function handleClick(e) {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showOptions]);

  function handleLoadTest() {
    const newValue = parseFloat(Math.random().toFixed(2));
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}, Hoy`;
    setParticipants(prev =>
      prev
        .map(p => p.name === "Carlos" ? { ...p, value: newValue, time: timeStr, color: getBarColor(newValue) } : p)
        .sort((a, b) => b.value - a.value)
    );
  }

  return (
    <div className="screen">
      <header className="app-header">
        <span className="hamburger" onClick={onHamburger}>&#9776;</span>
        <h1 className="app-title">TheReferee</h1>
        <span />
      </header>

      <div className="event-section">
        <div className="event-row">
          <div className="event-dropdown-wrap">
            <button
              className="event-dropdown-btn"
              onClick={() => setShowDropdown((v) => !v)}
            >
              {selectedEvent} <span className="arrow">▼</span>
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                {EVENTS.map((e) => (
                  <div
                    key={e}
                    className="dropdown-item"
                    onClick={() => { setSelectedEvent(e); setShowDropdown(false); }}
                  >
                    {e}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="add-event-btn">+</button>
          <div className="options-wrap" ref={optionsRef}>
            <button className="options-btn" onClick={() => setShowOptions(v => !v)}>···</button>
            {showOptions && (
              <div className="options-menu">
                <div className="dropdown-item" onClick={() => setShowOptions(false)}>Administrar grupo</div>
                <div className="dropdown-item" onClick={() => setShowOptions(false)}>Añadir miembros</div>
                <div className="dropdown-item" onClick={() => setShowOptions(false)}>Invitar por enlace o QR</div>
              </div>
            )}
          </div>
        </div>

        <div className="event-meta">Creado: 11 de Febrero 2026 · 21:45</div>

        <div className="sub-tabs">
          <button
            className={`sub-tab-btn${activeSubTab === "drinks" ? " active" : ""}`}
            onClick={() => setActiveSubTab("drinks")}
          >
            <CupIcon />
          </button>
          <button
            className={`sub-tab-btn${activeSubTab === "photos" ? " active" : ""}`}
            onClick={() => setActiveSubTab("photos")}
          >
            <GroupPhotoIcon />
          </button>
          <div className={`sub-tab-indicator${activeSubTab === "photos" ? " right" : ""}`} />
        </div>

        {activeSubTab === "drinks" && (
          <div className="tab-panel">
            <div className="penalty-row">
              <span className="penalty-emoji">😡</span>
              <span className="penalty-text">
                <b>{worstDrunk.name}</b> paga el Uber
              </span>
              <span className="bottle-small">🍾</span>
            </div>
            <button className="load-test-btn" onClick={handleLoadTest}>
              Cargar test
            </button>
          </div>
        )}
      </div>

      {activeSubTab === "drinks" && (
        <div className="participants-list tab-panel">
          {participants.map((p) => (
            <div key={p.id} className="participant-row">
              <div className="participant-avatar" style={{ background: p.avatarBg }}>
                {p.initials}
              </div>
              <div className="participant-info">
                <div className="participant-name">{p.name}</div>
                <div className="bar-wrap">
                  <div
                    className="bar-fill"
                    style={{ width: `${getBarWidth(p.value)}%`, background: p.color }}
                  />
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
    </div>
  );
}

function CupIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
      <path d="M20 3H4v2l6.5 9V19H8v2h8v-2h-2.5v-5L20 5V3z" />
    </svg>
  );
}

function GroupPhotoIcon() {
  return <div className="group-photo-icon">GR</div>;
}
