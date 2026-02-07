import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LRC = () => {
    const [blockSize, setBlockSize] = useState(8);
    const [numBlocks, setNumBlocks] = useState(2);
    const [blocks, setBlocks] = useState(['', '']);
    const [evenParity, setEvenParity] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const [view, setView] = useState('sender');
    const [receiverTab, setReceiverTab] = useState('correct');
    const [receiverData, setReceiverData] = useState(null);
    const [verificationResult, setVerificationResult] = useState(null);

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
        setView('sender');
    };

    const handleBlockSizeChange = (e) => {
        setBlockSize(parseInt(e.target.value) || 0);
        setValidationErrors({});
        setResult(null);
        setView('sender');
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
        setView('sender');
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

    const handleShowReceiver = () => {
        setView('transmitting');
        setTimeout(() => {
            setView('receiver');
            generateReceiverCases();
        }, 3000);
    };

    const generateReceiverCases = () => {
        if (!result) return;
        const correctBlocks = [...blocks];

        const detectedBlocks = [...blocks];
        if (detectedBlocks.length > 0) {
            const arr = detectedBlocks[0].split('');
            arr[0] = arr[0] === '0' ? '1' : '0';
            detectedBlocks[0] = arr.join('');
        }

        const undetectedBlocks = [...blocks];
        if (undetectedBlocks.length >= 2) {
            const arr1 = undetectedBlocks[0].split('');
            const arr2 = undetectedBlocks[1].split('');
            arr1[0] = arr1[0] === '0' ? '1' : '0';
            arr2[0] = arr2[0] === '0' ? '1' : '0';
            undetectedBlocks[0] = arr1.join('');
            undetectedBlocks[1] = arr2.join('');
        }

        setReceiverData({
            correct: { blocks: correctBlocks, label: 'No Error' },
            detected: { blocks: detectedBlocks, label: 'Single Bit Error' },
            undetected: { blocks: undetectedBlocks, label: 'Two Bit Column Error' }
        });
    };

    useEffect(() => {
        if (view === 'receiver' && receiverData && receiverData[receiverTab]) {
            verifyReceiverCase(receiverData[receiverTab].blocks);
        }
    }, [receiverTab, view, receiverData]);

    const verifyReceiverCase = async (currentBlocks) => {
        try {
            const res = await axios.post('http://localhost:8000/api/lrc/verify', {
                data_blocks: currentBlocks,
                received_lrc: result.lrc,
                even_parity: evenParity
            });
            setVerificationResult(res.data);
        } catch (err) {
            console.error("Verification Error", err);
        }
    };

    const renderReceiverContent = () => {
        if (!receiverData || !verificationResult) return null;

        let currentBlocks = receiverData[receiverTab].blocks;
        const isValid = verificationResult.is_valid;
        const calculatedLRC = verificationResult.calculated_lrc;
        const sentLRC = result.lrc;

        let status = '';
        let description = '';

        if (receiverTab === 'correct') {
            status = isValid ? 'ACCEPTED' : 'REJECTED';
            description = `Receiver calculated LRC from data blocks: ${calculatedLRC}. Matches Received LRC: ${sentLRC}. Data Integrity Confirmed.`;
        } else if (receiverTab === 'detected') {
            status = isValid ? 'ACCEPTED (FALSE NEGATIVE)' : 'REJECTED';
            description = `Single bit error at Block 1, Bit 0. Calculated LRC became ${calculatedLRC}, which does NOT match received ${sentLRC}. Error Detected.`;
        } else if (receiverTab === 'undetected') {
            status = isValid ? 'ACCEPTED (FALSE POSITIVE)' : 'REJECTED';
            description = `Bits at position 0 were flipped in BOTH Block 1 and Block 2. The column parity count changed by 2 (even number), so the LRC calculation (${calculatedLRC}) remains identical to the original. The system fails to detect this multi-bit error.`;
        }

        return (
            <div className="receiver-panel">
                <div className="receiver-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    {['correct', 'detected', 'undetected'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setReceiverTab(tab)}
                            className={`btn-tab ${receiverTab === tab ? 'active' : ''}`}
                            style={{
                                background: receiverTab === tab ? 'var(--primary)' : 'transparent',
                                color: receiverTab === tab ? '#fff' : 'var(--text-muted)',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab === 'correct' ? 'Correct Data' : tab === 'detected' ? 'Detected Error' : 'Undetected Error'}
                        </button>
                    ))}
                </div>

                <div className="receiver-display">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Received Data</h3>
                        <div className="data-preview" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {currentBlocks.map((block, idx) => (
                                <div key={idx} style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    border: (receiverTab !== 'correct' && block !== blocks[idx]) ? '1px solid var(--secondary)' : '1px solid transparent'
                                }}>
                                    <span style={{ color: 'var(--text-muted)', marginRight: '1rem' }}>Block {idx + 1}:</span>
                                    <span style={{ color: '#fff' }}>{block}</span>
                                </div>
                            ))}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <div style={{
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    border: '1px dashed var(--primary)',
                                    flex: 1
                                }}>
                                    <div style={{ color: 'var(--primary)', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Sent LRC:</div>
                                    <div style={{ fontSize: '1.1rem' }}>{sentLRC}</div>
                                </div>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    border: '1px solid var(--border-color)',
                                    flex: 1
                                }}>
                                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Calculated LRC:</div>
                                    <div style={{ fontSize: '1.1rem', color: isValid ? 'var(--success)' : 'var(--error)' }}>{calculatedLRC}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="receiver-status" style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        background: status.includes('ACCEPTED') && !status.includes('FALSE') ? 'rgba(74, 222, 128, 0.1)' : status.includes('REJECTED') ? 'rgba(248, 113, 113, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                        border: `1px solid ${status.includes('ACCEPTED') && !status.includes('FALSE') ? 'var(--success)' : status.includes('REJECTED') ? 'var(--error)' : 'var(--secondary)'}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Status</div>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: status.includes('ACCEPTED') && !status.includes('FALSE') ? 'var(--success)' : status.includes('REJECTED') ? 'var(--error)' : 'var(--secondary)'
                                }}>
                                    {status}
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <strong style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason:</strong>
                            <p style={{ marginTop: '0.5rem', lineHeight: '1.5', color: '#fff' }}>{description}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                {view === 'transmitting' && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gridColumn: 'span 2' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            border: '4px solid var(--primary)',
                            borderTopColor: 'transparent',
                            animation: 'spin 1s linear infinite',
                            marginBottom: '2rem'
                        }}></div>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '1rem' }}>Transmitting Data...</h2>
                        <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div>Data: {blocks.join(' ')}</div>
                            <div style={{ color: 'var(--success)' }}>LRC: {result?.lrc}</div>
                        </div>
                    </div>
                )}

                {view === 'receiver' && (
                    <div className="card" style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 className="card-title" style={{ margin: 0 }}>Receiver Side</h2>
                            <button
                                onClick={() => setView('sender')}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-muted)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Back to Sender
                            </button>
                        </div>
                        {renderReceiverContent()}
                    </div>
                )}

                {view === 'sender' && (
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
                            <div>
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
                                <button
                                    className="btn-primary"
                                    onClick={handleShowReceiver}
                                    style={{
                                        marginTop: '2rem',
                                        background: 'linear-gradient(135deg, var(--secondary) 0%, #be185d 100%)'
                                    }}
                                >
                                    Show Receiver Side
                                </button>
                            </div>
                        )}
                        {error && <div style={{ color: 'var(--error)', marginTop: '1rem' }}>{error}</div>}
                    </div>
                )}

                {view === 'sender' && (
                    <div className="card">
                        <h2 className="card-title">Theory & Method</h2>
                        <div className="theory-text">
                            <p>
                                <strong>Working:</strong> LRC organizes data into a 2D matrix (block of rows). It calculates a parity bit for each vertical column, creating a new row of parity bits (the LRC byte) that gets appended to the block.
                            </p>
                            <h3>Key Points:</h3>
                            <ul>
                                <li><strong>Function:</strong> Detects errors by validating the parity of each column in a block of data.</li>
                                <li><strong>Efficiency:</strong> Increases the likelihood of detecting burst errors compared to VRC.</li>
                                <li><strong>Drawback:</strong> It cannot detect errors if two bits at the same position in two different data units are damaged (a specific rectangular error pattern).</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LRC;
