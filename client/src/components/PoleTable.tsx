import type { Pole } from "../types";

type PoleTableProps = {
  poles: Pole[];
  onSelect: (pole: Pole) => void;
};

function PoleTable({ poles, onSelect }: PoleTableProps) {
  return (
    <section id="poleTableSection">
      <h3>All Registered Poles</h3>
      <table className="pole-table">
        <thead>
          <tr>
            <th>Pole ID</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Tilt</th>
            <th>Voltage</th>
            <th>Current</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {poles.map((pole) => (
            <tr key={pole.id} onClick={() => onSelect(pole)}>
              <td>{pole.id}</td>
              <td>{pole.lat.toFixed(4)}</td>
              <td>{pole.lon.toFixed(4)}</td>
              <td>{pole.tilt ?? "N/A"}</td>
              <td>{pole.voltage ?? "N/A"}</td>
              <td>{pole.current ?? "N/A"}</td>
              <td>{pole.status ?? "Normal"}</td>
            </tr>
          ))}
          {!poles.length && (
            <tr>
              <td colSpan={7}>No poles recorded yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default PoleTable;


