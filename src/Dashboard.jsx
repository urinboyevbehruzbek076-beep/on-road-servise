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
  const [showGasStations, setShowGasStations] = useState(false); // Zapravkalar uchun state
  const [messages, setMessages] = useState([]);
  const [profileInfo, setProfileInfo] = useState({ name: '', phone: '', service: 'Evakuator', price: '', isAvailable: true });

  const services = [
    { id: 'Evakuator', icon: '🚛', label: t('evakuator'), msg: "🚨 SOS: Evakuator kerak!" },
    { id: 'Balon', icon: '🔧', label: t('balon'), msg: "🔧 SOS: Balon kerak!" },
    { id: 'Benzin', icon: '⛽', label: t('benzin'), msg: "⛽ SOS: Benzin kerak!" },
    { id: 'Start', icon: '⚡', label: t('battery'), msg: "⚡ SOS: Start kerak!" }
  ];

  // ... (handleSave va useEffect kodlari o'sha holicha qoladi)

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', color: '#fff', padding: '15px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#FFB800', fontWeight: '900', margin: 0, fontSize: '20px' }}>ON ROAD SERVICE</h2>
        <button onClick={() => setStep('landing')} style={{ background: '#FF4444', border: 'none', padding: '8px 15px', borderRadius: '10px', color: '#fff', fontWeight: 'bold' }}>{t('logout')}</button>
      </header>

      {isSaved ? (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {role === 'user' ? (
            <>
              {/* XARITA */}
              <div style={{ height: '400px', borderRadius: '25px', overflow: 'hidden', border: '2px solid #333', marginBottom: '15px' }}>
                <Maps 
                  filterService={selectedService} 
                  senderInfo={profileInfo} 
                  services={services} 
                  showGasStations={showGasStations} 
                />
              </div>

              {/* XIZMATLAR VA ZAPRAVKA TUGMASI */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {services.map(s => (
                  <button key={s.id} onClick={() => {setSelectedService(s.id); setShowGasStations(false);}} style={{ padding: '15px', borderRadius: '12px', background: selectedService === s.id ? '#FFB800' : '#1A1A1A', border: 'none', color: selectedService === s.id ? '#000' : '#fff', fontWeight: 'bold' }}>
                    {s.icon} {s.label}
                  </button>
                ))}
                <button onClick={() => {setShowGasStations(!showGasStations); setSelectedService(null);}} style={{ padding: '15px', borderRadius: '12px', background: showGasStations ? '#00C851' : '#1A1A1A', color: '#fff', border: 'none', fontWeight: 'bold', gridColumn: 'span 2' }}>
                  ⛽ Yoqilg'i shoxobchalari
                </button>
              </div>
            </>
          ) : (
             /* USTA PROFILI (Avvalgi koddek qoladi) */
             <div style={{ background: '#1A1A1A', padding: '20px', borderRadius: '20px' }}>...</div>
          )}

          {/* SOS VA TEZKOR YORDAM TUGMALARI (Har doim pastda turadi) */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => window.open('tel:103')} style={{ flex: 1, background: '#ff4444', color: '#fff', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: '900', fontSize: '18px' }}>
              🚑 103
            </button>
            <button onClick={() => window.open('tel:102')} style={{ flex: 1, background: '#0055ff', color: '#fff', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: '900', fontSize: '18px' }}>
              🚓 102
            </button>
          </div>
          <button onClick={() => alert("🔥 101 - Yong'in xavfsizligi\n⚡️ 1054 - Gaz xizmati\n📞 1102 - Yo'l harakati xavfsizligi")} style={{ width: '100%', marginTop: '10px', background: '#222', color: '#FFB800', padding: '12px', borderRadius: '12px', border: '1px solid #FFB800', fontWeight: 'bold' }}>
            ℹ️ Qo'shimcha ma'lumotlar
          </button>
        </div>
      ) : (
        /* RO'YXATDAN O'TISH FORMASI (O'sha holicha) */
        <div style={{ background: '#1A1A1A', padding: '30px', borderRadius: '25px', maxWidth: '400px', margin: '40px auto' }}>...</div>
      )}
    </div>
  );
};
export default Dashboard;
