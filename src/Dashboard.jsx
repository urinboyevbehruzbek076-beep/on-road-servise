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
  const [loading, setLoading] = useState(false);
  
  const [profileInfo, setProfileInfo] = useState({ 
    name: '', 
    phone: '', 
    service: 'Evakuator', 
    price: '', // NARX SHU YERDA
    isAvailable: true 
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
    if (!profileInfo.name || !profileInfo.phone) return alert("Ma'lumotlarni kiriting!");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const docRef = await addDoc(collection(db, role === 'master' ? "masters" : "users"), {
          ...profileInfo,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          rating: (Math.random() * (5 - 4.5) + 4.5).toFixed(1),
          jobs: Math.floor(Math.random() * 20) + 1,
          createdAt: serverTimestamp()
        });
        setDocId(docRef.id);
        setIsSaved(true);
      } catch (e) { alert(e.message); }
      setLoading(false);
    });
  };

  const updateProfile = async () => {
    if (docId) {
      await updateDoc(doc(db, "masters", docId), {
        name: profileInfo.name,
        service: profileInfo.service,
        price: profileInfo.price // NARXNI BAZADA YANGILASH
      });
      setIsEditing(false);
    }
  };

  const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', background: '#000', color: '#fff', border: '1px solid #333', borderRadius: '10px' };

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', color: '#fff', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
        <h2 style={{ color: '#FFB800', fontWeight: '900' }}>ON ROAD SERVICE</h2>
        <button onClick={() => setStep('landing')} style={{ background: '#FF4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: 'bold' }}>{t('logout')}</button>
      </header>

      {isSaved && role === 'master' && (
        <div style={{ background: '#1A1A1A', padding: '20px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #FFB800' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{color: '#FFB800', margin: 0}}>{t('master')}</h3>
            <button onClick={() => isEditing ? updateProfile() : setIsEditing(true)} style={{ background: '#FFB800', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: '900' }}>
              {isEditing ? t('save') : t('edit')}
            </button>
          </div>

          {isEditing ? (
            <div>
              <label style={{fontSize: '12px', color: '#888'}}>Ism:</label>
              <input value={profileInfo.name} style={inputStyle} onChange={e => setProfileInfo({...profileInfo, name: e.target.value})} />
              <label style={{fontSize: '12px', color: '#888'}}>Xizmat:</label>
              <select style={inputStyle} value={profileInfo.service} onChange={e => setProfileInfo({...profileInfo, service: e.target.value})}>
                {services.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <label style={{fontSize: '12px', color: '#888'}}>Narx (so'm):</label>
              <input type="number" placeholder="Masalan: 50000" value={profileInfo.price} style={inputStyle} onChange={e => setProfileInfo({...profileInfo, price: e.target.value})} />
            </div>
          ) : (
            <div style={{fontSize: '16px', lineHeight: '1.8'}}>
              <p>👤 <b>{profileInfo.name}</b></p>
              <p>🛠 <b>{profileInfo.service}</b></p>
              <p>💰 <b>{profileInfo.price ? `${profileInfo.price} so'm` : "Narx belgilanmagan"}</b></p>
            </div>
          )}
        </div>
      )}

      {!isSaved ? (
        <div style={{ background: '#1A1A1A', padding: '30px', borderRadius: '25px', maxWidth: '400px', margin: '40px auto', border: '1px solid #333' }}>
          <h3 style={{ color: '#FFB800', textAlign: 'center', marginBottom: '20px' }}>ON ROAD SERVICE</h3>
          <input placeholder={t('name_placeholder')} style={inputStyle} onChange={e => setProfileInfo({...profileInfo, name: e.target.value})} />
          <input placeholder={t('phone_placeholder')} style={inputStyle} onChange={e => setProfileInfo({...profileInfo, phone: e.target.value})} />
          <button onClick={handleSave} style={{ width: '100%', padding: '15px', background: '#FFB800', color: '#000', borderRadius: '10px', fontWeight: '900', border: 'none' }}>{loading ? t('loading') : t('start')}</button>
        </div>
      ) : (
        role === 'user' && (
          <>
            <div style={{ height: '400px', borderRadius: '20px', overflow: 'hidden', border: '2px solid #333', marginBottom: '20px' }}>
              <Maps filterService={selectedService} senderInfo={profileInfo} services={services} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {services.map(s => (
                <button key={s.id} onClick={() => setSelectedService(s.id)} style={{ padding: '15px', borderRadius: '12px', background: selectedService === s.id ? '#FFB800' : '#1A1A1A', color: selectedService === s.id ? '#000' : '#fff', border: 'none', fontWeight: 'bold' }}>{s.icon} {s.label}</button>
              ))}
            </div>
          </>
        )
      )}

      {isSaved && role === 'master' && !isEditing && (
        <div style={{ background: '#1A1A1A', padding: '20px', borderRadius: '20px' }}>
          <h3 style={{ color: '#FFB800' }}>📬 {t('messages')}: {messages.length}</h3>
          {messages.map(msg => (
            <div key={msg.id} style={{ background: '#0D0D0D', padding: '15px', borderRadius: '15px', marginBottom: '10px', borderLeft: '5px solid #FFB800' }}>
              <p>👤 <b>{msg.senderName}</b> | 📞 {msg.senderPhone}</p>
              <p style={{color: '#FFB800'}}>💬 {msg.text}</p>
              <button onClick={() => window.open(`tel:${msg.senderPhone}`)} style={{ background: '#00C851', border: 'none', padding: '10px 20px', borderRadius: '8px', color: '#fff', fontWeight: 'bold' }}>📞 {t('call')}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
