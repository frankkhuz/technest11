export default function Cube() {
  const faceStyle = (transform: string): React.CSSProperties => ({
    position: "absolute",
    width: "260px",
    height: "260px",
    border: "1px solid var(--border)",
    backgroundImage:
      "repeating-linear-gradient(0deg, var(--border) 0, var(--border) 1px, transparent 1px, transparent calc(33.33% - 1px)), repeating-linear-gradient(90deg, var(--border) 0, var(--border) 1px, transparent 1px, transparent calc(33.33% - 1px))",
    background: "linear-gradient(135deg, var(--surface), var(--bg))",
    transform,
  });

  return (
    <div
      className="hidden lg:block"
      style={{ perspective: "1400px", width: "320px", height: "320px" }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          animation: "cubeSpin 14s ease-in-out infinite",
        }}
      >
        <div style={faceStyle("rotateY(0deg) translateZ(130px)")} />
        <div style={faceStyle("rotateY(90deg) translateZ(130px)")} />
        <div style={faceStyle("rotateX(90deg) translateZ(130px)")} />
      </div>
    </div>
  );
}
