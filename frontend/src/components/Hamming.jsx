import React, { useState } from 'react';
import axios from 'axios';

const Hamming = () => {
    const [data, setData] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleCalculate = async () => {
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
                            onChange={(e) => setData(e.target.value)}
                            placeholder="e.g. 1011"
                        />
                    </div>

                    <button className="btn-primary" onClick={handleCalculate}>Encode Hamming</button>

                    {result && (
                        <div className="result-area">
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
                                <span style={{ color: 'var(--success)', fontWeight: 'bold', letterSpacing: '2px' }}>{result.codeword}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                Parity positions: {result.parity_positions.join(', ')}
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
        </div>
    );
};

export default Hamming;
