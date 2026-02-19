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
  const [profileInfo, setProfileInfo] = useState({ 
    name: '', phone: '', service: 'Evakuator', price: '', isAvailable: true 
  });

  const services = [
    { id: 'Evakuator', icon: '🚛', label: t('evakuator'), msg: "🚨 ON ROAD SERVICE: Evakuator kerak!" },
    { id: 'Balon', icon: '🔧', label: t('balon'), msg: "🔧 ON ROAD SERVICE: Balon kerak!" },
    { id: 'Benzin', icon: '⛽', label: t('benzin'), msg: "⛽ ON ROAD SERVICE: Benzin kerak!" },
    { id: 'Start', icon: '⚡', label: t('battery'), msg: "⚡ ON ROAD SERVICE: Start kerak!" }
  ];

  useEffect(() => {
    if (isSaved && role === 'master' && docId) {
      const q = query(collection(db, "messages"), where("receiverId", "==", docId), orderBy("createdAt", "desc"));
      return onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }
  }, [isSaved, docId, role]);

  const handleSave = async () => {
    if (!profileInfo.name || !profileInfo.phone) return alert("Ma'lumotlarni to'ldiring!");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const docRef = await addDoc(collection(db, role === 'master' ? "masters" : "users"), {
        ...profileInfo, lat: pos.coords.latitude, lng: pos.coords.longitude,
        rating: 5.0, jobs: 0, createdAt: serverTimestamp()
      });
      setDocId(docRef.id); setIsSaved(true);
    });
  };

  const updateMasterProfile = async () => {
    if (docId) {
      await updateDoc(doc(db, "masters", docId), {
        service: profileInfo.service,
        price: profileInfo.price
      });
      setIsEditing(false);
      alert("Profil yangilandi!");
    }
  };

  const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', background: '#000', color: '#fff', border: '1px solid #333', borderRadius: '10px' };

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', color: '#fff', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ color: '#FFB800', fontWeight: '900', margin: 0 }}>ON ROAD SERVICE</h2>
        <button onClick={() => setStep('landing')} style={{ background: '#FF4444', border: 'none', padding: '8px 15px', borderRadius: '10px', color: '#fff', fontWeight: 'bold' }}>{t('logout')}</button>
      </header>

      {!isSaved ? (
        <div style={{ background: '#1A1A1A', padding: '30px', borderRadius: '25px', maxWidth: '400px', margin: '40px auto' }}>
          <h3 style={{ color: '#FFB800', textAlign: 'center' }}>{t('registration')}</h3>
          <input placeholder={t('name_placeholder')} style={inputStyle} onChange={e => setProfileInfo({...profileInfo, name: e.target.value})} />
          <input placeholder={t('phone_placeholder')} style={inputStyle} onChange={e => setProfileInfo({...profileInfo, phone: e.target.value})} />
          <button onClick={handleSave} style={{ width: '100%', padding: '15px', background: '#FFB800', borderRadius: '10px', fontWeight: 'bold', border: 'none' }}>{t('start')}</button>
        </div>
      ) : (
        role === 'user' ? (
          <>
            <div style={{ height: '450px', borderRadius: '25px', overflow: 'hidden', border: '2px solid #333', marginBottom: '20px' }}>
              <Maps filterService={selectedService} senderInfo={profileInfo} services={services} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {services.map(s => (
                <button key={s.id} onClick={() => setSelectedService(s.id)} style={{ padding: '15px', borderRadius: '12px', background: selectedService === s.id ? '#FFB800' : '#1A1A1A', color: selectedService === s.id ? '#000' : '#fff', border: 'none', fontWeight: 'bold' }}>{s.icon} {s.label}</button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ background: '#1A1A1A', padding: '20px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #333', position: 'relative' }}>
              <button onClick={() => setIsEditing(true)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>⚙️</button>
              <h3 style={{ margin: '0 0 10px', color: '#FFB800' }}>{profileInfo.name}</h3>
              <p>🛠 {profileInfo.service} | 💰 {profileInfo.price || '0'} so'm</p>
              <button onClick={async () => {
                const s = !profileInfo.isAvailable;
                setProfileInfo({...profileInfo, isAvailable: s});
                await updateDoc(doc(db, "masters", docId), {isAvailable: s});
              }} style={{ background: profileInfo.isAvailable ? '#00C851' : '#FF4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px' }}>
                {profileInfo.isAvailable ? t('available') : t('busy')}
              </button>
            </div>

            {isEditing && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: '#1A1A1A', padding: '25px', borderRadius: '20px', width: '320px' }}>
                  <h4 style={{ color: '#FFB800' }}>Profilni tahrirlash</h4>
                  <select style={inputStyle} value={profileInfo.service} onChange={e => setProfileInfo({...profileInfo, service: e.target.value})}>
                    {services.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <input placeholder="Xizmat narxi" value={profileInfo.price} style={inputStyle} onChange={e => setProfileInfo({...profileInfo, price: e.target.value})} />
                  <button onClick={updateMasterProfile} style={{ width: '100%', padding: '10px', background: '#FFB800', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>Saqlash</button>
                  <button onClick={() => setIsEditing(false)} style={{ width: '100%', marginTop: '10px', background: 'none', border: '1px solid #444', color: '#888', padding: '10px', borderRadius: '10px' }}>Yopish</button>
                </div>
              </div>
            )}

            <div style={{ background: '#1A1A1A', padding: '20px', borderRadius: '20px' }}>
              <h3 style={{ color: '#FFB800' }}>📬 {t('messages')} ({messages.length})</h3>
              {messages.map(msg => (
                <div key={msg.id} style={{ background: '#0D0D0D', padding: '15px', borderRadius: '15px', marginBottom: '10px', borderLeft: '5px solid #FFB800' }}>
                  <p>👤 <b>{msg.senderName}</b> | 📞 {msg.senderPhone}</p>
                  <p style={{color: '#FFB800'}}>💬 {msg.text}</p>
                  <button onClick={() => window.open(`tel:${msg.senderPhone}`)} style={{ background: '#00C851', border: 'none', padding: '8px 15px', borderRadius: '8px', color: '#fff' }}>📞 {t('call')}</button>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Dashboard;
