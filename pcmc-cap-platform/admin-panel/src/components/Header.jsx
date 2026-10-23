import { logout } from '../../../shared/api';
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {await logout();} catch { /* Local credentials are cleared by logout. */ }
    navigate("/login",{replace:true});
  }

  return (
    <header className="admin-header">
      <div>
        <h2 className="admin-header-title">
          PCMC Climate Action Plan
        </h2>

        <p className="admin-header-subtitle">
          Climate Action Management
        </p>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        style={{
          marginLeft: "auto",
          padding: "8px 14px",
          border: "1px solid #DCE3DD",
          borderRadius: "8px",
          background: "#E8EEE3",
          color: "#394F49",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#DCE6D6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#E8EEE3";
        }}
      >
        Logout
      </button>
    </header>
  );
}