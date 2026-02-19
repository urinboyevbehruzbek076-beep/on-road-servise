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
  const [profileInfo, setProfileInfo] = useState({ name: '', phone: '', service: 'Evakuator', price: '', isAvailable: true });

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
    if (!profileInfo.name || !profileInfo.phone) return alert("To'liq to'ldiring!");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const docRef = await addDoc(collection(db, role === 'master' ? "masters" : "users"), {
          ...profileInfo,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          rating: 4.9,
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
      alert("ON ROAD SERVICE: Profil yangilandi!");
    }
  };

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', color: '#fff', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
        <h2 style={{ color: '#FFB800', fontWeight: '900' }}>ON ROAD SERVICE</h2>
        <button onClick={() => setStep('landing')} style={{ background: '#FF4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '10px' }}>{t('logout')}</button>
      </header>

      {isSaved && role === 'master' && (
        <div style={{ background: '#1A1A1A', padding: '20px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #FFB800' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{color: '#FFB800', margin: 0}}>{t('master')}</h3>
            <button onClick={() => isEditing ? updateProfile() : setIsEditing(true)} style={{ background: '#FFB800', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: 'bold' }}>
              {isEditing ? t('save') : t('edit')}
            </button>
          </div>
          <div style={{ marginTop: '15px' }}>
            {isEditing ? (
              <div>
                <input value={profileInfo.name} style={{width:'100%', padding:'10px', marginBottom:'10px', background:'#000', color:'#fff'}} onChange={e => setProfileInfo({...profileInfo, name: e.target.value})} />
                <select style={{width:'100%', padding:'10px', marginBottom:'10px', background:'#000', color:'#fff'}} value={profileInfo.service} onChange={e => setProfileInfo({...profileInfo, service: e.target.value})}>
                  {services.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <input placeholder="Xizmat narxi (so'm)" value={profileInfo.price} style={{width:'100%', padding:'10px', background:'#000', color:'#fff'}} onChange={e => setProfileInfo({...profileInfo, price: e.target.value})} />
              </div>
            ) : (
              <div>
                <p>👤 <b>{profileInfo.name}</b></p>
                <p>🛠 <b>{profileInfo.service}</b></p>
                <p>💰 <b>{profileInfo.price ? `${profileInfo.price} so'm` : "Narx kiritilmagan"}</b></p>
              </div>
            )}
          </div>
        </div>
      )}

      {!isSaved ? (
        <div style={{ background: '#1A1A1A', padding: '30px', borderRadius: '25px', maxWidth: '400px', margin: '40px auto' }}>
          <h3 style={{ color: '#FFB800', textAlign: 'center' }}>ON ROAD SERVICE</h3>
          <input placeholder={t('name_placeholder')} style={{width:'100%', padding:'15px', marginBottom:'10px', background:'#000', color:'#fff'}} onChange={e => setProfileInfo({...profileInfo, name: e.target.value})} />
          <input placeholder={t('phone_placeholder')} style={{width:'100%', padding:'15px', marginBottom:'20px', background:'#000', color:'#fff'}} onChange={e => setProfileInfo({...profileInfo, phone: e.target.value})} />
          <button onClick={handleSave} style={{ width: '100%', padding: '15px', background: '#FFB800', borderRadius: '10px', fontWeight: 'bold' }}>{loading ? t('loading') : t('start')}</button>
        </div>
      ) : (
        role === 'user' && (
          <div style={{ height: '450px', borderRadius: '20px', overflow: 'hidden', border: '2px solid #333' }}>
            <Maps filterService={selectedService} senderInfo={profileInfo} services={services} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              {services.map(s => (
                <button key={s.id} onClick={() => setSelectedService(s.id)} style={{ padding: '10px', borderRadius: '10px', background: selectedService === s.id ? '#FFB800' : '#1A1A1A', color: selectedService === s.id ? '#000' : '#fff' }}>{s.icon} {s.label}</button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};
export default Dashboard;
