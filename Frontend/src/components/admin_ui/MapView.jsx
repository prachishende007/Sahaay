import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* ---------------- ICON SETUP ---------------- */

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;

/* Priority Icons */
const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const yellowIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const greenIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

/* Admin / Live Location Icon */
const adminIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const getIconByPriority = (priority = "Medium") => {
  if (priority === "High") return redIcon;
  if (priority === "Medium") return yellowIcon;
  return greenIcon;
};

/* ---------------- COMPONENT ---------------- */

export default function MapView({ complaints = [] }) {
  const [liveLocation, setLiveLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLiveLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.error("Map location error:", err)
    );
  }, []);

  return (
    <div className="map-container" style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={[18.5204, 73.8567]} // Pune (change if needed)
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* COMPLAINT MARKERS */}
        {complaints.map((c) => (
          <Marker
            key={c.id}
            position={[c.lat, c.lon]}
            icon={getIconByPriority(c.priority)}
          >
            <Popup>
              <strong>{c.category}</strong>
              <p><b>Status:</b> {c.status}</p>
              <p><b>Priority:</b> {c.priority || "Medium"}</p>

              {c.image && (
                <img
                  src={`http://localhost:8000/uploads/${c.image}`}
                  alt="Report"
                  style={{
                    width: "200px",
                    borderRadius: "6px",
                    marginTop: "6px",
                  }}
                />
              )}

              {c.video && (
                <video
                  src={`http://localhost:8000/uploads/${c.video}`}
                  controls
                  style={{ width: "200px", marginTop: "6px" }}
                />
              )}
            </Popup>
          </Marker>
        ))}

        {/* ADMIN / LIVE LOCATION */}
        {liveLocation && (
          <Marker
            position={[liveLocation.lat, liveLocation.lng]}
            icon={adminIcon}
          >
            <Popup>
              <strong>Your Location</strong>
              <p>
                {liveLocation.lat.toFixed(4)}, {liveLocation.lng.toFixed(4)}
              </p>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
