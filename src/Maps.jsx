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

// Zapravka uchun maxsus yashil ikonka
const gasIcon = L.divIcon({
  html: '<div style="font-size: 24px; background: white; border-radius: 50%; padding: 5px; border: 2px solid #00C851; display: flex; justify-content: center; align-items: center; box-shadow: 0 0 10px rgba(0,200,81,0.5);">⛽</div>',
  className: 'custom-gas-icon',
  iconSize: [35, 35]
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center); }, [center]);
  return null;
}

function Maps({ filterService, senderInfo, services, showGasStations }) {
  const { t } = useTranslation();
  const [userLoc, setUserLoc] = useState([41.2995, 69.2401]);
  const [masters, setMasters] = useState([]);
  const [activeMaster, setActiveMaster] = useState(null);

  // Demo Zapravkalar ma'lumotlari
  const gasStations = [
    { id: 101, lat: 41.3111, lng: 69.2797, name: "UNG Petro", types: "⛽ Benzin, ☁️ Metan", info: "Ochiq 24/7" },
    { id: 102, lat: 41.3250, lng: 69.2550, name: "Lukoil", types: "⛽ Benzin (AI-95, 98)", info: "Kafesi mavjud" },
    { id: 103, lat: 41.3000, lng: 69.2300, name: "Volt Energy", types: "⚡ Elektr quvvatlash", info: "Tezkor quvvatlash" },
    { id: 104, lat: 41.2850, lng: 69.2900, name: "Mustaqillik Gaz", types: "☁️ Metan, ⛽ Propan", info: "Navbat kam" }
  ];

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]));
    
    // Faqat bo'sh ustalarni eshitish
    let q = query(collection(db, "masters"), where("isAvailable", "==", true));
    if (filterService && filterService !== 'FuelStation') {
      q = query(q, where("service", "==", filterService));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMasters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
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
        
        {/* Mijoz markeri */}
        <Marker position={userLoc}><Popup>Siz shu yerdasiz</Popup></Marker>

        {/* USTALAR: Agar zapravka rejimi bo'lmasa chiqadi */}
        {filterService !== 'FuelStation' && masters.map(m => (
          <Marker 
            key={m.id} 
            position={[m.lat, m.lng]} 
            eventHandlers={{ click: () => setActiveMaster(m) }} 
          />
        ))}

        {/* ZAPRAVKALAR: Agar zapravka rejimi tanlangan bo'lsa chiqadi */}
        {filterService === 'FuelStation' && gasStations.map(gs => (
          <Marker key={gs.id} position={[gs.lat, gs.lng]} icon={gasIcon}>
            <Popup>
              <div style={{ color: '#000', minWidth: '150px' }}>
                <h3 style={{ margin: '0 0 5px', fontSize: '16px' }}>{gs.name}</h3>
                <p style={{ margin: '5px 0', fontSize: '13px' }}><b>Turlari:</b> {gs.types}</p>
                <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>ℹ️ {gs.info}</p>
                <button 
                  onClick={() => window.open(`https://www.google.com{gs.lat},${gs.lng}`)}
                  style={{ width: '100%', marginTop: '10px', background: '#00C851', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  📍 Yo'nalish chizish
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Usta bosilganda chiqadigan xabar paneli */}
      {activeMaster && (
        <div style={{ position: 'absolute', bottom: '20px', left: '10px', right: '10px', background: '#1A1A1A', padding: '15px', borderRadius: '20px', zIndex: 1000, border: '1px solid #FFB800', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <b style={{color: '#fff'}}>{activeMaster.name} ({activeMaster.price || '0'} so'm)</b>
            <button onClick={() => setActiveMaster(null)} style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: '18px', cursor: 'pointer' }}>✖</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {templates.map((txt, i) => (
              <button key={i} onClick={() => sendTemplateMessage(activeMaster, txt)} style={{ background: '#333', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontSize: '13px', textAlign: 'left', cursor: 'pointer' }}>{txt}</button>
            ))}
            <button onClick={() => window.open(`tel:${activeMaster.phone}`)} style={{ background: '#00C851', color: '#fff', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>📞 To'g'ridan-to'g'ri qo'ng'iroq</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Maps;
