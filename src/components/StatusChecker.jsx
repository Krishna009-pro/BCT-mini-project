import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle, Clock, ShieldCheck, User, Calendar, Receipt, ExternalLink } from 'lucide-react';

export default function StatusChecker({ onCheckStatus, onViewReceipt }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const match = await onCheckStatus(query.trim());
      setResult(match);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      setResult(null);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const d = new Date(typeof timestamp === 'number' && timestamp < 1e12 ? timestamp * 1000 : timestamp);
    return d.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>
          Blockchain Fee Status Verifier
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Query on-chain records to verify student tuition fee payment clearance.
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            className="input-field"
            placeholder="Enter Student Roll ID (e.g. 2024-BCT-101) or 0x Wallet Address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '44px' }}
          />
          <Search 
            size={20} 
            color="var(--text-muted)" 
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} 
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSearching}>
          {isSearching ? 'Verifying...' : 'Verify Status'}
        </button>
      </form>

      {/* Result Display */}
      {hasSearched && (
        <div>
          {result && result.hasPaid ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981'
                  }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', color: '#10b981', fontWeight: '700' }}>
                      Payment Verified On-Chain
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Record matched in smart contract mapping
                    </span>
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => onViewReceipt(result)}
                >
                  <Receipt size={16} /> View Official Receipt
                </button>
              </div>

              {/* Information Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '18px', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student Name</div>
                  <div style={{ fontWeight: '700', fontSize: '1rem' }}>{result.studentName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student Roll ID</div>
                  <div className="mono" style={{ fontWeight: '700', fontSize: '1rem', color: '#818cf8' }}>{result.studentId}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</div>
                  <div style={{ fontWeight: '600' }}>{result.department || 'Computer Engineering'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fee Amount</div>
                  <div className="mono" style={{ fontWeight: '700', color: '#10b981' }}>{result.amountEth || '0.05'} ETH</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Transaction Hash</div>
                  <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-accent)', wordBreak: 'break-all' }}>
                    {result.txHash || '0xOnChainTransactionRecord'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timestamp</div>
                  <div style={{ fontSize: '0.85rem' }}>{formatDate(result.timestamp)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                margin: '0 auto 12px'
              }}>
                <XCircle size={28} />
              </div>
              <h4 style={{ fontSize: '1.15rem', color: '#ef4444', marginBottom: '6px' }}>
                No Fee Payment Record Found
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No verified payment exists for <strong>"{query}"</strong>. Please ensure the Roll Number or Wallet Address is correct or proceed to pay the semester fee.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
