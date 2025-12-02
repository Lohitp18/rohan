import { useEffect, useState } from "react";
import type { Pole } from "../types";

type SidebarProps = {
  onShowHome: () => void;
  onShowTable: () => void;
  poles: Pole[];
  onLogout: () => void;
  activeView: "home" | "table";
};

function Sidebar({
  onShowHome,
  onShowTable,
  poles,
  onLogout,
  activeView,
}: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (activeView !== "table") {
      setMenuOpen(false);
    }
  }, [activeView]);

  const handleToggle = () => {
    setMenuOpen((prev) => !prev);
    onShowTable();
  };

  return (
    <aside className="sidebar" id="sidebar">
      <div className="website-title">ZAPSAFE - Gridwatch</div>

      <nav className="sidebar-nav">
        <button
          type="button"
          className={`nav-item ${activeView === "home" ? "active" : ""}`}
          onClick={onShowHome}
        >
          <i className="fas fa-home" /> Home
        </button>

        <div className="nav-dropdown">
          <button
            type="button"
            className={`nav-item dropdown-toggle ${
              activeView === "table" ? "active" : ""
            } ${menuOpen ? "open" : ""}`}
            onClick={handleToggle}
          >
            <i className="fas fa-thumbtack" /> Pole Tags{" "}
            <i className="fas fa-caret-down" />
          </button>
          <ul className={`dropdown-menu ${menuOpen ? "open" : ""}`}>
            {poles.map((pole) => (
              <li key={pole.id}>
                <span>Pole ID: {pole.id}</span>
              </li>
            ))}
            {!poles.length && <li>No poles yet</li>}
          </ul>
        </div>

        <button type="button" className="nav-item" disabled>
          <i className="fas fa-bell" /> Active Alerts
        </button>
        <button type="button" className="nav-item" disabled>
          <i className="fas fa-chart-line" /> Reports &amp; Statistics
        </button>
        <button type="button" className="nav-item" disabled>
          <i className="fas fa-cogs" /> Settings
        </button>
        <button
          type="button"
          className="nav-item logout-button"
          onClick={onLogout}
        >
          <i className="fas fa-sign-out-alt" /> Logout
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;

