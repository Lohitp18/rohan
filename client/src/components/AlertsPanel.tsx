import type { Pole } from "../types";

type AlertsPanelProps = {
  poles: Pole[];
};

function AlertsPanel({ poles }: AlertsPanelProps) {
  const activeFaults = poles.filter(
    (pole) => (pole.status ?? "").toLowerCase() === "fault"
  );

  return (
    <section id="active-alerts" className="section">
      <h2>Active Alerts</h2>
      <div className="fault-container" id="faultList">
        {activeFaults.map((fault) => (
          <article key={fault.id} className="fault-card">
            <h3>Pole {fault.id}</h3>
            <p>Status: {fault.status}</p>
            {fault.tilt !== undefined && <p>Tilt: {fault.tilt}°</p>}
            {fault.voltage !== undefined && <p>Voltage: {fault.voltage} V</p>}
            {fault.current !== undefined && <p>Current: {fault.current} A</p>}
          </article>
        ))}
        {!activeFaults.length && (
          <p className="fault-card">No active faults at the moment.</p>
        )}
      </div>
    </section>
  );
}

export default AlertsPanel;

