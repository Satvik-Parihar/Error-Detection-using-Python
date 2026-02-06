import React, { useState } from 'react';
import axios from 'axios';

const VRC = () => {
    const [data, setData] = useState('');
    const [evenParity, setEvenParity] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleCalculate = async () => {
        try {
            setError(null);
            const res = await axios.post('http://localhost:8000/api/vrc', { data, even_parity: evenParity });
            setResult(res.data);
        } catch (err) {
            setError('Error calculating VRC');
            console.error(err);
        }
    };

    return (
        <div>
            <div className="algorithm-header">
                <h1 className="algorithm-title">Vertical Redundancy Check (VRC)</h1>
                <p className="algorithm-desc">
                    Also known as Parity Check, VRC is the simplest error detection mechanism. It involves appending a redundant bit, called a parity bit, to the end of every data unit.
                </p>
            </div>

            <div className="content-grid">
                <div className="card">
                    <h2 className="card-title">Simulation</h2>

                    <div className="input-group">
                        <label className="input-label">Binary Data (e.g. 1100101)</label>
                        <input
                            type="text"
                            className="input-field"
                            value={data}
                            onChange={(e) => setData(e.target.value)}
                            placeholder="Enter binary string..."
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Parity Type</label>
                        <div className="toggle-switch">
                            <div
                                className={`toggle-opt ${evenParity ? 'active' : ''}`}
                                onClick={() => setEvenParity(true)}
                            >
                                Even Parity
                            </div>
                            <div
                                className={`toggle-opt ${!evenParity ? 'active' : ''}`}
                                onClick={() => setEvenParity(false)}
                            >
                                Odd Parity
                            </div>
                        </div>
                    </div>

                    <button className="btn-primary" onClick={handleCalculate}>Generate VRC</button>

                    {result && (
                        <div className="result-area">
                            <div className="result-item">
                                <span>Input Data:</span>
                                <span>{result.data}</span>
                            </div>
                            <div className="result-item">
                                <span>Parity Bit:</span>
                                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{result.parity_bit}</span>
                            </div>
                            <div className="result-item">
                                <span>Final Data:</span>
                                <span>{result.result}</span>
                            </div>
                        </div>
                    )}
                    {error && <div style={{ color: 'var(--error)', marginTop: '1rem' }}>{error}</div>}
                </div>

                <div className="card">
                    <h2 className="card-title">Theory & Method</h2>
                    <div className="theory-text">
                        <p>
                            VRC checks errors on a per-character basis. It appends a single bit to make the total number of 1s either even (Even Parity) or odd (Odd Parity).
                        </p>
                        <h3>Key Points:</h3>
                        <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0' }}>
                            <li>Cheap and easy to implement.</li>
                            <li>Can detect single-bit errors.</li>
                            <li>Cannot detect even numbers of flipped bits (e.g. 2 bits flipped).</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VRC;
