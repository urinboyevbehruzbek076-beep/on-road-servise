import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, updateDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useTranslation } from 'react-i18next';
import Maps from "./Maps";

const Dashboard = ({ role, setStep }) => {
  const { t } = useTranslation();
  const [isSaved, setIsSaved] = useState(false); // Ro'yxatdan o'tganlik holati
  const [isEditing, setIsEditing] = useState(false);
  const [docId, setDocId] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Profil ma'lumotlari
  const [profileInfo, setProfileInfo] = useState({ 
    name: '', 
    phone: '', 
    service: 'Evakuator', 
    price: '', 
    isAvailable: true 
  });

  const services = [
    { id: 'Evakuator', icon: '🚛', label: t('evakuator'), msg: "🆘 ON ROAD SERVICE: Evakuator kerak!" },
    { id: 'Balon', icon: '🔧', label: t('balon'), msg: "🔧 ON ROAD SERVICE: Balon kerak!" },
    { id: 'Benzin', icon: '⛽', label: t('benzin'), msg: "⛽ ON ROAD SERVICE: Benzin kerak!" },
    { id: 'Start', icon: '⚡', label: t('battery'), msg: "⚡ ON ROAD SERVICE: Start kerak!" }
  ];

  // Master uchun xabarlarni eshitish
  useEffect(() => {
    if (isSaved && role === 'master' && docId) {
      const q = query(collection(db, "messages"), where("receiverId", "==", docId), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [isSaved, docId, role]);

  // Bazaga saqlash va davom etish
  const handleSave = async () => {
    if (!profileInfo.name || !profileInfo.phone) {
      alert(t('name_placeholder') + " & " + t('phone_placeholder'));
      return;
    }
    setLoading(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const colName = role === 'master' ? "masters" : "users";
        const docRef = await addDoc(collection(db, colName), {
          ...profileInfo,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          rating: 5.0,
          jobs: 0,
          role: role,
          createdAt: serverTimestamp()
        });
        setDocId(docRef.id);
        setIsSaved(true); // FAQAT MUVAFFaqiyatli saqlangandan keyin o'tadi
      } catch (e) {
        alert("Firebase Error: " + e.message);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      alert("Lokatsiyaga ruxsat bering!");
      setLoading(false);
    });
  };

  const toggleStatus = async () => {
    const newStatus = !profileInfo.isAvailable;
    setProfileInfo({ ...profileInfo, isAvailable: newStatus });
    if (docId) await updateDoc(doc(db, "masters", docId), { isAvailable: newStatus });
  };

  const inputStyle = { width: '100%', padding: '15px', marginBottom: '15px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '12px', boxSizing: 'border-box' };

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', color: '#fff', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#FFB800', margin: 0, fontWeight: '900' }}>ON ROAD SERVICE</h2>
        <button onClick={() => setStep('landing')} style={{ background: '#FF4444', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>{t('logout')}</button>
      </header>

      {!isSaved ? (
        /* 1-QADAM: RO'YXATDAN O'TISH */
        <div style={{ background: '#1A1A1A', padding: '30px', borderRadius: '25px', maxWidth: '400px', margin: '40px auto', border: '1px solid #333' }}>
          <h3 style={{ color: '#FFB800', textAlign: 'center', marginBottom: '25px' }}>
            {role === 'master' ? t('master') : t('driver')} {t('registration')}
          </h3>
          <input 
            placeholder={t('name_placeholder')} 
            style={inputStyle} 
            onChange={e => setProfileInfo({...profileInfo, name: e.target.value})} 
          />
          <input 
            placeholder={t('phone_placeholder')} 
            type="tel"
            style={inputStyle} 
            onChange={e => setProfileInfo({...profileInfo, phone: e.target.value})} 
          />
          <button 
            onClick={handleSave} 
            disabled={loading}
            style={{ width: '100%', padding: '15px', background: '#FFB800', color: '#000', borderRadius: '12px', fontWeight: '900', border: 'none', cursor: 'pointer' }}
          >
            {loading ? t('loading') : t('start')}
          </button>
        </div>
      ) : (
        /* 2-QADAM: ASOSIY PANEL */
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {role === 'user' ? (
            /* HAYDOVCHI EKRANI */
            <>
              <div style={{ height: '450px', borderRadius: '25px', overflow: 'hidden', border: '2px solid #333', marginBottom: '20px' }}>
                <Maps filterService={selectedService} senderInfo={profileInfo} services={services} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {services.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => setSelectedService(s.id)} 
                    style={{ padding: '20px', borderRadius: '15px', background: selectedService === s.id ? '#FFB800' : '#1A1A1A', color: selectedService === s.id ? '#000' : '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* USTA EKRANI */
            <>
              <div style={{ background: '#1A1A1A', padding: '20px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #FFB800' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                      <h3 style={{margin: 0}}>{profileInfo.name}</h3>
                      <p style={{margin: '5px 0', color: '#888'}}>{profileInfo.service} | {profileInfo.price || '0'} so'm</p>
                   </div>
                   <button onClick={toggleStatus} style={{ background: profileInfo.isAvailable ? '#00C851' : '#FF4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {profileInfo.isAvailable ? t('available') : t('busy')}
                   </button>
                </div>
              </div>

              <div style={{ background: '#1A1A1A', padding: '20px', borderRadius: '20px' }}>
                <h3 style={{ color: '#FFB800', marginBottom: '20px' }}>📬 {t('messages')} ({messages.length})</h3>
                {messages.map(msg => (
                  <div key={msg.id} style={{ background: '#0D0D0D', padding: '15px', borderRadius: '15px', marginBottom: '10px', borderLeft: '5px solid #FFB800' }}>
                    <p style={{margin: '0 0 5px'}}>👤 <b>{msg.senderName}</b> | 📞 {msg.senderPhone}</p>
                    <p style={{color: '#FFB800', margin: '0 0 10px'}}>💬 {msg.text}</p>
                    <button onClick={() => window.open(`tel:${msg.senderPhone}`)} style={{ background: '#00C851', border: 'none', padding: '10px 20px', borderRadius: '10px', color: '#fff', fontWeight: 'bold' }}>📞 {t('call')}</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
