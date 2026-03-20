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

  // NEW states
  const [fastest, setFastest] = useState([]);
  const [safe, setSafe] = useState([]);
  const [family, setFamily] = useState([]);

  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);

  const fetchRoute = async () => {
    if (!start || !end) {
      alert("Enter start and destination");
      return;
    }

    const modes = ["fastest", "safe", "family"];

    for (let m of modes) {
      const url = `http://127.0.0.1:8000/route?start=${encodeURIComponent(
        start
      )}&end=${encodeURIComponent(end)}&mode=${m}`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (m === "fastest") setFastest(data.route);
        if (m === "safe") setSafe(data.route);
        if (m === "family") setFamily(data.route);
      } catch (err) {
        console.error(err);
        alert("Error fetching route");
      }
    }
  };

  const fetchSuggestions = async (query, setSuggestions) => {
    if (!query) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
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
        onChange={(e) => {
          setStart(e.target.value);
          fetchSuggestions(e.target.value, setStartSuggestions);
        }}
      />

      <ul>
        {startSuggestions.map((item) => (
          <li
            key={item.place_id}
            onClick={() => {
              setStart(item.display_name);
              setStartSuggestions([]);
            }}
            style={{ cursor: "pointer" }}
          >
            {item.display_name}
          </li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="Destination"
        value={end}
        onChange={(e) => {
          setEnd(e.target.value);
          fetchSuggestions(e.target.value, setEndSuggestions);
        }}
      />

      <ul>
        {endSuggestions.map((item) => (
          <li
            key={item.place_id}
            onClick={() => {
              setEnd(item.display_name);
              setEndSuggestions([]);
            }}
            style={{ cursor: "pointer" }}
          >
            {item.display_name}
          </li>
        ))}
      </ul>

      <button onClick={fetchRoute}>Get Route</button>

      {/* Map */}
      <MapContainer
        center={[26.4499, 80.3319]}
        zoom={12}
        style={{ height: "500px", marginTop: "20px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* MULTIPLE ROUTES */}
        {fastest.length > 0 && (
          <Polyline positions={fastest} color="blue" weight={6} opacity={0.7} />
        )}

        {safe.length > 0 && (
          <Polyline positions={safe} color="green" weight={6} opacity={0.7} />
        )}

        {family.length > 0 && (
          <Polyline positions={family} color="red" weight={6} opacity={0.7} />
        )}

        {/* MARKERS */}
        {fastest.length > 0 && (
          <>
            <Marker position={fastest[0]}>
              <Popup>Start</Popup>
            </Marker>

            <Marker position={fastest[fastest.length - 1]}>
              <Popup>Destination</Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
}

export default App;