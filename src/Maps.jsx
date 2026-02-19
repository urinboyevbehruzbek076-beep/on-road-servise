import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // CSS majburiy!
import { db } from "./firebase";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { useTranslation } from 'react-i18next';

// Marker ikonkalari Leafletda yo'qolib qolmasligi uchun sozlama
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Xarita markazini yangilovchi yordamchi komponent
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

function Maps({ filterService, senderInfo, services }) {
  const { t } = useTranslation();
  const [userLoc, setUserLoc] = useState([41.2995, 69.2401]); // Default: Toshkent
  const [masters, setMasters] = useState([]);

  useEffect(() => {
    // Foydalanuvchi lokatsiyasini aniqlash
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
      () => console.log("Lokatsiyaga ruxsat berilmadi")
    );

    // Faqat "Bo'sh" (Available) ustalarni filtr bilan olish
    let q = query(collection(db, "masters"), where("isAvailable", "==", true));
    if (filterService) {
      q = query(q, where("service", "==", filterService));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMasters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [filterService]);

  const sendMessage = async (master) => {
    const selectedServiceData = services.find(s => s.id === filterService);
    const finalMessage = selectedServiceData ? selectedServiceData.msg : "🆘 Yordam kerak!";

    try {
      await addDoc(collection(db, "messages"), {
        senderName: senderInfo.name || "Mijoz",
        senderPhone: senderInfo.phone || "Noma'lum",
        receiverId: master.id,
        text: finalMessage,
        createdAt: serverTimestamp()
      });
      alert(t('message_sent'));
    } catch (e) {
      alert("Xato: " + e.message);
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', minHeight: '400px', background: '#111' }}>
      <MapContainer 
        center={userLoc} 
        zoom={13} 
        style={{ height: '400px', width: '100%', borderRadius: '20px' }}
      >
        <ChangeView center={userLoc} />
        <TileLayer 
          url="https://{s}://{z}/{x}/{y}{r}.png" 
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {/* Mijoz markeri */}
        <Marker position={userLoc}>
          <Popup>Siz shu yerdasiz</Popup>
        </Marker>

        {/* Ustalar markerlari */}
        {masters.map(m => (
          <Marker key={m.id} position={[m.lat, m.lng]}>
            <Popup>
              <div style={{ color: '#000', minWidth: '160px', fontFamily: 'sans-serif' }}>
                <h3 style={{ margin: '0 0 5px', fontSize: '16px' }}>{m.name}</h3>
                <div style={{ color: '#FFB800', marginBottom: '5px' }}>
                  {'★'.repeat(Math.floor(m.rating || 5))} 
                  <span style={{ color: '#666', fontSize: '12px' }}> ({m.rating || '5.0'})</span>
                </div>
                <p style={{ margin: '0', fontSize: '13px' }}>🛠 {m.service}</p>
                <p style={{ margin: '5px 0', fontSize: '14px', fontWeight: 'bold', color: '#28a745' }}>
                  💰 {m.price ? `${m.price} so'm` : "Kelishilgan narx"}
                </p>
                <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#888' }}>
                  ✅ {m.jobs || 0} {t('completed_jobs')}
                </p>
                <button 
                  onClick={() => sendMessage(m)} 
                  style={{ 
                    width: '100%', background: '#FFB800', border: 'none', 
                    padding: '8px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' 
                  }}
                >
                  💬 {t('call')}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Maps; // MANA SHU EKSPORT QATORI JUDA MUHIM!
