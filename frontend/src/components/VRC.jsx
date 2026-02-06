import React, { useState } from 'react';
import axios from 'axios';

const VRC = () => {
    const [data, setData] = useState('');
    const [evenParity, setEvenParity] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [inputError, setInputError] = useState('');

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
        validateInput(val);
        setResult(null);
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
                    {error && <div style={{ color: '#f87171', marginTop: '1rem', background: 'rgba(248, 113, 113, 0.1)', padding: '1rem', borderRadius: '12px' }}>{error}</div>}
                </div>

                <div className="card">
                    <h2 className="card-title">Theory & Method</h2>
                    <div className="theory-text">
                        <p>
                            VRC checks errors on a per-character basis. It appends a single bit to make the total number of 1s either even (Even Parity) or odd (Odd Parity).
                        </p>
                        <h3>Key Points:</h3>
                        <ul>
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
