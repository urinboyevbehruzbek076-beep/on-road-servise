import React, { useState, useEffect } from "react";
import { db } from "./firebase"; 
import { collection, addDoc, updateDoc, doc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import Maps from "./Maps"; 

function Dashboard({ userRole, setStep }) {
  const [isSaved, setIsSaved] = useState(false);
  const [docId, setDocId] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [messages, setMessages] = useState([]); // Xabarlar uchun
  
  const [profileInfo, setProfileInfo] = useState({
    name: '',
    phone: '',
    service: 'Akkumulyator (Start)',
    workTime: '',
    isAvailable: true
  });

  // Usta uchun xabarlarni jonli eshitish (Real-time Chat)
  useEffect(() => {
    if (isSaved && userRole === 'master' && docId) {
      const q = query(
        collection(db, "messages"), 
        where("receiverId", "==", docId),
        orderBy("createdAt", "desc")
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [isSaved, docId, userRole]);

  const handleSave = async () => {
    if (!profileInfo.name || !profileInfo.phone) {
      alert("Ism va telefon raqamingizni kiriting!");
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const colName = userRole === 'master' ? "masters" : "users";
          const docRef = await addDoc(collection(db, colName), {
            ...profileInfo,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            role: userRole,
            createdAt: new Date()
          });
          setDocId(docRef.id);
          setIsSaved(true);
        } catch (e) { alert(e.message); }
      });
    }
  };

  const toggleStatus = async () => {
    const newStatus = !profileInfo.isAvailable;
    try {
      if (docId) {
        await updateDoc(doc(db, "masters", docId), { isAvailable: newStatus });
        setProfileInfo({ ...profileInfo, isAvailable: newStatus });
      }
    } catch (e) { alert(e.message); }
  };

  const serviceIcons = [
    { id: 'Evakuator', icon: '🚛', label: 'Evakuator' },
    { id: "G'ildirak almashtirish", icon: '🔧', label: 'Balon' },
    { id: 'Yoqilg\'i yetkazish', icon: '⛽', label: 'Benzin' },
    { id: 'Akkumulyator (Start)', icon: '⚡', label: 'Start' }
  ];

  return (
    <div style={{ backgroundColor: '#0e0e0e', color: '#fff', minHeight: '100vh', padding: '15px', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '1px solid #FFD700', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: '#FFD700', margin: 0 }}>ON-ROAD</h3>
        <button onClick={() => setStep('landing')} style={{ color: '#FFD700', background: 'none', border: 'none', cursor: 'pointer' }}>Chiqish</button>
      </header>

      {!isSaved ? (
        <div style={{ maxWidth: '400px', margin: '30px auto', backgroundColor: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #333' }}>
          <h4 style={{ color: '#FFD700', textAlign: 'center' }}>{userRole === 'master' ? 'Usta Profili' : 'Haydovchi Profili'}</h4>
          <input placeholder="Ismingiz" style={{width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'8px', border:'1px solid #333', backgroundColor:'#1a1a1a', color:'#fff'}} onChange={(e) => setProfileInfo({...profileInfo, name: e.target.value})} />
          <input placeholder="Telefon" type="tel" style={{width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'8px', border:'1px solid #333', backgroundColor:'#1a1a1a', color:'#fff'}} onChange={(e) => setProfileInfo({...profileInfo, phone: e.target.value})} />

Dasturchi:Farid,
{userRole === 'master' && (
            <select style={{width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'8px', backgroundColor:'#1a1a1a', color:'#fff'}} onChange={(e) => setProfileInfo({...profileInfo, service: e.target.value})}>
              {serviceIcons.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          )}
          <button onClick={handleSave} style={{ backgroundColor: '#FFD700', width: '100%', padding: '15px', fontWeight: 'bold', border: 'none', borderRadius: '8px' }}>Kirish</button>
        </div>
      ) : (
        <div>
          {userRole === 'master' ? (
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
               <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '15px', border: '2px solid #FFD700', textAlign: 'center', marginBottom: '15px' }}>
                  <h3>Salom, {profileInfo.name}!</h3>
                  <button onClick={toggleStatus} style={{ backgroundColor: profileInfo.isAvailable ? '#FF4444' : '#00C851', color: '#fff', width: '100%', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>
                    {profileInfo.isAvailable ? "HOZIR BANDMAN" : "HOZIR BO'SHMAN"}
                  </button>
               </div>
               
               <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '15px', border: '1px solid #333' }}>
                  <h4 style={{ color: '#FFD700', margin: '0 0 10px 0' }}>📥 Kelgan xabarlar</h4>
                  {messages.map(msg => (
                    <div key={msg.id} style={{ backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '8px', marginBottom: '8px', borderLeft: '4px solid #FFD700' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}><b>{msg.senderName}:</b> {msg.text}</p>
                      <button onClick={() => window.open(`tel:${msg.senderPhone}`)} style={{ background: '#FFD700', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>📞 Qo'ng'iroq</button>
                    </div>
                  ))}
               </div>
            </div>
          ) : (
            <div>
              <Maps filterService={selectedService} senderInfo={profileInfo} />
              <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {serviceIcons.map((s) => (
                  <div key={s.id} onClick={() => setSelectedService(selectedService === s.id ? null : s.id)}
                    style={{ backgroundColor: selectedService === s.id ? '#FFD700' : '#111', color: selectedService === s.id ? '#000' : '#fff', padding: '10px 5px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', border: '1px solid #333' }}>
                    <div style={{ fontSize: '20px' }}>{s.icon}</div>
                    <div style={{ fontSize: '9px', fontWeight: 'bold' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default Dashboard;