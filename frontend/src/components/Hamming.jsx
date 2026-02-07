import React, { useState } from 'react';
import axios from 'axios';

const Hamming = () => {
    const [data, setData] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [validationError, setValidationError] = useState('');

    const handleDataChange = (e) => {
        const val = e.target.value;
        setData(val);
        setResult(null);
        if (val && !/^[01]+$/.test(val)) {
            setValidationError('Must be binary (0/1)');
        } else {
            setValidationError('');
        }
    };

    const handleCalculate = async () => {
        if (!data) {
            setValidationError('Required');
            return;
        }
        if (!/^[01]+$/.test(data)) {
            setValidationError('Must be binary (0/1)');
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

    return (
        <div>
            <div className="algorithm-header">
                <h1 className="algorithm-title">Hamming Code</h1>
                <p className="algorithm-desc">
                    Hamming codes can detect up to two-bit errors or correct one-bit errors. It places redundant bits at positions of powers of 2.
                </p>
            </div>

            <div className="content-grid">
                <div className="card">
                    <h2 className="card-title">Simulation</h2>

                    <div className="input-group">
                        <label className="input-label">Data Bits</label>
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

                    <button className="btn-primary" onClick={handleCalculate}>Encode Hamming</button>

                    {result && (
                        <div>
                            <div style={{ marginTop: '2rem' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '1rem', fontWeight: '500', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Hamming Calculation Log</span>
                                <div className="step-list">
                                    {result.steps.map((step, idx) => (
                                        <div key={idx} className="step-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span className="step-icon" style={{ width: '28px', height: '28px', fontSize: '0.8rem', background: 'var(--primary-glow)' }}>P</span>
                                                    <span className="step-title" style={{ color: '#fff', fontSize: '1rem', marginBottom: 0 }}>{step.parity}</span>
                                                </div>
                                                <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem' }}>{step.result}</span>
                                            </div>

                                            <div style={{ width: '100%' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Positions Checked:</span>
                                                    <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.9rem' }}>{step.covered}</span>
                                                </div>

                                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Parity Calculation (Even Parity):</span>
                                                    <div style={{ fontFamily: 'monospace', color: '#cbd5e1', letterSpacing: '1px' }}>
                                                        {step.bits_str.replace(/\+/g, '⊕')} = <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{step.result}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="result-area" style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                                <div className="result-item">
                                    <span>Redundancy Bits (r):</span>
                                    <span>{result.redundancy_bits}</span>
                                </div>
                                <div className="result-item">
                                    <span>Total Length:</span>
                                    <span>{result.total_length}</span>
                                </div>
                                <div className="result-item">
                                    <span>Encoded Word:</span>
                                    <span style={{ color: 'var(--success)', fontWeight: 'bold', letterSpacing: '4px', fontSize: '1.5rem' }}>{result.codeword}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {error && <div style={{ color: 'var(--error)', marginTop: '1rem' }}>{error}</div>}
                </div>

                <div className="card">
                    <h2 className="card-title">Theory & Method</h2>
                    <div className="theory-text">
                        <p>
                            Hamming codes insert r parity bits at positions 1, 2, 4, 8... to protect m data bits.
                        </p>
                        <h3>Formula:</h3>
                        2^r ≥ m + r + 1
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Hamming;
