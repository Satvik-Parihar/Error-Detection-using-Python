import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CRC = () => {
    const [data, setData] = useState('');
    const [divisor, setDivisor] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const [view, setView] = useState('sender');
    const [receiverTab, setReceiverTab] = useState('correct');
    const [receiverData, setReceiverData] = useState(null);
    const [verificationResult, setVerificationResult] = useState(null);

    const validate = (name, value) => {
        if (!value) return 'Required';
        if (!/^[01]+$/.test(value)) return 'Must be binary (0/1)';
        return null;
    };

    const handleDataChange = (e) => {
        const val = e.target.value;
        setData(val);
        const err = validate('data', val);
        setValidationErrors(prev => ({ ...prev, data: err }));
        setResult(null);
        setView('sender');
    };

    const handleDivisorChange = (e) => {
        const val = e.target.value;
        setDivisor(val);
        const err = validate('divisor', val);
        setValidationErrors(prev => ({ ...prev, divisor: err }));
        setResult(null);
        setView('sender');
    };

    const handleCalculate = async () => {
        const dataErr = validate('data', data);
        const divErr = validate('divisor', divisor);

        if (dataErr || divErr) {
            setValidationErrors({ data: dataErr, divisor: divErr });
            return;
        }

        try {
            setError(null);
            const res = await axios.post('http://localhost:8000/api/crc', { data, divisor });
            setResult(res.data);
        } catch (err) {
            setError('Error calculating CRC');
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

        const correctCodeword = result.codeword;

        let detectedCodeword = correctCodeword.split('');
        detectedCodeword[detectedCodeword.length - 1] = detectedCodeword[detectedCodeword.length - 1] === '0' ? '1' : '0';

        let undetectedArr = correctCodeword.split('');
        const divLen = divisor.length;
        const startIdx = undetectedArr.length - divLen;

        for (let i = 0; i < divLen; i++) {
            if (divisor[i] === '1') {
                undetectedArr[startIdx + i] = undetectedArr[startIdx + i] === '0' ? '1' : '0';
            }
        }

        setReceiverData({
            correct: { codeword: correctCodeword, label: 'No Error' },
            detected: { codeword: detectedCodeword.join(''), label: 'Single Bit Error' },
            undetected: { codeword: undetectedArr.join(''), label: 'Burst Error (Multiple of G(x))' }
        });
    };

    useEffect(() => {
        if (view === 'receiver' && receiverData && receiverData[receiverTab]) {
            verifyReceiverCase(receiverData[receiverTab].codeword);
        }
    }, [receiverTab, view, receiverData]);

    const verifyReceiverCase = async (codeword) => {
        try {
            const res = await axios.post('http://localhost:8000/api/crc/verify', { codeword, divisor });
            setVerificationResult(res.data);
        } catch (err) {
            console.error("Verification Error", err);
        }
    };

    const renderReceiverContent = () => {
        if (!receiverData || !verificationResult) return null;

        let currentCodeword = receiverData[receiverTab].codeword;
        const isValid = verificationResult.is_valid;
        const remainder = verificationResult.remainder;

        let status = '';
        let description = '';

        if (receiverTab === 'correct') {
            status = isValid ? 'ACCEPTED' : 'REJECTED';
            description = 'Remainder is 0. Data accepted.';
        } else if (receiverTab === 'detected') {
            status = isValid ? 'ACCEPTED (FALSE NEGATIVE)' : 'REJECTED';
            description = 'Remainder is NON-ZERO. Error detected.';
        } else if (receiverTab === 'undetected') {
            status = isValid ? 'ACCEPTED (FALSE POSITIVE)' : 'REJECTED';
            description = 'Error pattern matches divisor polynomial. Remainder is 0, so receiver incorrectly accepts.';
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
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Received Codeword</h3>
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            fontFamily: 'monospace',
                            fontSize: '1.5rem',
                            letterSpacing: '4px',
                            textAlign: 'center',
                            wordBreak: 'break-all',
                            border: '1px solid var(--border-color)'
                        }}>
                            <span>{currentCodeword}</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Calculated Quotient</span>
                            <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: '#fff', marginTop: '0.5rem' }}>{verificationResult.quotient}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Calculated Remainder</span>
                            <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: isValid ? 'var(--success)' : 'var(--error)', marginTop: '0.5rem' }}>{remainder}</div>
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

    return (
        <div>
            <div className="algorithm-header">
                <h1 className="algorithm-title">Cyclic Redundancy Check (CRC)</h1>
                <p className="algorithm-desc">
                    CRC is a powerful error detection method based on binary division. It uses a generator polynomial (divisor) to calculate a checksum which is appended to the data.
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
                            <div>Codeword: {result?.codeword}</div>
                            <div style={{ color: 'var(--success)', fontSize: '0.9rem' }}>Divisor: {divisor}</div>
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
                            <label className="input-label">Data Word</label>
                            <input
                                type="text"
                                className="input-field"
                                value={data}
                                onChange={handleDataChange}
                                placeholder="e.g. 100100"
                                style={validationErrors.data ? { borderColor: 'var(--error)' } : {}}
                            />
                            {validationErrors.data && <div style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{validationErrors.data}</div>}
                        </div>

                        <div className="input-group">
                            <label className="input-label">Divisor (Generator)</label>
                            <input
                                type="text"
                                className="input-field"
                                value={divisor}
                                onChange={handleDivisorChange}
                                placeholder="e.g. 1101"
                                style={validationErrors.divisor ? { borderColor: 'var(--error)' } : {}}
                            />
                            {validationErrors.divisor && <div style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{validationErrors.divisor}</div>}
                        </div>

                        <button className="btn-primary" onClick={handleCalculate}>Calculate CRC</button>

                        {result && (
                            <div className="result-area">
                                <div className="result-item">
                                    <span>Remainder (CRC):</span>
                                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{result.remainder}</span>
                                </div>
                                {result.quotient && (
                                    <div className="result-item">
                                        <span>Quotient:</span>
                                        <span style={{ color: '#fff' }}>{result.quotient}</span>
                                    </div>
                                )}
                                <div className="result-item">
                                    <span>Codeword:</span>
                                    <span>{result.codeword}</span>
                                </div>

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
                            </div>
                        )}
                        {error && <div style={{ color: 'var(--error)', marginTop: '1rem' }}>{error}</div>}
                    </div>
                )}

                {view === 'sender' && (
                    <div className="card">
                        <h2 className="card-title">Theory & Method</h2>
                        <div className="theory-text">
                            <p>
                                <strong>Working:</strong> CRC treats data blocks as coefficients of a polynomial. It divides the data by a predetermined generator polynomial using binary division. The remainder of this division (the CRC) is attached to the data.
                            </p>
                            <h3>Key Points:</h3>
                            <ul>
                                <li><strong>Function:</strong> A robust method based on binary division to detect changes in raw data.</li>
                                <li><strong>Efficiency:</strong> Extremely distinct and reliable; it can detect all single-bit, double-bit, and odd numbers of errors, as well as most burst errors.</li>
                                <li><strong>Drawback:</strong> More computationally intensive to implement in software compared to Checksum or VRC.</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CRC;
