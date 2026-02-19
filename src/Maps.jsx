import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "./firebase";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from "firebase/firestore";

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
  const [userLoc, setUserLoc] = useState([41.2995, 69.2401]);
  const [masters, setMasters] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]));
    let q = query(collection(db, "masters"), where("isAvailable", "==", true));
    if (filterService) q = query(q, where("service", "==", filterService));
    return onSnapshot(q, (snapshot) => setMasters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, [filterService]);

  return (
    <MapContainer center={userLoc} zoom={13} style={{ height: '100%', width: '100%' }}>
      <ChangeView center={userLoc} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={userLoc}><Popup>Siz shu yerdasiz</Popup></Marker>
      {masters.map(m => (
        <Marker key={m.id} position={[m.lat, m.lng]}>
          <Popup><b>{m.name}</b><br/>💰 {m.price} so'm<br/>⭐ {m.rating}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
export default Maps;
