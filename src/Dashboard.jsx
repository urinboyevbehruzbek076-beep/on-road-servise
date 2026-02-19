import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, updateDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion"; 
import Maps from "./Maps";

const Dashboard = ({ role, setStep }) => {
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

  useEffect(() => {
  if (isSaved && role === 'master' && docId) {
    const q = query(collection(db, "messages"), where("receiverId", "==", docId), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Agar yangi xabar kelgan bo'lsa ovoz chiqarish
      if (newMessages.length > messages.length && messages.length !== 0) {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
        audio.play();
      }
      
      setMessages(newMessages);
    });
    return () => unsubscribe();
  }
}, [isSaved, docId, role, messages.length]);

  const handleSave = async () => {
    if (!profileInfo.name || !profileInfo.phone) {
      alert("Iltimos, ma'lumotlarni to'liq kiriting!");
      return;
    }
    setLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const currentRole = role || 'user';
          const colName = currentRole === 'master' ? "masters" : "users";

          const docRef = await addDoc(collection(db, colName), {
            ...profileInfo,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            role: currentRole,
            createdAt: serverTimestamp()
          });

          setDocId(docRef.id);
          setIsSaved(true);
        } catch (e) {
          alert("Xatolik yuz berdi: " + e.message);
        } finally {
          setLoading(false);
        }
      }, () => {
        alert("Joylashuvni aniqlashga ruxsat bering!");
        setLoading(false);
      });
    }
  };

  const serviceIcons = [
    { id: 'Evakuator', icon: '🚛', label: 'Evakuator' },
    { id: "G'ildirak almashtirish", icon: '🔧', label: 'Balon' },
    { id: 'Yoqilg\'i yetkazish', icon: '⛽️', label: 'Benzin' },
    { id: 'Akkumulyator (Start)', icon: '⚡️', label: 'Start' }
  ];

  const glassStyle = {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(15px)",
    borderRadius: "28px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
  };

  const inputStyle = {
    width: '100%',
    padding: '16px',
    marginBottom: '16px',
    borderRadius: '14px',
    border: '1px solid #222',
    backgroundColor: '#0f0f0f',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      style={{ backgroundColor: '#050505', color: '#fff', minHeight: '100vh', padding: '15px', fontFamily: "'Poppins', sans-serif" }}
    >
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 5px', marginBottom: '25px' }}
      >
        <div>
          <h2 style={{ color: '#FFD700', margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '1.5px' }}>ON-ROAD</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#00C851', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '10px', color: '#666', fontWeight: '600' }}>PREMIUM SYSTEM</span>

Behruzbek, [19/02/2026 3:16 PM]
</div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep('landing')} 
          style={{ background: 'rgba(255, 50, 50, 0.1)', color: '#ff4444', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}
        >
          CHIQISH
        </motion.button>
      </motion.header>

      <AnimatePresence mode="wait">
        {!isSaved ? (
          <motion.div 
            key="registration"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            style={{ ...glassStyle, maxWidth: '450px', margin: '20px auto' }}
          >
            <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#FFD700', fontSize: '20px' }}>
              {role === 'master' ? 'Usta Profili' : 'Haydovchi Profili'}
            </h3>
            
            <input placeholder="To'liq ismingiz" style={inputStyle} onChange={(e) => setProfileInfo({...profileInfo, name: e.target.value})} />
            <input placeholder="Telefon raqamingiz" type="tel" style={inputStyle} onChange={(e) => setProfileInfo({...profileInfo, phone: e.target.value})} />

            {role === 'master' && (
              <select style={inputStyle} onChange={(e) => setProfileInfo({...profileInfo, service: e.target.value})}>
                {serviceIcons.map(s => <option key={s.id} value={s.id} style={{background: '#000'}}>{s.label}</option>)}
              </select>
            )}

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              onClick={handleSave} 
              style={{ width: '100%', padding: '18px', backgroundColor: '#FFD700', color: '#000', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
              {loading ? "YUKLANMOQDA..." : "DAVOM ETISH"}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {role === 'master' ? (
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Usta dizayni */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ ...glassStyle, textAlign: 'center', marginBottom: '20px' }}>
                   <h3>{profileInfo.name}</h3>
                   <motion.button 
                    onClick={async () => {
                      const newStatus = !profileInfo.isAvailable;
                      await updateDoc(doc(db, "masters", docId), { isAvailable: newStatus });
                      setProfileInfo({ ...profileInfo, isAvailable: newStatus });
                    }}
                    style={{ backgroundColor: profileInfo.isAvailable ? '#00C851' : '#ff4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}>
                    {profileInfo.isAvailable ? "ONLAYN" : "OFFLAYN"}
                   </motion.button>
                </motion.div>
              </div>
            ) : (
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <Maps filterService={selectedService} senderInfo={profileInfo} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '20px' }}>
                  {serviceIcons.map((s, idx) => (
                    <motion.div 
                      key={s.id} 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedService(selectedService === s.id ? null : s.id)}


style={{ 
                        backgroundColor: selectedService === s.id ? '#FFD700' : 'rgba(255,255,255,0.03)', 
                        color: selectedService === s.id ? '#000' : '#fff', 
                        padding: '25px 15px', borderRadius: '24px', textAlign: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                      <div style={{ fontSize: '38px' }}>{s.icon}</div>
                      <div style={{ fontSize: '15px', fontWeight: '800' }}>{s.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        input:focus { border-color: #FFD700 !important; outline: none; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </motion.div>
  );
};

export default Dashboard;