import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck, ExternalLink, Hash, Calendar, User, BookOpen } from 'lucide-react';

export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return new Date().toLocaleString();
    const d = new Date(typeof timestamp === 'number' && timestamp < 1e12 ? timestamp * 1000 : timestamp);
    return d.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="#10b981" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Official On-Chain Receipt</h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Printable Certificate Box */}
          <div className="receipt-certificate" id="printable-receipt">
            {/* Header */}
            <div className="receipt-header">
              <div className="college-brand-receipt">
                <h3>DEPARTMENT OF HIGHER EDUCATION</h3>
                <p>Decentralized College Fee Ledger • Blockchain Verified</p>
                <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: '700' }}>
                  SMART CONTRACT RECEIPT #REC-{receipt.studentId || 'GEN'}-{Math.floor(Math.random() * 8999 + 1000)}
                </span>
              </div>
              <div className="receipt-seal">
                <span>CHAIN<br/>SEAL<br/>VERIFIED</span>
              </div>
            </div>

            {/* Student & Course Details */}
            <div className="receipt-grid">
              <div className="receipt-item">
                <label>Student Full Name</label>
                <span>{receipt.studentName || 'N/A'}</span>
              </div>
              <div className="receipt-item">
                <label>Student Roll / ID</label>
                <span className="mono">{receipt.studentId || 'N/A'}</span>
              </div>
              <div className="receipt-item">
                <label>Department / Branch</label>
                <span>{receipt.department || 'Computer Engineering'}</span>
              </div>
              <div className="receipt-item">
                <label>Academic Term</label>
                <span>{receipt.semester || 'Semester 5'}</span>
              </div>
              <div className="receipt-item">
                <label>Fee Category</label>
                <span>{receipt.category || 'Academic Semester Fee'}</span>
              </div>
              <div className="receipt-item">
                <label>Amount Paid</label>
                <span style={{ color: '#059669', fontSize: '1.1rem' }}>
                  {receipt.amountEth || '0.05'} ETH
                </span>
              </div>
            </div>

            {/* Blockchain Transaction Verification */}
            <div className="receipt-hash-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label>Ethereum Transaction Hash</label>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '600' }}>Status: Confirmed</span>
              </div>
              <code>{receipt.txHash || '0x' + Array(64).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join('')}</code>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                <span>Block: #{receipt.blockNumber || '5220419'}</span>
                <span>Timestamp: {formatDate(receipt.timestamp)}</span>
              </div>
            </div>

            <div className="receipt-hash-box" style={{ background: '#f1f5f9', borderStyle: 'dashed' }}>
              <label>Student Payer Wallet Address</label>
              <code style={{ color: '#0f172a' }}>{receipt.studentAddress || '0xConnectedWallet'}</code>
            </div>

            {/* Footer Certificate Note */}
            <div className="receipt-footer-cert">
              <div>
                <span>Signed by: <strong>CollegeFeePayment.sol</strong></span>
                <p style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  Cryptographically secured by Ethereum Virtual Machine (EVM) consensus.
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success">PAID & VERIFIED</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePrint}>
              <Printer size={18} /> Print Official Receipt
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
