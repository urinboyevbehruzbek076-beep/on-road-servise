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
  const [profileInfo, setProfileInfo] = useState({ name: '', phone: '', service: 'Evakuator', isAvailable: true });

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
          jobs: 12,
          createdAt: serverTimestamp()
        });
        setDocId(docRef.id);
        setIsSaved(true);
      } catch (e) { alert(e.message); }
      setLoading(false);
    });
  };

  const toggleStatus = async () => {
    const newStatus = !profileInfo.isAvailable;
    setProfileInfo({ ...profileInfo, isAvailable: newStatus });
    if (docId) await updateDoc(doc(db, "masters", docId), { isAvailable: newStatus });
  };

  const services = [
    { id: 'Evakuator', icon: '🚛', label: t('evakuator'), msg: "🚨 Evakuator kerak!" },
    { id: 'Balon', icon: '🔧', label: t('balon'), msg: "🔧 Balon kerak!" },
    { id: 'Benzin', icon: '⛽', label: t('benzin'), msg: "⛽ Benzin kerak!" },
    { id: 'Start', icon: '⚡', label: t('battery'), msg: "⚡ Start kerak!" }
  ];

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', color: '#fff', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: '#FFB800' }}>ON-ROAD</h2>
        <button onClick={() => setStep('landing')} style={{ background: '#FF4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '10px' }}>{t('logout')}</button>
      </header>

      {isSaved && role === 'master' && (
        <div style={{ background: '#1A1A1A', padding: '15px', borderRadius: '15px', marginBottom: '20px', border: '1px solid #333' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {isEditing ? (
              <input defaultValue={profileInfo.name} style={{background:'#000', color:'#fff', border:'1px solid #FFB800', padding:'5px'}} onBlur={async (e) => {
                setProfileInfo({...profileInfo, name: e.target.value});
                await updateDoc(doc(db, "masters", docId), { name: e.target.value });
              }} />
            ) : ( <h3>{profileInfo.name}</h3> )}
            <div style={{display:'flex', gap:'10px'}}>
              <button onClick={() => setIsEditing(!isEditing)} style={{background:'#444', color:'#fff', border:'none', padding:'5px 10px', borderRadius:'5px'}}>{isEditing ? t('save') : t('edit')}</button>
              <button onClick={toggleStatus} style={{ background: profileInfo.isAvailable ? '#00C851' : '#FF4444', border: 'none', padding: '5px 15px', borderRadius: '5px', color: '#fff', fontWeight: 'bold' }}>{profileInfo.isAvailable ? t('available') : t('busy')}</button>
            </div>
          </div>
        </div>
      )}

      {!isSaved ? (
        <div style={{ background: '#1A1A1A', padding: '30px', borderRadius: '25px', maxWidth: '400px', margin: '0 auto' }}>
          <h3 style={{ color: '#FFB800', textAlign: 'center' }}>{t('registration')}</h3>
          <input placeholder={t('name_placeholder')} style={{ width: '100%', padding: '15px', marginBottom: '10px', background: '#000', color: '#fff', border: '1px solid #333', borderRadius: '10px' }} onChange={e => setProfileInfo({...profileInfo, name: e.target.value})} />
          <input placeholder={t('phone_placeholder')} style={{ width: '100%', padding: '15px', marginBottom: '20px', background: '#000', color: '#fff', border: '1px solid #333', borderRadius: '10px' }} onChange={e => setProfileInfo({...profileInfo, phone: e.target.value})} />
          <button onClick={handleSave} style={{ width: '100%', padding: '15px', background: '#FFB800', color: '#000', borderRadius: '10px', fontWeight: 'bold' }}>{loading ? t('loading') : t('start')}</button>
        </div>
      ) : (
        role === 'user' ? (
          <>
            <div style={{ height: '400px', borderRadius: '20px', overflow: 'hidden', border: '2px solid #333', marginBottom: '20px' }}>
              <Maps filterService={selectedService} senderInfo={profileInfo} services={services} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {services.map(s => (
                <button key={s.id} onClick={() => setSelectedService(s.id)} style={{ padding: '15px', borderRadius: '12px', background: selectedService === s.id ? '#FFB800' : '#1A1A1A', color: selectedService === s.id ? '#000' : '#fff', border: 'none' }}>{s.icon} {s.label}</button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ background: '#1A1A1A', padding: '20px', borderRadius: '20px' }}>
            <h3 style={{ color: '#FFB800' }}>📬 {t('messages')}: {messages.length}</h3>
            {messages.map(msg => (
              <div key={msg.id} style={{ background: '#0D0D0D', padding: '15px', borderRadius: '15px', marginBottom: '10px', borderLeft: '4px solid #FFB800' }}>
                <p>👤 <b>{msg.senderName}</b> | 📞 {msg.senderPhone}</p>
                <p style={{color: '#FFB800'}}>💬 {msg.text}</p>
                <button onClick={() => window.open(`tel:${msg.senderPhone}`)} style={{ background: '#00C851', padding: '10px', borderRadius: '8px', color: '#fff', border: 'none' }}>📞 {t('call')}</button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
export default Dashboard;
