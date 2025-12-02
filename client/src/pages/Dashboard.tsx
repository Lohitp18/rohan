import { useEffect, useState } from "react";
import api from "../services/api";
import type { Pole } from "../types";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import MapSection from "../components/MapSection";
import AddPoleForm, { type AddPolePayload } from "../components/AddPoleForm";
import PoleTable from "../components/PoleTable";

type ViewMode = "home" | "table";

function Dashboard() {
  const { user, logout } = useAuth();
  const [poles, setPoles] = useState<Pole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [focusCoords, setFocusCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    async function fetchPoles() {
      try {
        const { data } = await api.get<Pole[]>("/poles");
        setPoles(data);
      } catch (err) {
        const errorMessage =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          "Unable to load poles.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchPoles();
    
    // Poll for updates every 5 seconds to get real-time sensor data from Arduino
    const interval = setInterval(() => {
      fetchPoles();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAddPole = async (payload: AddPolePayload) => {
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post<Pole>("/poles", payload);
      setPoles((prev) => {
        const filtered = prev.filter((pole) => pole.id !== data.id);
        return [data, ...filtered];
      });
      setFocusCoords({ lat: data.lat, lon: data.lon });
      setViewMode("home");
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Unable to save pole.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPole = (pole: Pole) => {
    setFocusCoords({ lat: pole.lat, lon: pole.lon });
    setViewMode("home");
  };

  const showHome = () => setViewMode("home");
  const showTable = () => setViewMode("table");

  const isAdmin = user?.role === "admin";

  return (
    <div className="dashboard-container">
      <Sidebar
        onShowHome={showHome}
        onShowTable={showTable}
        poles={poles}
        activeView={viewMode}
        onLogout={logout}
      />

      <main className="main-content">
        <header className="top-header">
          <div>
            <h2>ZAPSAFE - GRIDWATCH</h2>
            <p>Utility Pole Monitoring System</p>
          </div>
          <div className="user-pill">
            <span>{user?.username}</span>
            <small>{user?.role}</small>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        {viewMode === "home" && (
          <>
            <div
              className={`main-grid ${isAdmin ? "" : "single-column"}`}
              id="mainGrid"
            >
              <MapSection poles={poles} focusCoords={focusCoords} />

              {isAdmin && (
                <aside className="control-panels" id="controlPanelSection">
                  <AddPoleForm onAdd={handleAddPole} disabled={saving} />
                </aside>
              )}
            </div>
          </>
        )}

        {viewMode === "table" && <PoleTable poles={poles} onSelect={handleSelectPole} />}

        {loading && <div className="loading-overlay">Loading poles...</div>}
      </main>
    </div>
  );
}

export default Dashboard;

