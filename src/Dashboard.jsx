import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, updateDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useTranslation } from 'react-i18next';
import Maps from "./Maps";

const Dashboard = ({ role, setStep }) => {
  const { t } = useTranslation();
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [docId, setDocId] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [messages, setMessages] = useState([]);
  const [profileInfo, setProfileInfo] = useState({ name: '', phone: '', service: 'Evakuator', price: '', isAvailable: true });

  const services = [
    { id: 'Evakuator', icon: '🚛', label: 'Evakuator', msg: "🆘 Evakuator kerak!" },
    { id: 'Balon', icon: '🔧', label: 'Balon', msg: "🔧 Balon teshildi!" },
    { id: 'Benzin', icon: '⛽', label: 'Benzin', msg: "⛽ Benzin tugadi!" },
    { id: 'Start', icon: '⚡', label: 'Start', msg: "⚡ Start kerak!" }
  ];

  useEffect(() => {
    if (isSaved && role === 'master' && docId) {
      const q = query(collection(db, "messages"), where("receiverId", "==", docId), orderBy("createdAt", "desc"));
      return onSnapshot(q, (snapshot) => setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    }
  }, [isSaved, docId, role]);

  const handleSave = async () => {
    if (!profileInfo.name || !profileInfo.phone) return alert("To'ldiring!");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const docRef = await addDoc(collection(db, role === 'master' ? "masters" : "users"), {
        ...profileInfo, lat: pos.coords.latitude, lng: pos.coords.longitude, rating: 5.0, jobs: 0, createdAt: serverTimestamp()
      });
      setDocId(docRef.id); setIsSaved(true);
    });
  };

  const toggleStatus = async () => {
    const newStatus = !profileInfo.isAvailable;
    setProfileInfo({ ...profileInfo, isAvailable: newStatus });
    if (docId) await updateDoc(doc(db, "masters", docId), { isAvailable: newStatus });
  };

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', color: '#fff', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: '#FFB800' }}>ON ROAD SERVICE</h2>
        <button onClick={() => setStep('landing')} style={{ background: '#FF4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '10px' }}>{t('logout')}</button>
      </header>

      {isSaved && role === 'master' && (
        <div style={{ background: '#1A1A1A', padding: '15px', borderRadius: '15px', border: '1px solid #FFB800', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {isEditing ? (
              <div style={{ width: '100%' }}>
                <input value={profileInfo.name} style={{width:'100%', padding:'5px', marginBottom:'5px'}} onChange={e => setProfileInfo({...profileInfo, name: e.target.value})} />
                <select value={profileInfo.service} style={{width:'100%', padding:'5px', marginBottom:'5px'}} onChange={e => setProfileInfo({...profileInfo, service: e.target.value})}>
                  {services.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <input placeholder="Narx" value={profileInfo.price} style={{width:'100%', padding:'5px'}} onChange={e => setProfileInfo({...profileInfo, price: e.target.value})} />
              </div>
            ) : (
              <div><h3>{profileInfo.name}</h3><p>{profileInfo.service} | {profileInfo.price} so'm</p></div>
            )}
            <div style={{display:'flex', gap:'5px', height:'40px'}}>
              <button onClick={async () => { if(isEditing) await updateDoc(doc(db, "masters", docId), {name: profileInfo.name, service: profileInfo.service, price: profileInfo.price}); setIsEditing(!isEditing); }}>{isEditing ? t('save') : t('edit')}</button>
              <button onClick={toggleStatus} style={{background: profileInfo.isAvailable ? '#00C851' : '#FF4444', color:'#fff'}}>{profileInfo.isAvailable ? t('available') : t('busy')}</button>
            </div>
          </div>
        </div>
      )}

      {!isSaved ? (
        <div style={{ background: '#1A1A1A', padding: '30px', borderRadius: '20px', maxWidth: '400px', margin: '0 auto' }}>
          <h3 style={{textAlign:'center', color:'#FFB800'}}>ON ROAD SERVICE</h3>
          <input placeholder={t('name_placeholder')} style={{width:'100%', padding:'10px', marginBottom:'10px'}} onChange={e => setProfileInfo({...profileInfo, name: e.target.value})} />
          <input placeholder={t('phone_placeholder')} style={{width:'100%', padding:'10px', marginBottom:'20px'}} onChange={e => setProfileInfo({...profileInfo, phone: e.target.value})} />
          <button onClick={handleSave} style={{width:'100%', padding:'10px', background:'#FFB800', fontWeight:'bold'}}>{t('start')}</button>
        </div>
      ) : (
        role === 'user' && (
          <div style={{ height: '400px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #333' }}>
            <Maps filterService={selectedService} senderInfo={profileInfo} services={services} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              {services.map(s => <button key={s.id} onClick={() => setSelectedService(s.id)} style={{background: selectedService===s.id ? '#FFB800' : '#1A1A1A', color: selectedService===s.id ? '#000' : '#fff', padding:'10px', border:'none', borderRadius:'10px'}}>{s.icon} {s.label}</button>)}
            </div>
          </div>
        )
      )}
      {/* Messages rendering logic here... */}
    </div>
  );
};
export default Dashboard;
