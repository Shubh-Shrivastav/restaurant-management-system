import React, { useState } from 'react';
import { FiGrid, FiCopy, FiCheck } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';

const QrManage = () => {
    const { user } = useAuth();
    const [tables, setTables] = useState(Array.from({ length: 10 }, (_, i) => `T${i + 1}`));
    const [newTable, setNewTable] = useState('');
    const [copied, setCopied] = useState('');
    const baseUrl = window.location.origin;
    const adminId = user?._id || '';

    const addTable = () => {
        if (newTable && !tables.includes(newTable)) {
            setTables([...tables, newTable]);
            setNewTable('');
        }
    };

    const copyUrl = (table) => {
        navigator.clipboard.writeText(`${baseUrl}/qr-menu/${adminId}/${table}`);
        setCopied(table);
        setTimeout(() => setCopied(''), 2000);
    };

    return (
        <div className="qr-manage-page">
            <div className="page-header">
                <h1><FiGrid /> QR Code Management</h1>
            </div>

            <div className="qr-add-section">
                <input placeholder="Table ID (e.g. T11)" value={newTable} onChange={(e) => setNewTable(e.target.value)} className="form-input" />
                <button className="btn btn-primary" onClick={addTable}>Add Table</button>
            </div>

            <div className="qr-grid">
                {tables.map(table => (
                    <div key={table} className="qr-card">
                        <h3>Table {table}</h3>
                        <div className="qr-code-wrapper">
                            <QRCodeSVG value={`${baseUrl}/qr-menu/${adminId}/${table}`} size={160} bgColor="#1e1e3f" fgColor="#ffffff" level="M" />
                        </div>
                        <p className="qr-url">{baseUrl}/qr-menu/{adminId}/{table}</p>
                        <button className="btn btn-sm btn-outline" onClick={() => copyUrl(table)}>
                            {copied === table ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy URL</>}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QrManage;
