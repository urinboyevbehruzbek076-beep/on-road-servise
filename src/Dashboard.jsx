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

  // Asosiy xizmatlar ro'yxati (Zapravka tugmasi bilan)
  const services = [
    { id: 'Evakuator', icon: '🚛', label: t('evakuator') },
    { id: 'Balon', icon: '🔧', label: t('balon') },
    { id: 'Benzin', icon: '⛽', label: t('benzin') },
    { id: 'Start', icon: '⚡', label: t('battery') },
    { id: 'FuelStation', icon: '⛽📍', label: "Zapravkalar" } // Yangi tugma
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
      try {
        const docRef = await addDoc(collection(db, role === 'master' ? "masters" : "users"), {
          ...profileInfo, lat: pos.coords.latitude, lng: pos.coords.longitude,
          rating: 5.0, jobs: 0, createdAt: serverTimestamp()
        });
        setDocId(docRef.id); setIsSaved(true);
      } catch (e) { alert(e.message); }
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
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', color: '#fff', padding: '15px' }}>
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#FFB800', fontWeight: '900', margin: 0, fontSize: '20px' }}>ON ROAD SERVICE</h2>
        <button onClick={() => setStep('landing')} style={{ background: '#FF4444', border: 'none', padding: '8px 15px', borderRadius: '10px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>{t('logout')}</button>
      </header>

      {!isSaved ? (
        /* RO'YXATDAN O'TISH */
        <div style={{ background: '#1A1A1A', padding: '30px', borderRadius: '25px', maxWidth: '400px', margin: '40px auto', border: '1px solid #333' }}>
          <h3 style={{ color: '#FFB800', textAlign: 'center', marginBottom: '20px' }}>{t('registration')}</h3>
          <input placeholder={t('name_placeholder')} style={inputStyle} onChange={e => setProfileInfo({...profileInfo, name: e.target.value})} />
          <input placeholder={t('phone_placeholder')} style={inputStyle} onChange={e => setProfileInfo({...profileInfo, phone: e.target.value})} />
          <button onClick={handleSave} style={{ width: '100%', padding: '15px', background: '#FFB800', color: '#000', borderRadius: '10px', fontWeight: '900', border: 'none', cursor: 'pointer' }}>{t('start')}</button>
        </div>
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {role === 'user' ? (
            /* HAYDOVCHI PANELI */
            <>
              <div style={{ height: '420px', borderRadius: '25px', overflow: 'hidden', border: '2px solid #333', marginBottom: '15px' }}>
                <Maps filterService={selectedService} senderInfo={profileInfo} services={services} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {services.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => setSelectedService(s.id)} 
                    style={{ 
                      padding: '15px', borderRadius: '15px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                      background: selectedService === s.id ? '#FFB800' : '#1A1A1A', 
                      color: selectedService === s.id ? '#000' : '#fff',
                      gridColumn: s.id === 'FuelStation' ? 'span 2' : 'span 1' // Zapravka tugmasini uzun qilish
                    }}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* USTA PANELI */
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ background: '#1A1A1A', padding: '20px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #333', position: 'relative' }}>
                <button onClick={() => setIsEditing(true)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>⚙️</button>
                <h3 style={{ margin: '0 0 10px', color: '#FFB800' }}>{profileInfo.name}</h3>
                <p>🛠 {profileInfo.service} | 💰 {profileInfo.price || '0'} so'm</p>
                <button 
                  onClick={async () => {
                    const s = !profileInfo.isAvailable;
                    setProfileInfo({...profileInfo, isAvailable: s});
                    await updateDoc(doc(db, "masters", docId), {isAvailable: s});
                  }} 
                  style={{ background: profileInfo.isAvailable ? '#00C851' : '#FF4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {profileInfo.isAvailable ? t('available') : t('busy')}
                </button>
              </div>

              <div style={{ background: '#1A1A1A', padding: '20px', borderRadius: '20px' }}>
                <h3 style={{ color: '#FFB800' }}>📬 {t('messages')} ({messages.length})</h3>
                {messages.map(msg => (
                  <div key={msg.id} style={{ background: '#0D0D0D', padding: '15px', borderRadius: '15px', marginBottom: '10px', borderLeft: '5px solid #FFB800' }}>
                    <p style={{margin: '0 0 5px'}}>👤 <b>{msg.senderName}</b> | 📞 {msg.senderPhone}</p>
                    <p style={{color: '#FFB800', margin: '0 0 10px'}}>💬 {msg.text}</p>
                    <button onClick={() => window.open(`tel:${msg.senderPhone}`)} style={{ background: '#00C851', border: 'none', padding: '10px 20px', borderRadius: '10px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>📞 {t('call')}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TEZKOR SOS VA QO'SHIMCHA YORDAM (Har ikkala profil uchun) */}
          <div style={{ marginTop: '25px', padding: '15px', background: 'rgba(255, 68, 68, 0.05)', borderRadius: '20px', border: '1px solid rgba(255, 68, 68, 0.2)' }}>
            <h4 style={{ color: '#ff4444', margin: '0 0 12px', textAlign: 'center', fontSize: '14px' }}>🆘 TEZKOR ALOQA</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button onClick={() => window.open('tel:103')} style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: '900', fontSize: '16px', cursor: 'pointer' }}>🚑 103</button>
              <button onClick={() => window.open('tel:102')} style={{ background: '#0055ff', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: '900', fontSize: '16px', cursor: 'pointer' }}>🚓 102</button>
            </div>
            <button 
              onClick={() => alert("🔥 101 - Yong'in xavfsizligi\n⚡️ 1054 - Gaz xizmati\n📞 1102 - Yo'l harakati xavfsizligi (GAI)")} 
              style={{ width: '100%', marginTop: '10px', background: 'transparent', color: '#FFB800', padding: '10px', borderRadius: '10px', border: '1px solid #FFB800', cursor: 'pointer', fontSize: '12px' }}
            >
              ℹ️ Boshqa muhim raqamlar
            </button>
          </div>
        </div>
      )}

      {/* TAHRIRLASH MODAL OYNASI */}
      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#1A1A1A', padding: '25px', borderRadius: '20px', width: '320px', border: '1px solid #333' }}>
            <h4 style={{ color: '#FFB800', marginTop: 0 }}>Profilni tahrirlash</h4>
            <label style={{fontSize: '12px', color: '#888'}}>Xizmat turi:</label>
            <select style={inputStyle} value={profileInfo.service} onChange={e => setProfileInfo({...profileInfo, service: e.target.value})}>
              {services.filter(s => s.id !== 'FuelStation').map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <label style={{fontSize: '12px', color: '#888'}}>Xizmat narxi (so'm):</label>
            <input type="number" placeholder="Narx kiriting" value={profileInfo.price} style={inputStyle} onChange={e => setProfileInfo({...profileInfo, price: e.target.value})} />
            <button onClick={updateMasterProfile} style={{ width: '100%', padding: '12px', background: '#FFB800', color: '#000', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Saqlash</button>
            <button onClick={() => setIsEditing(false)} style={{ width: '100%', marginTop: '10px', background: 'none', border: '1px solid #444', color: '#888', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}>Yopish</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
