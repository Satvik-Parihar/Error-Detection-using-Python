import React, { useState } from 'react';
import axios from 'axios';

const VRC = () => {
    const [data, setData] = useState('');
    const [evenParity, setEvenParity] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [inputError, setInputError] = useState('');

    const [view, setView] = useState('sender');
    const [receiverTab, setReceiverTab] = useState('correct');
    const [receiverData, setReceiverData] = useState(null);

    const validateInput = (val) => {
        if (!val) {
            setInputError('');
            return false;
        }
        if (!/^[01]+$/.test(val)) {
            setInputError('Input must contain only 0s and 1s');
            return false;
        }
        setInputError('');
        return true;
    };

    const handleDataChange = (e) => {
        const val = e.target.value;
        setData(val);
        if (validateInput(val)) {
            setResult(null);
            setView('sender');
        }
    };

    const handleCalculate = async () => {
        if (!validateInput(data)) return;

        try {
            setError(null);
            const res = await axios.post('http://localhost:8000/api/vrc', { data, even_parity: evenParity });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error calculating VRC');
            console.error(err);
        }
    };

    const handleShowReceiver = () => {
        setView('transmitting');
        setTimeout(() => {
            setView('receiver');
            generateReceiverCases();
        }, 3000);
    };

    const generateReceiverCases = () => {
        if (!result) return;

        const correctData = result.result;

        let detectedData = correctData.split('');
        if (detectedData.length > 0) {
            detectedData[0] = detectedData[0] === '0' ? '1' : '0';
        }
        const detectedStr = detectedData.join('');

        let undetectedData = correctData.split('');
        if (undetectedData.length >= 2) {
            undetectedData[0] = undetectedData[0] === '0' ? '1' : '0';
            undetectedData[1] = undetectedData[1] === '0' ? '1' : '0';
        }
        const undetectedStr = undetectedData.join('');

        setReceiverData({
            correct: { data: correctData, label: 'No Error' },
            detected: { data: detectedStr, label: 'Single Bit Error' },
            undetected: { data: undetectedStr, label: 'Two Bit Error' }
        });
    };

    const checkParity = (binaryString) => {
        const ones = (binaryString.match(/1/g) || []).length;
        const isEven = ones % 2 === 0;

        if (evenParity) {
            return isEven;
        } else {
            return !isEven;
        }
    };

    const renderReceiverContent = () => {
        if (!receiverData) return null;

        let currentData = '';
        let status = '';
        let description = '';

        if (receiverTab === 'correct') {
            currentData = receiverData.correct.data;
            const isValid = checkParity(currentData);
            status = isValid ? 'ACCEPTED' : 'REJECTED (Logic Error)';
            description = `Parity validation successful. Total 1s count is ${(currentData.match(/1/g) || []).length}, which matches the expected ${evenParity ? 'Even' : 'Odd'} parity requirement.`;
        } else if (receiverTab === 'detected') {
            currentData = receiverData.detected.data;
            const isValid = checkParity(currentData);
            status = isValid ? 'ACCEPTED (FALSE NEGATIVE)' : 'REJECTED';
            description = `Single bit error flip detected. Total 1s count became ${(currentData.match(/1/g) || []).length}, violating the ${evenParity ? 'Even' : 'Odd'} parity rule.`;
        } else if (receiverTab === 'undetected') {
            currentData = receiverData.undetected.data;
            const isValid = checkParity(currentData);
            status = isValid ? 'ACCEPTED (FALSE POSITIVE)' : 'REJECTED';
            description = `Two bits were flipped (Even number of errors). Total 1s count changed by 2 (or 0), so it remains ${evenParity ? 'Even' : 'Odd'}. The system falsely accepts this data.`;
        }

        return (
            <div className="receiver-panel">
                <div className="receiver-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    {['correct', 'detected', 'undetected'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setReceiverTab(tab)}
                            className={`btn-tab ${receiverTab === tab ? 'active' : ''}`}
                            style={{
                                background: receiverTab === tab ? 'var(--primary)' : 'transparent',
                                color: receiverTab === tab ? '#fff' : 'var(--text-muted)',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab === 'correct' ? 'Correct Data' : tab === 'detected' ? 'Detected Error' : 'Undetected Error'}
                        </button>
                    ))}
                </div>

                <div className="receiver-display">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Received Data</h3>

                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            fontFamily: 'monospace',
                            fontSize: '1.5rem',
                            letterSpacing: '4px',
                            textAlign: 'center',
                            border: '1px solid var(--border-color)'
                        }}>
                            <span>{currentData}</span>
                        </div>
                    </div>

                    <div className="receiver-status" style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        background: status.includes('ACCEPTED') && !status.includes('FALSE') ? 'rgba(74, 222, 128, 0.1)' : status.includes('REJECTED') ? 'rgba(248, 113, 113, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                        border: `1px solid ${status.includes('ACCEPTED') && !status.includes('FALSE') ? 'var(--success)' : status.includes('REJECTED') ? 'var(--error)' : 'var(--secondary)'}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Status</div>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: status.includes('ACCEPTED') && !status.includes('FALSE') ? 'var(--success)' : status.includes('REJECTED') ? 'var(--error)' : 'var(--secondary)'
                                }}>
                                    {status}
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <strong style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason:</strong>
                            <p style={{ marginTop: '0.5rem', lineHeight: '1.5', color: '#fff' }}>{description}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const isButtonDisabled = !data || !!inputError;

    return (
        <div>
            <div className="algorithm-header">
                <h1 className="algorithm-title">Vertical Redundancy Check (VRC)</h1>
                <p className="algorithm-desc">
                    Also known as Parity Check, VRC is the simplest error detection mechanism. It involves appending a redundant bit, called a parity bit, to the end of every data unit.
                </p>
            </div>

            <div className="content-grid">
                {view === 'transmitting' && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gridColumn: 'span 2' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            border: '4px solid var(--primary)',
                            borderTopColor: 'transparent',
                            animation: 'spin 1s linear infinite',
                            marginBottom: '2rem'
                        }}></div>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '1rem' }}>Transmitting Data...</h2>
                        <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div>Data: {data}</div>
                            <div style={{ color: 'var(--success)' }}>Parity Bit appended: {result?.parity_bit}</div>
                        </div>
                    </div>
                )}

                {view === 'receiver' && (
                    <div className="card" style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 className="card-title" style={{ margin: 0 }}>Receiver Side</h2>
                            <button
                                onClick={() => setView('sender')}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-muted)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Back to Sender
                            </button>
                        </div>
                        {renderReceiverContent()}
                    </div>
                )}

                {view === 'sender' && (
                    <div className="card">
                        <h2 className="card-title">Simulation</h2>

                        <div className="input-group">
                            <label className="input-label">Binary Data (e.g. 1100101)</label>
                            <input
                                type="text"
                                className="input-field"
                                value={data}
                                onChange={handleDataChange}
                                placeholder="Enter binary string..."
                                style={inputError ? { borderColor: '#f87171', boxShadow: '0 0 0 4px rgba(248, 113, 113, 0.1)' } : {}}
                            />
                            {inputError && <div style={{ color: '#f87171', fontSize: '0.9rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⚠️ {inputError}</div>}
                        </div>

                        <div className="input-group">
                            <label className="input-label">Parity Type</label>
                            <div className="toggle-switch">
                                <div
                                    className={`toggle-opt ${evenParity ? 'active' : ''}`}
                                    onClick={() => { setEvenParity(true); setView('sender'); setResult(null); }}
                                >
                                    Even Parity
                                </div>
                                <div
                                    className={`toggle-opt ${!evenParity ? 'active' : ''}`}
                                    onClick={() => { setEvenParity(false); setView('sender'); setResult(null); }}
                                >
                                    Odd Parity
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn-primary"
                            onClick={handleCalculate}
                            disabled={isButtonDisabled}
                            style={isButtonDisabled ? { opacity: 0.5, cursor: 'not-allowed', transform: 'none', boxShadow: 'none' } : {}}
                        >
                            Generate VRC
                        </button>

                        {result && (
                            <div className="result-area">
                                <div className="result-item">
                                    <span>Input Data:</span>
                                    <span>{result.data}</span>
                                </div>
                                <div className="result-item">
                                    <span>Parity Bit:</span>
                                    <span className="result-highlight">{result.parity_bit}</span>
                                </div>
                                <div className="result-item">
                                    <span>Final Data:</span>
                                    <span>{result.result}</span>
                                </div>
                            </div>
                        )}

                        {result && (
                            <button
                                className="btn-primary"
                                onClick={handleShowReceiver}
                                style={{
                                    marginTop: '2rem',
                                    background: 'linear-gradient(135deg, var(--secondary) 0%, #be185d 100%)'
                                }}
                            >
                                Show Receiver Side
                            </button>
                        )}

                        {error && <div style={{ color: '#f87171', marginTop: '1rem', background: 'rgba(248, 113, 113, 0.1)', padding: '1rem', borderRadius: '12px' }}>{error}</div>}
                    </div>
                )}

                {view === 'sender' && (
                    <div className="card">
                        <h2 className="card-title">Theory & Method</h2>
                        <div className="theory-text">
                            <p>
                                <strong>Working:</strong> VRC appends a single redundant bit (parity bit) to the data unit. The bit's value (0 or 1) is chosen to make the total number of 1s in the unit either even (Even Parity) or odd (Odd Parity).
                            </p>
                            <h3>Key Points:</h3>
                            <ul>
                                <li><strong>Function:</strong> A simple mechanism to check data integrity on a character-by-character basis.</li>
                                <li><strong>Efficiency:</strong> Extremely inexpensive to implement and can detect all single-bit errors.</li>
                                <li><strong>Drawback:</strong> Ineffective if an even number of bits are flipped (e.g., two bits change from 0 to 1), as the parity count remains valid.</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VRC;
