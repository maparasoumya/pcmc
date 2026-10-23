import Vendors from './pages/Vendors';
import Initiatives from './pages/Initiatives';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProgressEntry from "./pages/ProgressEntry";
import SuggestionsInbox from "./pages/SuggestionsInbox";
import Sectors from "./pages/Sectors";
import SectorEdit from "./pages/SectorEdit";
import Projects from "./pages/Projects";
import MapData from "./pages/MapData";
import Resources from "./pages/Resources";
import Events from "./pages/Events";
import AdminSettings from "./pages/AdminSettings";

import AuthGuard from "./components/AuthGuard";
import AdminLayout from "./components/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login is the first page */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* Everything below Login uses the Admin Layout */}
        <Route element={<AuthGuard />}>
          <Route element={<AdminLayout />}>

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/sectors" element={<Sectors />} />

            <Route
              path="/sectors/:sectorId/edit"
              element={<SectorEdit />}
            />

            <Route path="/projects" element={<Projects />} />

            <Route path="/progress" element={<ProgressEntry />} />

            <Route path="/map-data" element={<MapData />} />

            <Route path="/resources" element={<Resources />} />

            <Route path="/events" element={<Events />} />

            <Route path="/suggestions" element={<SuggestionsInbox />} />

            <Route path="/vendors" element={<Vendors/>}/>
            <Route path="/initiatives" element={<Initiatives/>}/>
            <Route path="/admin-settings" element={<AdminSettings />} />

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;