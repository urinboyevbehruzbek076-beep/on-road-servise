import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "./firebase";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { useTranslation } from 'react-i18next';

// Ikonkalarni to'g'rilash
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
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
  const [activeMaster, setActiveMaster] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]));
    let q = query(collection(db, "masters"), where("isAvailable", "==", true));
    if (filterService) q = query(q, where("service", "==", filterService));
    return onSnapshot(q, (snapshot) => setMasters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, [filterService]);

  const sendTemplateMessage = async (master, text) => {
    try {
      await addDoc(collection(db, "messages"), {
        senderName: senderInfo.name,
        senderPhone: senderInfo.phone,
        receiverId: master.id,
        text: text,
        createdAt: serverTimestamp()
      });
      alert(t('message_sent'));
      setActiveMaster(null);
    } catch (e) { alert(e.message); }
  };

  const templates = [
    "🆘 Menga tezkor yordam kerak!",
    "⛽ Benzinim tugab qoldi, yetkazib bera olasizmi?",
    "🔧 Balonim teshildi, almashtirish kerak.",
    "⚡ Akkumulyatordan o't oldirish (start) kerak.",
    "📞 Iltimos, menga qo'ng'iroq qiling!"
  ];

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer center={userLoc} zoom={13} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={userLoc} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={userLoc}><Popup>Siz shu yerdasiz</Popup></Marker>
        {masters.map(m => (
          <Marker key={m.id} position={[m.lat, m.lng]} eventHandlers={{ click: () => setActiveMaster(m) }} />
        ))}
      </MapContainer>

      {activeMaster && (
        <div style={{ position: 'absolute', bottom: '20px', left: '10px', right: '10px', background: '#1A1A1A', padding: '15px', borderRadius: '20px', zIndex: 1000, border: '1px solid #FFB800', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <b>{activeMaster.name} ({activeMaster.price} so'm)</b>
            <button onClick={() => setActiveMaster(null)} style={{ background: 'none', border: 'none', color: '#ff4444' }}>✖</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {templates.map((txt, i) => (
              <button key={i} onClick={() => sendTemplateMessage(activeMaster, txt)} style={{ background: '#333', color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '12px', textAlign: 'left' }}>{txt}</button>
            ))}
            <button onClick={() => window.open(`tel:${activeMaster.phone}`)} style={{ background: '#00C851', color: '#fff', padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>📞 To'g'ridan-to'g'ri qo'ng'iroq</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Maps;
  