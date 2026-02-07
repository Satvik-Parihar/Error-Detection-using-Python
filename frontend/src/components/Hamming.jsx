import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Hamming = () => {
    const [data, setData] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [validationError, setValidationError] = useState('');

    const [view, setView] = useState('sender');
    const [receiverTab, setReceiverTab] = useState('correct');
    const [receiverData, setReceiverData] = useState(null);
    const [verificationResult, setVerificationResult] = useState(null);

    const handleDataChange = (e) => {
        const val = e.target.value;
        if (/^[01]*$/.test(val)) {
            setData(val);
            setValidationError('');
            setResult(null);
            setView('sender');
        } else {
            setValidationError('Only binary digits (0 and 1) are allowed');
        }
    };

    const handleCalculate = async () => {
        if (!data) {
            setValidationError('Data is required');
            return;
        }

        try {
            setError(null);
            const res = await axios.post('http://localhost:8000/api/hamming', { data });
            setResult(res.data);
        } catch (err) {
            setError('Error calculating Hamming Code');
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

        let singleError = correctCodeword.split('');
        if (singleError.length > 2) {
            singleError[2] = singleError[2] === '0' ? '1' : '0';
        }

        let doubleError = correctCodeword.split('');
        if (doubleError.length > 3) {
            doubleError[2] = doubleError[2] === '0' ? '1' : '0';
            doubleError[3] = doubleError[3] === '0' ? '1' : '0';
        }

        setReceiverData({
            correct: { codeword: correctCodeword, label: 'No Error' },
            single: { codeword: singleError.join(''), label: 'Single Bit Error' },
            double: { codeword: doubleError.join(''), label: 'Double Bit Error' }
        });
    };

    useEffect(() => {
        if (view === 'receiver' && receiverData && receiverData[receiverTab]) {
            verifyReceiverCase(receiverData[receiverTab].codeword);
        }
    }, [receiverTab, view, receiverData]);

    const verifyReceiverCase = async (codeword) => {
        try {
            const res = await axios.post('http://localhost:8000/api/hamming/verify', { codeword: codeword });
            setVerificationResult(res.data);
        } catch (err) {
            console.error("Verification Error", err);
        }
    };

    const renderReceiverContent = () => {
        if (!receiverData || !verificationResult) return null;

        let currentCodeword = receiverData[receiverTab].codeword;
        const syndrome = verificationResult.syndrome;
        const statusText = verificationResult.status;
        const corrected = verificationResult.corrected_codeword;

        let status = '';
        let description = '';

        if (receiverTab === 'correct') {
            status = 'ACCEPTED';
            description = 'Syndrome is 0. Parity checks consistent. Data accepted.';
        } else if (receiverTab === 'single') {
            status = 'ERROR CORRECTED';
            description = `Single bit error detected at position ${syndrome}. The system automatically corrected it to: ${corrected}`;
        } else if (receiverTab === 'double') {
            status = 'DETECTED';
            description = `Syndrome calculated is ${syndrome}. Since multiple bits flipped, this might point to a wrong location or an uncorrectable state depending on implementation (SEC-DED vs SEC).`;
        }

        return (
            <div className="receiver-panel">
                <div className="receiver-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    {['correct', 'single', 'double'].map(tab => (
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
                            {tab === 'correct' ? 'Correct Data' : tab === 'single' ? 'Single Error' : 'Double Error'}
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
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Calculated Syndrome</span>
                            <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: '#fff', marginTop: '0.5rem' }}>{syndrome} (Binary: {syndrome.toString(2)})</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verification Status</span>
                            <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: syndrome === 0 ? 'var(--success)' : 'var(--warning)', marginTop: '0.5rem' }}>{statusText}</div>
                        </div>
                    </div>

                    <div className="receiver-status" style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        background: status === 'ACCEPTED' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                        border: `1px solid ${status === 'ACCEPTED' ? 'var(--success)' : 'var(--secondary)'}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Status</div>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: status === 'ACCEPTED' ? 'var(--success)' : 'var(--secondary)'
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
                <h1 className="algorithm-title">Hamming Code</h1>
                <p className="algorithm-desc">
                    Hamming code is a set of error-correction codes that can can detect and correct one-bit errors. It uses parity bits at power-of-2 positions.
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
                            <div style={{ color: 'var(--success)' }}>Redundancy Bits: {result?.redundancy_bits}</div>
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
                            <label className="input-label">Data Word (Binary)</label>
                            <input
                                type="text"
                                className="input-field"
                                value={data}
                                onChange={handleDataChange}
                                placeholder="e.g. 1011"
                                style={validationError ? { borderColor: 'var(--error)' } : {}}
                            />
                            {validationError && <div style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{validationError}</div>}
                        </div>

                        <button className="btn-primary" onClick={handleCalculate}>Calculate Hamming Code</button>

                        {result && (
                            <div className="result-area">
                                <div className="result-item">
                                    <span>Redundancy Bits (r):</span>
                                    <span>{result.redundancy_bits}</span>
                                </div>
                                <div className="result-item">
                                    <span>Total Length:</span>
                                    <span>{result.total_length} bits</span>
                                </div>
                                <div className="result-item">
                                    <span>Generated Codeword:</span>
                                    <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem' }}>{result.codeword}</span>
                                </div>
                                <div className="result-item" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: '1rem' }}>
                                    <span style={{ marginBottom: '0.5rem' }}>Encoding Notation:</span>
                                    <div style={{ display: 'flex', gap: '2px', fontFamily: 'monospace', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                                        {Array.from({ length: result.total_length }).map((_, i) => {
                                            const pos = i + 1;
                                            const isParity = (pos & (pos - 1)) === 0;
                                            return (
                                                <div key={pos} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30px' }}>
                                                    <span style={{ color: isParity ? 'var(--secondary)' : 'var(--text-muted)', fontSize: '0.7rem' }}>
                                                        {isParity ? `P${pos}` : `D${pos}`}
                                                    </span>
                                                    <span style={{ border: `1px solid ${isParity ? 'var(--secondary)' : 'var(--border-color)'}`, padding: '2px 5px', borderRadius: '4px', background: isParity ? 'rgba(236, 72, 153, 0.1)' : 'transparent' }}>
                                                        {result.codeword[i]}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div style={{ marginTop: '1.5rem' }}>
                                    <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Parity Formulas:</h4>
                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                                        {result.steps.map((step, idx) => (
                                            <div key={idx} style={{ marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                                                <span style={{ color: 'var(--secondary)' }}>{step.parity}</span> = {step.bits_str} = <span style={{ color: '#fff', fontWeight: 'bold' }}>{step.result}</span>
                                            </div>
                                        ))}
                                    </div>
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
                                <strong>Working:</strong> Hamming codes add redundancy bits at specific positions (powers of 2: 1, 2, 4...) to allow detection and correction of single-bit errors.
                            </p>
                            <h3>Key Points:</h3>
                            <ul>
                                <li><strong>Function:</strong> Detects and corrects single-bit errors. Can detect double-bit errors (if extended).</li>
                                <li><strong>Efficiency:</strong> High overhead for data, but avoids retransmission for single errors.</li>
                                <li><strong>Drawback:</strong> Inefficient for burst errors; complex encoding/decoding.</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Hamming;
