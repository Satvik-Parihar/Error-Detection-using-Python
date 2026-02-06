import React, { useState } from 'react';
import axios from 'axios';

const LRC = () => {
    const [dataInput, setDataInput] = useState('');
    const [evenParity, setEvenParity] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleCalculate = async () => {
        try {
            setError(null);
            // Split input by comma or space
            const blocks = dataInput.split(/[ ,]+/).filter(x => x.trim() !== '');
            const res = await axios.post('http://localhost:8000/api/lrc', { data_blocks: blocks, even_parity: evenParity });
            setResult(res.data);
        } catch (err) {
            setError('Error calculating LRC');
            console.error(err);
        }
    };

    return (
        <div>
            <div className="algorithm-header">
                <h1 className="algorithm-title">Longitudinal Redundancy Check (LRC)</h1>
                <p className="algorithm-desc">
                    LRC applies parity check on a block of data. It organizes data into a table (rows and columns) and calculates a parity bit for each column.
                </p>
            </div>

            <div className="content-grid">
                <div className="card">
                    <h2 className="card-title">Simulation</h2>

                    <div className="input-group">
                        <label className="input-label">Data Blocks (space separated, e.g. 1100 1010 0011)</label>
                        <input
                            type="text"
                            className="input-field"
                            value={dataInput}
                            onChange={(e) => setDataInput(e.target.value)}
                            placeholder="1100 1010"
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

                    <button className="btn-primary" onClick={handleCalculate}>Calculate LRC</button>

                    {result && (
                        <div className="result-area">
                            <div className="result-item">
                                <span>Input Blocks:</span>
                                <div>{result.data_blocks.map(b => <span key={b} style={{ marginRight: '10px' }}>{b}</span>)}</div>
                            </div>
                            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />
                            <div className="result-item">
                                <span>LRC (Parity Block):</span>
                                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{result.lrc}</span>
                            </div>
                        </div>
                    )}
                    {error && <div style={{ color: 'var(--error)', marginTop: '1rem' }}>{error}</div>}
                </div>

                <div className="card">
                    <h2 className="card-title">Theory & Method</h2>
                    <div className="theory-text">
                        <p>
                            In LRC, a block of parity bits is generated. Key advantages include improved detection capability compared to VRC.
                            It can detect burst errors (checking across columns).
                        </p>
                        <h3>Steps:</h3>
                        1. Arrange data words in rows.<br />
                        2. Calculate parity for each column.<br />
                        3. The resulting sequence of parity bits forms the LRC.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LRC;
