import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dashboard from './Dashboard'; 
import logo from './assets/photo_2026-02-09_15-24-55.jpg';
import LanguageModal from './LanguageModal';

function App() {
  const { t } = useTranslation();
  const [step, setStep] = useState('landing');
  const [userRole, setUserRole] = useState(null);
      
  // App.jsx ichidagi Landing qismini shu uslubda yangilang:
if (step === 'landing') {          
  return (
    <div style={{ 
      backgroundColor: '#0A0A0A', 
      color: '#fff', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Poppins', sans-serif" 
    }}>
      <LanguageModal />
      
      {/* Logo animatsiyasi uchun div */}
      <div style={{ position: 'relative', marginBottom: '40px' }}>
        <div style={{
          position: 'absolute',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          border: '2px solid #FFD700',
          opacity: '0.3',
          animation: 'pulse 2s infinite'
        }}></div>
        <img src={logo} alt="ORS Logo" style={{ 
          width: '200px', 
          height: '200px',
          objectFit: 'cover',
          borderRadius: '50%', 
          border: '4px solid #FFD700',
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.2)'
        }} />
      </div>

      <h1 style={{ 
        letterSpacing: '4px', 
        fontSize: '32px', 
        fontWeight: '900', 
        color: '#FFD700',
        margin: '0' 
      }}>ON-ROAD</h1>
      <h2 style={{ fontSize: '14px', fontWeight: '300', color: '#888', marginBottom: '40px' }}>SERVICE SYSTEM</h2>

      <p style={{ 
        textAlign: 'center', 
        fontSize: '18px', 
        color: '#ccc', 
        maxWidth: '300px',
        lineHeight: '1.6',
        marginBottom: '40px'
      }}>
        {t('Yo‘lda muammo bormi? Biz shu yerdamiz!')}
      </p>

      <button onClick={() => setStep('role')} style={{ 
        backgroundColor: '#FFD700', 
        color: '#000',
        padding: '18px 60px', 
        fontSize: '18px',
        fontWeight: 'bold', 
        border: 'none', 
        borderRadius: '100px', 
        cursor: 'pointer',
        boxShadow: '0 10px 20px rgba(255, 215, 0, 0.3)',
        transition: 'transform 0.2s'
      }}>
        {t('Boshlash')}
      </button>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}
      </style>
    </div>
  );
}
  if (step === 'role') {
    return (
      <div style={{ backgroundColor: '#0e0e0e', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ marginBottom: '30px' }}>{t('Kim sifatida davom etasiz?')}</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => { setUserRole('user'); setStep('dashboard'); }} style={{ padding: '20px', border: '2px solid #FFD700', background: 'none', color: '#fff', borderRadius: '15px', cursor: 'pointer' }}>
            🚗 {t('Haydovchi')}
          </button>
          <button onClick={() => { setUserRole('master'); setStep('dashboard'); }} style={{ padding: '20px', border: '2px solid #FFD700', background: 'none', color: '#fff', borderRadius: '15px', cursor: 'pointer' }}>
            🛠 {t('Usta')}
          </button>
        </div>
      </div>
    );
  }
 
  if (step === 'dashboard') {
    return <Dashboard role={userRole} />;
  }

  return null;
}

export default App;