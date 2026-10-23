import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-content">
        <Header />

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}