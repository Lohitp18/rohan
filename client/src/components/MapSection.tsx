import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import type { Pole } from "../types";

type MapSectionProps = {
  poles: Pole[];
  focusCoords: { lat: number; lon: number } | null;
};

const DEFAULT_CENTER: [number, number] = [20.59, 78.96];

const blueIcon = L.icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const redIcon = L.icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function MapUpdater({ coords }: { coords: { lat: number; lon: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lon], 15, { duration: 0.6 });
    }
  }, [coords, map]);
  return null;
}

function MapSection({ poles, focusCoords }: MapSectionProps) {
  return (
    <section className="map-section" id="mapSection">
      <h3>Utility Pole Map</h3>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={5}
        scrollWheelZoom
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater coords={focusCoords} />
        {poles.map((pole) => (
          <Marker
            key={pole.id}
            position={[pole.lat, pole.lon]}
            icon={(pole.status ?? "").toLowerCase() === "fault" ? redIcon : blueIcon}
          >
            <Popup>
              <strong>Pole ID:</strong> {pole.id}
              <br />
              <strong>Latitude:</strong> {pole.lat}
              <br />
              <strong>Longitude:</strong> {pole.lon}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}

export default MapSection;

