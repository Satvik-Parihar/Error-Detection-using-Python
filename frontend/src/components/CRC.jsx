import React, { useState } from 'react';
import axios from 'axios';

const CRC = () => {
    const [data, setData] = useState('');
    const [divisor, setDivisor] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

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
    };

    const handleDivisorChange = (e) => {
        const val = e.target.value;
        setDivisor(val);
        const err = validate('divisor', val);
        setValidationErrors(prev => ({ ...prev, divisor: err }));
        setResult(null);
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

    return (
        <div>
            <div className="algorithm-header">
                <h1 className="algorithm-title">Cyclic Redundancy Check (CRC)</h1>
                <p className="algorithm-desc">
                    CRC is a powerful error detection method based on binary division. It uses a generator polynomial (divisor) to calculate a checksum which is appended to the data.
                </p>
            </div>

            <div className="content-grid">
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
                            <div className="result-item">
                                <span>Codeword:</span>
                                <span>{result.codeword}</span>
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '1rem', fontWeight: '500', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Division Log</span>
                                <div className="step-list">
                                    {result.steps.map((step, idx) => (
                                        <div key={idx} className="step-card" style={{ gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                                <span className="step-title">Step {idx + 1}</span>
                                                <span className="step-icon" style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}>÷</span>
                                            </div>

                                            <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '3px', width: '100%' }}>
                                                <div style={{ color: '#fff' }}>{step.current_dividend}</div>
                                                <div style={{ color: 'var(--secondary)' }}>{step.divisor}</div>
                                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '4px', paddingTop: '4px', color: 'var(--text-muted)' }}>
                                                    {/* We don't have the result explicit in the step, but it is the next step's dividend (shifted). 
                                                        Let's just show the XOR line. */}
                                                    <span style={{ fontSize: '0.8rem', letterSpacing: '0', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>XOR Result shown in next step as new dividend</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                            CRC uses modulo-2 arithmetic (XOR operation, no carry).
                        </p>
                        <h3>Steps:</h3>
                        1. Append (n-1) zeros to data, where n is divisor length.<br />
                        2. Perform binary division of padded data by divisor.<br />
                        3. The remainder is the CRC.<br />
                        4. Append CRC to original data.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRC;
