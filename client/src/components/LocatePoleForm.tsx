import { useState, type FormEvent } from "react";

type LocatePoleFormProps = {
  onLocate: (coords: { lat: number; lon: number }) => void;
};

function LocatePoleForm({ onLocate }: LocatePoleFormProps) {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedLat = Number(lat);
    const parsedLon = Number(lon);
    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLon)) {
      return;
    }
    onLocate({ lat: parsedLat, lon: parsedLon });
    setLat("");
    setLon("");
  };

  return (
    <section className="locate-pole-section">
      <h4>Locate Pole</h4>
      <form onSubmit={handleSubmit}>
        <label htmlFor="latitudeLocate">Latitude:</label>
        <input
          id="latitudeLocate"
          type="number"
          step="any"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />

        <label htmlFor="longitudeLocate">Longitude:</label>
        <input
          id="longitudeLocate"
          type="number"
          step="any"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
        />

        <button type="submit">Locate Pole</button>
      </form>
    </section>
  );
}

export default LocatePoleForm;

