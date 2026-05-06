const AVATAR_COLORS = ["#3498db", "#e91e8c", "#e67e22", "#9b59b6", "#2ecc71"];

export function avatarColor(id) {
  if (!id) return "#7c3aed";
  return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function Avatar({ url, usuario, id, size = 40 }) {
  const bg = avatarColor(id);
  const letter = (usuario || "?")[0].toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      flexShrink: 0, overflow: "hidden", display: "flex",
      alignItems: "center", justifyContent: "center",
    }}>
      {url
        ? <img src={url} alt={usuario} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ color: "white", fontWeight: 800, fontSize: Math.round(size * 0.38) }}>{letter}</span>}
    </div>
  );
}
