import React, { useState } from 'react';
import axios from 'axios';

const LRC = () => {
    const [blockSize, setBlockSize] = useState(8);
    const [numBlocks, setNumBlocks] = useState(2);
    const [blocks, setBlocks] = useState(['', '']);
    const [evenParity, setEvenParity] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const handleNumBlocksChange = (e) => {
        const val = parseInt(e.target.value) || 0;
        setNumBlocks(val);
        setBlocks(prev => {
            const newBlocks = [...prev];
            if (val > prev.length) {
                for (let i = prev.length; i < val; i++) newBlocks.push('');
            } else {
                newBlocks.length = val;
            }
            return newBlocks;
        });
        setValidationErrors({});
        setResult(null);
    };

    const handleBlockSizeChange = (e) => {
        setBlockSize(parseInt(e.target.value) || 0);
        setValidationErrors({});
        setResult(null);
    };

    const handleBlockChange = (index, val) => {
        const newBlocks = [...blocks];
        newBlocks[index] = val;
        setBlocks(newBlocks);

        const errors = { ...validationErrors };
        if (!/^[01]*$/.test(val)) {
            errors[index] = 'Must be binary (0/1)';
        } else if (val.length !== blockSize) {
            errors[index] = `Must be ${blockSize} bits`;
        } else {
            delete errors[index];
        }
        setValidationErrors(errors);
        setResult(null);
    };

    const handleCalculate = async () => {
        const errors = {};
        blocks.forEach((block, idx) => {
            if (!block) errors[idx] = 'Required';
            else if (!/^[01]+$/.test(block)) errors[idx] = 'Must be binary';
            else if (block.length !== blockSize) errors[idx] = `Must be ${blockSize} bits`;
        });

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            setError(null);
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">Block Size (bits)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={blockSize}
                                onChange={handleBlockSizeChange}
                                min="1"
                                placeholder="8"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Number of Blocks</label>
                            <input
                                type="number"
                                className="input-field"
                                value={numBlocks}
                                onChange={handleNumBlocksChange}
                                min="1"
                                placeholder="2"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Data Blocks</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {blocks.map((block, idx) => (
                                <div key={idx} style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={block}
                                        onChange={(e) => handleBlockChange(idx, e.target.value)}
                                        placeholder={`Block ${idx + 1} (${blockSize} bits)`}
                                        style={validationErrors[idx] ? { borderColor: 'var(--error)' } : {}}
                                    />
                                    {validationErrors[idx] && (
                                        <div style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                            {validationErrors[idx]}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
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
