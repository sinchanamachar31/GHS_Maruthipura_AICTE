import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f4f7fb",
      padding: "24px"
    }}>
      <div style={{
        maxWidth: "500px",
        width: "100%",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        padding: "32px",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "48px", marginBottom: "12px" }}>404</h1>
        <h2 style={{ marginBottom: "12px" }}>Page not found</h2>
        <p style={{ marginBottom: "20px", color: "#556" }}>
          The page you requested is unavailable or the route is incorrect.
        </p>
        <Link to="/" style={{
          display: "inline-block",
          padding: "12px 20px",
          background: "#0d6efd",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: 600
        }}>
          Go to login
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
