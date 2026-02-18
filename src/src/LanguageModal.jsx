import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageModal = ({ onSelect }) => {
  const { i18n } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Agar oldin til tanlanmagan bo'lsa, modalni ko'rsatamiz
    const savedLang = localStorage.getItem('i18nextLng');
    if (!savedLang || savedLang.length > 2) { 
      setShow(true);
    }
  }, []);

  const handleSelect = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    setShow(false);
    if (onSelect) onSelect();
  };

  if (!show) return null;

  return (
    <div style={modalStyle}>
      <div style={cardStyle}>
        <h2>Tilni tanlang / Select Language</h2>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <button onClick={() => handleSelect('uz')} style={btnStyle}>O'zbekcha</button>
          <button onClick={() => handleSelect('en')} style={btnStyle}>English</button>
        </div>
      </div>
    </div>
  );
};

// Oddiy dizayn
const modalStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const cardStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center' };
const btnStyle = { padding: '10px 20px', fontSize: '18px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' };

export default LanguageModal;