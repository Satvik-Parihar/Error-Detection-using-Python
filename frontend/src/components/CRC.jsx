import React, { useState } from 'react';
import axios from 'axios';

const CRC = () => {
    const [data, setData] = useState('');
    const [divisor, setDivisor] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleCalculate = async () => {
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
                            onChange={(e) => setData(e.target.value)}
                            placeholder="e.g. 100100"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Divisor (Generator)</label>
                        <input
                            type="text"
                            className="input-field"
                            value={divisor}
                            onChange={(e) => setDivisor(e.target.value)}
                            placeholder="e.g. 1101"
                        />
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

                            <div style={{ marginTop: '1rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Division Steps:</span>
                                <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '0.5rem', fontSize: '0.8rem', background: '#000', padding: '0.5rem' }}>
                                    {result.steps.map((step, idx) => (
                                        <div key={idx} className="step-item">
                                            <div>Div: {step.current_dividend}</div>
                                            <div style={{ borderBottom: '1px dashed #333' }}>XOR: {step.divisor}</div>
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
