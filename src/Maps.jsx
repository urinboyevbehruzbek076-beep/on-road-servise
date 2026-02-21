import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Zapravka uchun maxsus ikonka
const gasIcon = L.divIcon({
  html: '<div style="font-size: 24px; background: white; border-radius: 50%; padding: 5px; border: 2px solid green;">⛽</div>',
  className: 'custom-gas-icon',
  iconSize: [35, 35]
});

function Maps({ filterService, senderInfo, services, showGasStations }) {
  const [userLoc, setUserLoc] = useState([41.2995, 69.2401]);
  const [masters, setMasters] = useState([]);
  
  // Demo zapravkalar ro'yxati
  const gasStations = [
    { id: 1, lat: 41.315, lng: 69.285, name: "UNG Petrol", info: "⛽ Benzin & Metan bor" },
    { id: 2, lat: 41.325, lng: 69.270, name: "Lukoil", info: "⛽ Faqat Benzin (AI-95, 92)" },
    { id: 3, lat: 41.305, lng: 69.255, name: "Volt Energy", info: "⚡ Elektr quvvatlash stansiyasi" },
    { id: 4, lat: 41.295, lng: 69.300, name: "Mustaqillik Gaz", info: "💨 Faqat Metan & Propan" }
  ];

  // ... (useEffect mantiqlari)

  return (
    <MapContainer center={userLoc} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={userLoc}><Popup>Siz shu yerdasiz</Popup></Marker>

      {/* USTALAR: Faqat zapravka rejimi o'chiq bo'lsa chiqadi */}
      {!showGasStations && masters.map(m => (
        <Marker key={m.id} position={[m.lat, m.lng]}>
          <Popup><b>{m.name}</b><br/>💰 {m.price} so'm</Popup>
        </Marker>
      ))}

      {/* ZAPRAVKALAR: Faqat tugma bosilsa chiqadi */}
      {showGasStations && gasStations.map(gs => (
        <Marker key={gs.id} position={[gs.lat, gs.lng]} icon={gasIcon}>
          <Popup>
            <div style={{color: '#000'}}>
              <h3 style={{margin: 0}}>{gs.name}</h3>
              <p>{gs.info}</p>
              <button onClick={() => window.open(`https://www.google.com{gs.lat},${gs.lng}`)} style={{background: '#00C851', color: '#fff', border: 'none', padding: '5px', borderRadius: '5px', cursor: 'pointer', width: '100%'}}>Yo'nalish chizish</button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
export default Maps;
