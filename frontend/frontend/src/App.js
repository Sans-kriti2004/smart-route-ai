import { useState, useEffect } from "react";
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

  const [fastest, setFastest] = useState([]);
  const [safe, setSafe] = useState([]);
  const [family, setFamily] = useState([]);

  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);

  const [selectedMode, setSelectedMode] = useState(null);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [navIndex, setNavIndex] = useState(0);

  // -----------------------------
  // FETCH ROUTES
  // -----------------------------
  const fetchRoute = async () => {
    if (!start || !end) {
      alert("Enter start and destination");
      return;
    }

    setNavigationStarted(false);
    setSelectedMode(null);

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
      }
    }
  };

  // -----------------------------
  // AUTOCOMPLETE
  // -----------------------------
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

  // -----------------------------
  // GET SELECTED ROUTE
  // -----------------------------
  const getSelectedRoute = () => {
    if (selectedMode === "fastest") return fastest;
    if (selectedMode === "safe") return safe;
    if (selectedMode === "family") return family;
    return [];
  };

  // -----------------------------
  // NAVIGATION SIMULATION
  // -----------------------------
  useEffect(() => {
  if (!navigationStarted) return;

  let route = [];

  if (selectedMode === "fastest") route = fastest;
  if (selectedMode === "safe") route = safe;
  if (selectedMode === "family") route = family;

  if (!route.length) return;

  const interval = setInterval(() => {
    setNavIndex((prev) => {
      if (prev >= route.length - 1) {
        clearInterval(interval);
        return prev;
      }
      return prev + 1;
    });
  }, 300);

  return () => clearInterval(interval);
}, [navigationStarted, selectedMode, fastest, safe, family]);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div style={{ padding: "20px" }}>
      <h2>Smart Route AI</h2>

      {/* INPUTS */}
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

      <br />

      <button onClick={fetchRoute}>Get Routes</button>

      {/* ROUTE SELECTION */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={() => setSelectedMode("fastest")}>Fastest</button>
        <button onClick={() => setSelectedMode("safe")}>Safe</button>
        <button onClick={() => setSelectedMode("family")}>Family</button>
      </div>

      {/* START NAVIGATION */}
      <button
        style={{ marginTop: "10px" }}
        onClick={() => {
          if (!selectedMode) {
            alert("Select a route first");
            return;
          }
          setNavIndex(0);
          setNavigationStarted(true);
        }}
      >
        Start Navigation
      </button>

      {/* MAP */}
      <MapContainer
        center={[26.4499, 80.3319]}
        zoom={12}
        style={{ height: "500px", marginTop: "20px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ROUTES */}
        {fastest.length > 0 && (
          <Polyline
            positions={fastest}
            color="blue"
            weight={selectedMode === "fastest" ? 8 : 4}
            opacity={selectedMode === "fastest" ? 1 : 0.5}
          />
        )}

        {safe.length > 0 && (
          <Polyline
            positions={safe}
            color="green"
            weight={selectedMode === "safe" ? 8 : 4}
            opacity={selectedMode === "safe" ? 1 : 0.5}
          />
        )}

        {family.length > 0 && (
          <Polyline
            positions={family}
            color="red"
            weight={selectedMode === "family" ? 8 : 4}
            opacity={selectedMode === "family" ? 1 : 0.5}
          />
        )}

        {/* STATIC MARKERS */}
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

        {/* MOVING NAVIGATION MARKER */}
        {navigationStarted && getSelectedRoute().length > 0 && (
          <Marker position={getSelectedRoute()[navIndex]}>
            <Popup>🚗 Navigating...</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default App;