import React, { useState } from 'react';
import './index.css';

import Sidebar from './components/Sidebar';
import VRC from './components/VRC';
import LRC from './components/LRC';
import CRC from './components/CRC';
import Checksum from './components/Checksum';
import Hamming from './components/Hamming';

function App() {
  const [activeTab, setActiveTab] = useState('vrc');

  const renderContent = () => {
    switch (activeTab) {
      case 'vrc': return <VRC />;
      case 'lrc': return <LRC />;
      case 'crc': return <CRC />;
      case 'checksum': return <Checksum />;
      case 'hamming': return <Hamming />;
      default: return <VRC />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
