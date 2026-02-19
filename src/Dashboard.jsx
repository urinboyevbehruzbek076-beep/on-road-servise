import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, updateDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useTranslation } from 'react-i18next';
import Maps from "./Maps";
// Dashboard.js ichidagi form sarlavhasi
<h3 style={{ color: '#FFB800', textAlign: 'center', marginBottom: '25px', fontSize: '20px' }}>
  ON ROAD SERVICE: {role === 'master' ? t('master') : t('driver')}
</h3>


const Dashboard = ({ role, setStep }) => {
  // Dashboard.js ichidagi Header
<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <h2 style={{ color: '#FFB800', margin: 0, fontSize: '22px', fontWeight: '900' }}>
      ON ROAD SERVICE
    </h2>
    <span style={{ fontSize: '10px', color: '#666' }}>ONLINE SYSTEM</span>
  </div>
  <button onClick={() => setStep('landing')} style={{ background: '#FF4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
    {t('logout')}
  </button>
</header>

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
    price: '', 
    isAvailable: true 
  });

  const services = [
    { id: 'Evakuator', icon: '🚛', label: t('evakuator'), msg: "🚨 Evakuator kerak!" },
    { id: 'Balon', icon: '🔧', label: t('balon'), msg: "🔧 Balon kerak!" },
    { id: 'Benzin', icon: '⛽', label: t('benzin'), msg: "⛽ Benzin kerak!" },
    { id: 'Start', icon: '⚡', label: t('battery'), msg: "⚡ Start kerak!" }
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
    if (!profileInfo.name || !profileInfo.phone) return alert("To'ldiring!");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const docRef = await addDoc(collection(db, role === 'master' ? "masters" : "users"), {
          ...profileInfo,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          rating: 4.8,
          jobs: 0,
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
        price: profileInfo.price
      });
      setIsEditing(false);
      alert("Profil yangilandi!");
    }
  };

  const toggleStatus = async () => {
    const newStatus = !profileInfo.isAvailable;
    setProfileInfo({ ...profileInfo, isAvailable: newStatus });
    if (docId) await updateDoc(doc(db, "masters", docId), { isAvailable: newStatus });
  };

  const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', background: '#000', color: '#fff', border: '1px solid #333', borderRadius: '10px' };

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', color: '#fff', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: '#FFB800' }}>ON-ROAD</h2>
        <button onClick={() => setStep('landing')} style={{ background: '#FF4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '10px' }}>{t('logout')}</button>
      </header>

      {isSaved && role === 'master' && (
        <div style={{ background: '#1A1A1A', padding: '20px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #333' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{color: '#FFB800', margin: 0}}>{t('master')}</h3>
            <div style={{display:'flex', gap:'10px'}}>
              <button onClick={() => setIsEditing(!isEditing)} style={{ background: '#FFB800', color: '#000', border: 'none', padding: '5px 15px', borderRadius: '8px', fontWeight: 'bold' }}>
                {isEditing ? t('save') : t('edit')}
              </button>
              <button onClick={toggleStatus} style={{ background: profileInfo.isAvailable ? '#00C851' : '#FF4444', border: 'none', padding: '5px 15px', borderRadius: '8px', color: '#fff' }}>
                {profileInfo.isAvailable ? t('available') : t('busy')}
              </button>
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            {isEditing ? (
              <div>
                <input placeholder="Ism" value={profileInfo.name} style={inputStyle} onChange={e => setProfileInfo({...profileInfo, name: e.target.value})} />
                <select style={inputStyle} value={profileInfo.service} onChange={e => setProfileInfo({...profileInfo, service: e.target.value})}>
                  {services.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <input placeholder="Xizmat narxi" value={profileInfo.price} style={inputStyle} onChange={e => setProfileInfo({...profileInfo, price: e.target.value})} />
                <button onClick={updateProfile} style={{width:'100%', background:'#00C851', color:'#fff', padding:'10px', borderRadius:'10px', border:'none'}}>{t('save')}</button>
              </div>
            ) : (
              <div style={{fontSize: '14px'}}>
                <p>👤 <b>{profileInfo.name}</b></p>
                <p>🛠 <b>{profileInfo.service}</b></p>
                <p>💰 <b>{profileInfo.price || '0'}</b> so'm</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!isSaved ? (
        <div style={{ background: '#1A1A1A', padding: '30px', borderRadius: '25px', maxWidth: '400px', margin: '40px auto' }}>
          <h3 style={{ color: '#FFB800', textAlign: 'center' }}>{t('registration')}</h3>
          <input placeholder={t('name_placeholder')} style={inputStyle} onChange={e => setProfileInfo({...profileInfo, name: e.target.value})} />
          <input placeholder={t('phone_placeholder')} style={inputStyle} onChange={e => setProfileInfo({...profileInfo, phone: e.target.value})} />
          <button onClick={handleSave} style={{ width: '100%', padding: '15px', background: '#FFB800', borderRadius: '10px', fontWeight: 'bold', border: 'none' }}>{loading ? t('loading') : t('start')}</button>
        </div>
      ) : (
        role === 'user' ? (
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
        ) : (
          <div style={{ background: '#1A1A1A', padding: '20px', borderRadius: '20px' }}>
            <h3 style={{ color: '#FFB800' }}>📬 {t('messages')}: {messages.length}</h3>
            {messages.map(msg => (
              <div key={msg.id} style={{ background: '#0D0D0D', padding: '15px', borderRadius: '15px', marginBottom: '10px', borderLeft: '5px solid #FFB800' }}>
                <p>👤 <b>{msg.senderName}</b> | 📞 {msg.senderPhone}</p>
                <p style={{color: '#FFB800'}}>💬 {msg.text}</p>
                <button onClick={() => window.open(`tel:${msg.senderPhone}`)} style={{ background: '#00C851', padding: '8px 15px', borderRadius: '8px', color: '#fff', border: 'none' }}>📞 {t('call')}</button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Dashboard; // KOMPONENTNI EXPORT QILISH!
