import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dashboard from './Dashboard'; 
import logo from './assets/photo_2026-02-18_22-37-55.jpg' ; 

function App() {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState('landing');
  const [userRole, setUserRole] = useState(null);

  if (step === 'landing') {          
    return (
      <div style={{ backgroundColor: '#0D0D0D', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ position: 'absolute', top: '20px', display: 'flex', gap: '10px' }}>
          {['uz', 'ru', 'en'].map(lng => (
            <button key={lng} onClick={() => i18n.changeLanguage(lng)} style={{ background: i18n.language === lng ? '#FFB800' : '#222', color: i18n.language === lng ? '#000' : '#fff', border: 'none', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer' }}>{lng.toUpperCase()}</button>
          ))}
        </div>
        <img src={logo} alt="Logo" style={{ width: '180px', height: '180px', objectFit: 'cover', borderRadius: '50%', border: '4px solid #FFB800', marginBottom: '20px' }} />
        <h1 style={{ color: '#FFB800', fontSize: '28px', fontWeight: '900' }}>ON ROAD SERVICE</h1>
        <p style={{ color: '#888', marginBottom: '40px' }}>{t('hero_title')}</p>
        <button onClick={() => setStep('role')} style={{ backgroundColor: '#FFB800', color: '#000', padding: '15px 50px', borderRadius: '50px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>{t('start')}</button>
      </div>
    );
  }

  if (step === 'role') {
    return (
      <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: '#FFB800', marginBottom: '30px' }}>ON ROAD SERVICE</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => { setUserRole('user'); setStep('dashboard'); }} style={{ padding: '30px', border: '2px solid #FFB800', background: 'none', color: '#fff', borderRadius: '20px', cursor: 'pointer' }}>🚗 {t('driver')}</button>
          <button onClick={() => { setUserRole('master'); setStep('dashboard'); }} style={{ padding: '30px', border: '2px solid #FFB800', background: 'none', color: '#fff', borderRadius: '20px', cursor: 'pointer' }}>🛠 {t('master')}</button>
        </div>
      </div>
    );
  }
  return <Dashboard role={userRole} setStep={setStep} />;
}
export default App;
