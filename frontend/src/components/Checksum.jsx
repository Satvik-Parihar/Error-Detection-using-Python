import React, { useState } from 'react';
import axios from 'axios';

const Checksum = () => {
    const [blockSize, setBlockSize] = useState(8);
    const [numBlocks, setNumBlocks] = useState(2);
    const [blocks, setBlocks] = useState(['', '']);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const handleNumBlocksChange = (e) => {
        const val = parseInt(e.target.value) || 0;
        setNumBlocks(val);
        // Resize blocks array
        setBlocks(prev => {
            const newBlocks = [...prev];
            if (val > prev.length) {
                // Add empty strings
                for (let i = prev.length; i < val; i++) newBlocks.push('');
            } else {
                // Truncate
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

        // Validate immediately
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
        // Final Validation
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
            const data = blocks.join('');
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

                    <button className="btn-primary" onClick={handleCalculate} style={{ marginTop: '1rem' }}>Calculate Checksum</button>

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

                            <div style={{ marginTop: '2rem' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '1rem', fontWeight: '500', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Calculation Log</span>
                                <div className="step-list">
                                    {result.steps.map((step, idx) => {
                                        // Parse step string: "Add 1010 (10) to sum 0"
                                        const addMatch = step.match(/Add ([01]+) \((\d+)\) to sum (\d+)/);
                                        const wrapMatch = step.match(/Wrapping carry: new sum = (\d+) \(([01]+)\)/);
                                        const totalMatch = step.match(/Total Sum \(raw\): (\d+) \(([01]+)\)/);

                                        if (addMatch) {
                                            return (
                                                <div key={idx} className="step-card">
                                                    <div className="step-icon add">+</div>
                                                    <div className="step-details">
                                                        <div className="step-title">Add Block</div>
                                                        <div className="step-data">
                                                            <span className="mono">{addMatch[1]}</span>
                                                            <span className="dec">({addMatch[2]})</span>
                                                        </div>
                                                    </div>
                                                    <div className="step-result">
                                                        <span className="label">Current Sum</span>
                                                        <span className="value">{parseInt(addMatch[3]) + parseInt(addMatch[2])}</span>
                                                    </div>
                                                </div>
                                            );
                                        } else if (wrapMatch) {
                                            return (
                                                <div key={idx} className="step-card wrap">
                                                    <div className="step-icon wrap">↺</div>
                                                    <div className="step-details">
                                                        <div className="step-title">Wrap Carry</div>
                                                        <div className="step-desc">Sum exceeded max bits</div>
                                                    </div>
                                                    <div className="step-result">
                                                        <span className="label">New Sum</span>
                                                        <span className="value">{wrapMatch[1]}</span>
                                                        <span className="mono-sm">{wrapMatch[2]}</span>
                                                    </div>
                                                </div>
                                            );
                                        } else if (totalMatch) {
                                            return (
                                                <div key={idx} className="step-card total">
                                                    <div className="step-icon total">=</div>
                                                    <div className="step-details">
                                                        <div className="step-title">Raw Sum</div>
                                                    </div>
                                                    <div className="step-result">
                                                        <span className="value">{totalMatch[1]}</span>
                                                        <span className="mono-sm">{totalMatch[2]}</span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={idx} className="step-item-raw">{step}</div>
                                        );
                                    })}
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
