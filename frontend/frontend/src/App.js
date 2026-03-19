import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";

function App() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [mode, setMode] = useState("fastest");
  const [route, setRoute] = useState([]);

  const fetchRoute = async () => {
    if (!start || !end) return alert("Enter start and destination");

    const url = `http://127.0.0.1:8000/route?start=${encodeURIComponent(
      start
    )}&end=${encodeURIComponent(end)}&mode=${mode}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.route) {
        setRoute(data.route);
      } else {
        alert("No route found");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching route");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Smart Route AI</h2>

      {/* Inputs */}
      <input
        type="text"
        placeholder="Start location"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        style={{ marginRight: "10px" }}
      />

      <input
        type="text"
        placeholder="Destination"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        style={{ marginRight: "10px" }}
      />

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        style={{ marginRight: "10px" }}
      >
        <option value="fastest">Fastest</option>
        <option value="safe">Safe</option>
        <option value="family">Family</option>
      </select>

      <button onClick={fetchRoute}>Get Route</button>

      {/* Map */}
      <MapContainer
        center={[26.4499, 80.3319]} // Kanpur
        zoom={12}
        style={{ height: "500px", marginTop: "20px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {route.length > 0 && (
          <>
            <Polyline positions={route} color="blue" />

            <Marker position={route[0]}>
              <Popup>Start</Popup>
            </Marker>

            <Marker position={route[route.length - 1]}>
              <Popup>Destination</Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
}

export default App;