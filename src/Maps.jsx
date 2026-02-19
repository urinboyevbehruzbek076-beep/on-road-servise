import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { db } from "./firebase";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from "firebase/firestore";

const containerStyle = { width: "100%", height: "100%" };

// Xarita uchun Premium Dark Dizayn
const darkStyles = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
];

function Maps({ filterService, senderInfo }) {
  const [userLoc, setUserLoc] = useState(null);
  const [masters, setMasters] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [messageText, setMessageText] = useState("Menga yordam kerak!");

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY" // O'zingizning API kalitingizni qo'ying
  });

  useEffect(() => {
    // Foydalanuvchi joylashuvi
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });

    // Ustalarni filtr bilan yuklash
    let q = query(collection(db, "masters"), where("isAvailable", "==", true));
    if (filterService) {
      q = query(q, where("service", "==", filterService));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMasters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [filterService]);

  // Masofani hisoblash funksiyasi (KM da)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const sendMessage = async (master) => {
    try {
      await addDoc(collection(db, "messages"), {
        senderName: senderInfo.name,
        senderPhone: senderInfo.phone,
        receiverId: master.id,
        text: messageText,
        createdAt: serverTimestamp()
      });
      alert("Xabar yuborildi! Usta tez orada bog'lanadi.");
    } catch (e) { alert(e.message); }
  };

  return isLoaded && userLoc ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={userLoc}
      zoom={14}
      options={{ styles: darkStyles, disableDefaultUI: true }}
    >
      {/* Haydovchi markeri */}
      <Marker position={userLoc} icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png" />

      {/* Ustalar markerlari */}
      {masters.map(master => (
        <Marker
          key={master.id}
          position={{ lat: master.lat, lng: master.lng }}
          onClick={() => setSelectedMaster(master)}
        />
      ))}

      {selectedMaster && (
        <InfoWindow
          position={{ lat: selectedMaster.lat, lng: selectedMaster.lng }}
          onCloseClick={() => setSelectedMaster(null)}
        >
          <div style={{ color: "#000", padding: "5px", maxWidth: "200px", fontFamily: "sans-serif" }}>
            <h4 style={{ margin: "0 0 5px" }}>{selectedMaster.name}</h4>
            <p style={{ margin: "0", fontSize: "12px", color: "#555" }}>🛠 {selectedMaster.service}</p>

Behruzbek, [19/02/2026 3:20 PM]
<p style={{ margin: "5px 0", fontSize: "13px", fontWeight: "bold" }}>
              📍 Masofa: {calculateDistance(userLoc.lat, userLoc.lng, selectedMaster.lat, selectedMaster.lng)} km
            </p>
            
            <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
              <button 
                onClick={() => window.open(`tel:${selectedMaster.phone}`)}
                style={{ backgroundColor: "#00C851", color: "#fff", border: "none", padding: "8px", borderRadius: "5px", flex: 1, cursor: "pointer" }}
              >📞 Qo'ng'iroq</button>
              
              <button 
                onClick={() => sendMessage(selectedMaster)}
                style={{ backgroundColor: "#FFD700", color: "#000", border: "none", padding: "8px", borderRadius: "5px", flex: 1, cursor: "pointer", fontWeight: "bold" }}
              >💬 Xabar</button>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : <div style={{ color: "#FFD700", textAlign: "center", padding: "50px" }}>Xarita yuklanmoqda...</div>;
}

export default Maps;