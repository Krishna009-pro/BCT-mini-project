import React from 'react';
import { Coins, Users, Landmark, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';

export default function StatsCards({
  feeEth,
  totalPaidCount,
  collegeAccount,
  contractAddress
}) {
  const [copiedAddr, setCopiedAddr] = React.useState(null);

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedAddr(key);
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  const shorten = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="stats-grid">
      {/* 1. Required Fee */}
      <div className="glass-panel stat-card">
        <div className="stat-header">
          <span className="stat-title">Mandatory College Fee</span>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Coins size={20} />
          </div>
        </div>
        <div className="stat-value gradient-text">
          {feeEth} ETH
        </div>
        <div className="stat-subtext">
          Equivalent to ~{Math.round(parseFloat(feeEth || 0.05) * 1e18)} Wei
        </div>
      </div>

      {/* 2. Total Paid Students */}
      <div className="glass-panel stat-card">
        <div className="stat-header">
          <span className="stat-title">Fees Confirmed On-Chain</span>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Users size={20} />
          </div>
        </div>
        <div className="stat-value" style={{ color: '#10b981' }}>
          {totalPaidCount} Students
        </div>
        <div className="stat-subtext">
          Immutable records stored in blockchain mapping
        </div>
      </div>

      {/* 3. College Treasury Account */}
      <div className="glass-panel stat-card">
        <div className="stat-header">
          <span className="stat-title">College Treasury Account</span>
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <Landmark size={20} />
          </div>
        </div>
        <div className="stat-value mono" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {shorten(collegeAccount)}
          <button
            onClick={() => copyText(collegeAccount, 'treasury')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            title="Copy College Account"
          >
            {copiedAddr === 'treasury' ? <CheckCircle2 size={16} color="#10b981" /> : <Copy size={16} />}
          </button>
        </div>
        <div className="stat-subtext">
          Receives fees directly via Checks-Effects-Interactions
        </div>
      </div>

      {/* 4. Smart Contract Security */}
      <div className="glass-panel stat-card">
        <div className="stat-header">
          <span className="stat-title">Contract Verification</span>
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
            <ShieldCheck size={20} />
          </div>
        </div>
        <div className="stat-value" style={{ fontSize: '1.3rem', color: '#a78bfa' }}>
          CEI Protected
        </div>
        <div className="stat-subtext mono" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Contract: {shorten(contractAddress)}</span>
          <button
            onClick={() => copyText(contractAddress, 'contract')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            title="Copy Contract Address"
          >
            {copiedAddr === 'contract' ? <CheckCircle2 size={14} color="#10b981" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
