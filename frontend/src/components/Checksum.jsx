import React, { useState } from 'react';
import axios from 'axios';

const Checksum = () => {
    const [data, setData] = useState('');
    const [blockSize, setBlockSize] = useState(8);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleCalculate = async () => {
        try {
            setError(null);
            const res = await axios.post('http://localhost:8000/api/checksum', { data, block_size: parseInt(blockSize) });
            setResult(res.data);
        } catch (err) {
            setError('Error calculating Checksum');
            console.error(err);
        }
    };

    return (
        <div>
            <div className="algorithm-header">
                <h1 className="algorithm-title">Checksum</h1>
                <p className="algorithm-desc">
                    Checksum is used to ensure data integrity. The sender calculates a value (checksum) based on the data and sends it. The receiver repeats the calculation.
                </p>
            </div>

            <div className="content-grid">
                <div className="card">
                    <h2 className="card-title">Simulation</h2>

                    <div className="input-group">
                        <label className="input-label">Binary Data</label>
                        <input
                            type="text"
                            className="input-field"
                            value={data}
                            onChange={(e) => setData(e.target.value)}
                            placeholder="e.g. 1010100100111001"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Block Size (bits)</label>
                        <input
                            type="number"
                            className="input-field"
                            value={blockSize}
                            onChange={(e) => setBlockSize(e.target.value)}
                            placeholder="8"
                        />
                    </div>

                    <button className="btn-primary" onClick={handleCalculate}>Calculate Checksum</button>

                    {result && (
                        <div className="result-area">
                            <div className="result-item">
                                <span>Sum (Binary):</span>
                                <span>{result.sum}</span>
                            </div>
                            <div className="result-item">
                                <span>Checksum (1's Compl):</span>
                                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{result.checksum}</span>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Calculation Steps:</span>
                                <div style={{ maxHeight: '150px', overflowY: 'auto', marginTop: '0.5rem', fontSize: '0.8rem', background: '#000', padding: '0.5rem' }}>
                                    {result.steps.map((step, idx) => (
                                        <div key={idx} className="step-item">{step}</div>
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
                            The checksum is calculated by summing the data segments and taking the 1's complement of the result.
                        </p>
                        <h3>Steps:</h3>
                        1. Divide data into k segments of equal m bits.<br />
                        2. Sum all segments using 1's complement arithmetic.<br />
                        3. Complement the final sum to get the Checksum.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checksum;
