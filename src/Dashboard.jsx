import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, updateDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion"; 
import { useTranslation } from 'react-i18next'; 
import Maps from "./Maps";

const Dashboard = ({ role, setStep }) => {
  const { t } = useTranslation(); 

  const [isSaved, setIsSaved] = useState(false);
  const [docId, setDocId] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileInfo, setProfileInfo] = useState({
    name: '',
    phone: '',
    service: 'Akkumulyator (Start)',
    isAvailable: true
  });

  // Xabarlarni eshitish (Master uchun)
  useEffect(() => {
    if (isSaved && role === 'master' && docId) {
      const q = query(
        collection(db, "messages"), 
        where("receiverId", "==", docId), 
        orderBy("createdAt", "desc")
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (newMessages.length > messages.length && messages.length !== 0) {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
          audio.play().catch(e => console.log("Ovoz xatosi:", e));
        }
        
        setMessages(newMessages);
      });
      return () => unsubscribe();
    }
  }, [isSaved, docId, role]); 

  const handleSave = async () => {
    if (!profileInfo.name || !profileInfo.phone) {
      alert(t('Iltimos, ma' + "'" + 'lumotlarni to' + "'" + 'liq kiriting!'));
      return;
    }
    setLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const currentRole = role || 'user';
          const colName = currentRole === 'master' ? "masters" : "users";

          const data = {
            ...profileInfo,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            role: currentRole,
            createdAt: serverTimestamp()
          };

          const docRef = await addDoc(collection(db, colName), data);
          setDocId(docRef.id);
          setIsSaved(true);
        } catch (e) {
          alert("Xatolik: " + e.message);
        } finally {
          setLoading(false);
        }
      }, () => {
        alert(t('Joylashuvni aniqlashga ruxsat bering!'));
        setLoading(false);
      });
    }
  };

  const serviceIcons = [
    { id: 'Evakuator', icon: '🚛', label: t('Evakuator') },
    { id: "G'ildirak almashtirish", icon: '🔧', label: t('Balon') },
    { id: 'Yoqilg\'i yetkazish', icon: '⛽️', label: t('Benzin') },
    { id: 'Akkumulyator (Start)', icon: '⚡️', label: t('Start') }
  ];

  const glassStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(15px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "24px"
  };

  const inputStyle = {
    width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px',
    border: '1px solid #333', backgroundColor: '#111', color: '#fff', outline: 'none'
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h2 style={{ color: '#FFD700' }}>ON-ROAD</h2>
        <button onClick={() => setStep('landing')} style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
          {t('logout') || 'CHIQISH'}
        </button>
      </header>

      {!isSaved ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...glassStyle, maxWidth: '400px', margin: '0 auto' }}>
          <h3 style={{ textAlign: 'center', color: '#FFD700' }}>
            {role === 'master' ? t('master') : t('driver')}
          </h3>
          <input placeholder={t('name_placeholder')} style={inputStyle} onChange={(e) => setProfileInfo({...profileInfo, name: e.target.value})} />
          <input placeholder={t('phone_placeholder')} type="tel" style={inputStyle} onChange={(e) => setProfileInfo({...profileInfo, phone: e.target.value})} />
          
          {role === 'master' && (
            <select style={inputStyle} onChange={(e) => setProfileInfo({...profileInfo, service: e.target.value})}>
              {serviceIcons.map(s => <option key={s.id} value={s.id} style={{background: '#000'}}>{s.label}</option>)}
            </select>
          )}
          
          <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '15px', backgroundColor: '#FFD700', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? t('loading') : t('start')}
          </button>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {role === 'user' ? (
            <>
              <div style={{ height: '450px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #333' }}>
                <Maps filterService={selectedService} senderInfo={profileInfo} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {serviceIcons.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => setSelectedService(selectedService === s.id ? null : s.id)}
                    style={{ 
                      padding: '15px', borderRadius: '15px', border: 'none', 
                      backgroundColor: selectedService === s.id ? '#FFD700' : '#1a1a1a',
                      color: selectedService === s.id ? '#000' : '#fff', cursor: 'pointer'
                    }}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div style={glassStyle}>
              <h3 style={{color: '#FFD700'}}>{t('Xabarlar')}: {messages.length}</h3>
              {messages.map(msg => (
                <div key={msg.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', marginTop: '10px', borderLeft: '4px solid #FFD700' }}>
                  <p>👤 <b>{msg.senderName}</b></p>
                  <p>📞 {msg.senderPhone}</p>
                  <p>💬 {msg.text}</p>
                  <button onClick={() => window.open(`tel:${msg.senderPhone}`)} style={{ background: '#00C851', border: 'none', padding: '8px 15px', borderRadius: '8px', color: '#fff', cursor: 'pointer', marginTop: '5px' }}>
                    {t('Qo\'ng\'iroq')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
