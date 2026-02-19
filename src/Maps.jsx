import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "./firebase";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { useTranslation } from 'react-i18next';

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center); }, [center]);
  return null;
}

function Maps({ filterService, senderInfo, services }) {
  const { t } = useTranslation();
  const [userLoc, setUserLoc] = useState([41.2995, 69.2401]);
  const [masters, setMasters] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]));
    
    let q = query(collection(db, "masters"), where("isAvailable", "==", true));
    if (filterService) q = query(q, where("service", "==", filterService));

    return onSnapshot(q, (snapshot) => {
      setMasters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [filterService]);

  const sendMessage = async (master) => {
    const msgText = services.find(s => s.id === filterService)?.msg || "Yordam kerak!";
    try {
      await addDoc(collection(db, "messages"), {
        senderName: senderInfo.name,
        senderPhone: senderInfo.phone,
        receiverId: master.id,
        text: msgText,
        createdAt: serverTimestamp()
      });
      alert(t('message_sent'));
    } catch (e) { alert(e.message); }
  };

  return (
    <MapContainer center={userLoc} zoom={13} style={{ height: '100%', width: '100%' }}>
      <ChangeView center={userLoc} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      <Marker position={userLoc}><Popup>Siz shu yerdasiz</Popup></Marker>

      {masters.map(m => (
        <Marker key={m.id} position={[m.lat, m.lng]}>
          <Popup>
            <div style={{ color: '#000', minWidth: '150px' }}>
              <h3 style={{margin: '0'}}>{m.name}</h3>
              <p style={{margin: '5px 0'}}>💰 {m.price ? `${m.price} so'm` : "Kelishilgan"}</p>
              <p style={{margin: '5px 0', fontSize: '12px'}}>⭐ {m.rating} | ✅ {m.jobs} yordam</p>
              <button onClick={() => sendMessage(m)} style={{ width: '100%', background: '#FFB800', border: 'none', padding: '8px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                💬 {t('call')}
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default Maps;
