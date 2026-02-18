import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./firebase";

// Marker piktogrammalari
const greenIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const redIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const blueIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center]);
  return null;
}

function Maps({ filterService, senderInfo }) {
  const [masters, setMasters] = useState([]);
  const [userLocation, setUserLocation] = useState([41.3111, 69.2797]);

  // Haydovchi uchun cheklangan tayyor xabarlar
  const readyMessages = [
    "🆘 Yordam bering, yo'lda qoldim",
    "🚛 Menga evakuator kerak",
    "⛽ Benzinim tugab qoldi",
    "🔧 Balonni almashtirish kerak",
    "⚡ Akkumulyatorda muammo bor"
  ];

  useEffect(() => {
    const fetchMasters = async () => {
      const querySnapshot = await getDocs(collection(db, "masters"));
      setMasters(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchMasters();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]));
    }
  }, []);

  const sendMessage = async (masterId, text) => {
    try {
      await addDoc(collection(db, "messages"), {
        senderName: senderInfo.name,
        senderPhone: senderInfo.phone,
        receiverId: masterId,
        text: text,
        createdAt: new Date()
      });
      alert("Xabar yuborildi! Usta tez orada bog'lanadi.");
    } catch (e) { alert("Xatolik yuz berdi."); }
  };

  const filteredMasters = masters.filter(m => !filterService || m.service === filterService);

  return (
    <div style={{ height: "400px", width: "100%", borderRadius: "15px", border: "2px solid #FFD700", overflow: "hidden", position: "relative" }}>
      <MapContainer center={userLocation} zoom={13} style={{ height: "100%", width: "100%", background: "#000" }}>
        <ChangeView center={userLocation} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        <Marker position={userLocation} icon={blueIcon}><Popup>Siz</Popup></Marker>

        {filteredMasters.map((m) => {
          const mLat = parseFloat(m.lat);
          const mLng = parseFloat(m.lng);
          if (isNaN(mLat) || isNaN(mLng)) return null;

          return (
            <Marker key={m.id} position={[mLat, mLng]} icon={m.isAvailable ? greenIcon : redIcon}>
              <Popup>
                <div style={{ color: "#000", minWidth: '160px', textAlign: 'center' }}>
                  <h4 style={{margin: '0 0 5px 0'}}>{m.name}</h4>
                  <p style={{fontSize:'12px', margin:'5px 0'}}>📞 {m.phone}</p>
                  <hr/>

Behruzbek, [18/02/2026 3:21 AM]
<p style={{fontSize:'11px', fontWeight:'bold', margin:'5px 0'}}>Xabar yuborish:</p>
                  {readyMessages.map((msg, idx) => (
                    <button key={idx} onClick={() => sendMessage(m.id, msg)} 
                      style={{ display:'block', width:'100%', padding:'6px', marginBottom:'4px', fontSize:'10px', backgroundColor:'#f8f8f8', border:'1px solid #ddd', borderRadius:'4px', cursor:'pointer', textAlign:'left' }}>
                      {msg}
                    </button>
                  ))}
                  <button onClick={() => window.open(`tel:${m.phone}`)} style={{ width:'100%', padding:'10px', marginTop:'5px', backgroundColor:'#FFD700', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer' }}>📞 Qo'ng'iroq</button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default React.memo(Maps);