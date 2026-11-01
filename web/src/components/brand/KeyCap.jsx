export default function KeyCap({ pressed = false, label = "CTRL", className = "" }) {
  return (
    <div className={`keycap ${className}`} data-pressed={pressed}>
      <div className="keycap-base" />
      <div className="keycap-face">
        <span className="keycap-word">{label}</span>
      </div>
    </div>
  );
}
