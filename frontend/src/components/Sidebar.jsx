import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'vrc', label: 'VRC (Parity Check)' },
        { id: 'lrc', label: 'LRC (Longitudinal)' },
        { id: 'crc', label: 'CRC (Cyclic)' },
        { id: 'checksum', label: 'Checksum' },
        { id: 'hamming', label: 'Hamming Code' },
    ];

    return (
        <div className="sidebar">
            <div className="brand">
                <img src="/logo.svg" alt="Logo" style={{ width: '40px', height: '40px' }} />
                ErrorDetect
            </div>

            <div className="nav-menu">
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        {item.label}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 'auto', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <p>CN Project</p>
                <p>Satvik Parihar</p>
            </div>
        </div>
    );
};

export default Sidebar;
