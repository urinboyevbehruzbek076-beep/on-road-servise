import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useTranslation } from 'react-i18next';
import Maps from "./Maps";

const Dashboard = ({ role, setStep }) => {
  const { t } = useTranslation();
  const [isSaved, setIsSaved] = useState(false);
  const [docId, setDocId] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileInfo, setProfileInfo] = useState({ name: '', phone: '', service: 'Evakuator' });

  useEffect(() => {
    if (isSaved && role === 'master' && docId) {
      const q = query(collection(db, "messages"), where("receiverId", "==", docId), orderBy("createdAt", "desc"));
      return onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }
  }, [isSaved, docId, role]);

  const handleSave = async () => {
    if (!profileInfo.name || !profileInfo.phone) return alert(t('name_placeholder'));
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const docRef = await addDoc(collection(db, role === 'master' ? "masters" : "users"), {
          ...profileInfo,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isAvailable: true,
          rating: (Math.random() * (5 - 4.2) + 4.2).toFixed(1), // Demo reyting
          jobs: Math.floor(Math.random() * 80) + 5, // Demo ishlar soni
          createdAt: serverTimestamp()
        });
        setDocId(docRef.id);
        setIsSaved(true);
      } catch (e) { alert(e.message); }
      setLoading(false);
    });
  };

  const services = [
    { id: 'Evakuator', icon: '🚛', label: t('evakuator'), msg: "🚨 Evakuator kerak!" },
    { id: 'Balon', icon: '🔧', label: t('balon'), msg: "🔧 Balon almashtirish kerak!" },
    { id: 'Benzin', icon: '⛽', label: t('benzin'), msg: "⛽ Benzin tugadi!" },
    { id: 'Start', icon: '⚡', label: t('battery'), msg: "⚡ Akkumulyatordan o't oldirish kerak!" }
  ];

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', color: '#fff', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: '#FFB800', margin: 0 }}>ON-ROAD</h2>
        <button onClick={() => setStep('landing')} style={{ background: '#FF4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: 'bold' }}>{t('logout')}</button>
      </header>

      {!isSaved ? (
        <div style={{ background: '#1A1A1A', padding: '30px', borderRadius: '25px', maxWidth: '400px', margin: '40px auto', border: '1px solid #333' }}>
          <h3 style={{ color: '#FFB800', textAlign: 'center', marginBottom: '20px' }}>{t('registration')}</h3>
          <input placeholder={t('name_placeholder')} style={{ width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '10px', border: '1px solid #333', background: '#000', color: '#fff', boxSizing: 'border-box' }} onChange={e => setProfileInfo({...profileInfo, name: e.target.value})} />
          <input placeholder={t('phone_placeholder')} style={{ width: '100%', padding: '15px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #333', background: '#000', color: '#fff', boxSizing: 'border-box' }} onChange={e => setProfileInfo({...profileInfo, phone: e.target.value})} />
          <button onClick={handleSave} style={{ width: '100%', padding: '15px', background: '#FFB800', color: '#000', borderRadius: '10px', fontWeight: '900', border: 'none' }}>{loading ? t('loading') : t('start')}</button>
        </div>
      ) : (
        role === 'user' ? (
          <>
            <div style={{ height: '400px', borderRadius: '25px', overflow: 'hidden', border: '2px solid #333', marginBottom: '20px' }}>
              <Maps filterService={selectedService} senderInfo={profileInfo} services={services} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {services.map(s => (
                <button key={s.id} onClick={() => setSelectedService(s.id)} style={{ padding: '15px', borderRadius: '15px', background: selectedService === s.id ? '#FFB800' : '#1A1A1A', color: selectedService === s.id ? '#000' : '#fff', border: 'none', fontWeight: 'bold' }}>{s.icon} {s.label}</button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ background: '#1A1A1A', padding: '20px', borderRadius: '20px' }}>
            <h3 style={{ color: '#FFB800' }}>📬 {t('messages')}: {messages.length}</h3>
            {messages.map(msg => (
              <div key={msg.id} style={{ background: '#0D0D0D', padding: '15px', borderRadius: '15px', marginBottom: '10px', borderLeft: '5px solid #FFB800' }}>
                <p style={{margin: '0 0 5px'}}>👤 <b>{msg.senderName}</b> | 📞 {msg.senderPhone}</p>
                <p style={{color: '#FFB800', margin: '0 0 10px'}}>💬 {msg.text}</p>
                <button onClick={() => window.open(`tel:${msg.senderPhone}`)} style={{ background: '#00C851', border: 'none', padding: '8px 15px', borderRadius: '8px', color: '#fff', fontWeight: 'bold' }}>📞 {t('call')}</button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
export default Dashboard;
