import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Sectors", path: "/sectors" },
    { label: "Projects", path: "/projects" },
    { label: "Progress", path: "/progress" },
    { label: "Map Data", path: "/map-data" },
    { label: "Resources", path: "/resources" },
    { label: "Events", path: "/events" },
    { label: "Suggestions", path: "/suggestions" },
    { label: "Admin Settings", path: "/admin-settings" },
  ];

  return (
    <nav className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-pcmc">PCMC</div>

        <h2 className="admin-sidebar-title">
          Climate Action
        </h2>

        <p className="admin-sidebar-subtitle">
          Admin Panel
        </p>
      </div>

      <ul className="admin-sidebar-links">
        {links.map((link) => {
          const isActive = location.pathname === link.path;

          return (
            <li key={link.path} className="admin-sidebar-item">
              <Link
                to={link.path}
                className={`admin-sidebar-link ${
                  isActive ? "active" : ""
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}