import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "./firebase";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from "firebase/firestore";

// Marker piktogrammalarini to'g'rilash (Leaflet uchun shart)
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Xarita markazini yangilash uchun yordamchi komponent
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center);
  return null;
}

function Maps({ filterService, senderInfo }) {
  const [userLoc, setUserLoc] = useState([41.2995, 69.2401]); // Default: Toshkent
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Foydalanuvchi lokatsiyasini olish
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      () => setLoading(false)
    );

    // Firebase'dan ustalarni olish
    let q = query(collection(db, "masters"), where("isAvailable", "==", true));
    if (filterService) {
      q = query(q, where("service", "==", filterService));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMasters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [filterService]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  const sendMessage = async (master) => {
    try {
      await addDoc(collection(db, "messages"), {
        senderName: senderInfo?.name || "Mijoz",
        senderPhone: senderInfo?.phone || "Noma'lum",
        receiverId: master.id,
        text: "Menga yordam kerak!",
        createdAt: serverTimestamp()
      });
      alert("Xabar yuborildi!");
    } catch (e) { alert("Xato: " + e.message); }
  };

  if (loading) return <div style={{textAlign: "center", marginTop: "50px", color: "#FFD700"}}>Xarita yuklanmoqda...</div>;

  return (
    <MapContainer center={userLoc} zoom={13} style={{ width: "100%", height: "100vh" }}>
      <ChangeView center={userLoc} />
      
      {/* Dark Mode dizayni uchun CartoDB Dark Matter ishlatamiz */}
      <TileLayer
        url="https://{s}://{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
      />

      {/* Foydalanuvchi markeri (Ko'k) */}
      <Marker position={userLoc}>
        <Popup>Siz shu yerdasiz</Popup>
      </Marker>

      {/* Ustalar markerlari */}
      {masters.map(master => (
        <Marker key={master.id} position={[master.lat, master.lng]}>
          <Popup>
            <div style={{ color: "#000", minWidth: "150px" }}>
              <h4 style={{margin: "0"}}>{master.name}</h4>
              <p>🛠 {master.service}</p>
              <p>📍 Masofa: {calculateDistance(userLoc[0], userLoc[1], master.lat, master.lng)} km</p>
              <div style={{ display: "flex", gap: "5px" }}>
                <button onClick={() => window.open(`tel:${master.phone}`)} style={{background: "#28a745", color: "#fff", border: "none", padding: "5px", cursor: "pointer"}}>📞</button>
                <button onClick={() => sendMessage(master)} style={{background: "#ffc107", border: "none", padding: "5px", cursor: "pointer"}}>💬 Xabar</button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default Maps;
