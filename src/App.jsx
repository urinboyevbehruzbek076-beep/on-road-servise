import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dashboard from './Dashboard'; 
import logo from './assets/photo_2026-02-09_15-24-55.jpg';
import LanguageModal from './LanguageModal';

function App() {
  const { t } = useTranslation();
  const [step, setStep] = useState('landing');
  const [userRole, setUserRole] = useState(null);

  // 1. Landing Page
  if (step === 'landing') {          
    return (
      <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
        <LanguageModal />
        <img src={logo} alt="ORS Logo" style={{ width: '200px', borderRadius: '15px', marginBottom: '20px', marginTop: '50px' }} />
        <h1 style={{ color: '#FFD700' }}>ON-ROAD SERVICE</h1>
        <p style={{ fontStyle: 'italic', color: '#ccc' }}>{t('Yo‘lda muammo bormi? Biz shu yerdamiz!')}</p>
        <button onClick={() => setStep('role')} style={{ backgroundColor: '#FFD700', padding: '15px 40px', fontWeight: 'bold', border: 'none', borderRadius: '50px', cursor: 'pointer', marginTop: '30px' }}>
          {t('Xizmatdan foydalanish')}
        </button>
      </div>
    );
  }

  // 2. Role Selection
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

  // 3. Dashboard
  if (step === 'dashboard') {
    return <Dashboard role={userRole} />;
  }

  return null;
}

export default App;