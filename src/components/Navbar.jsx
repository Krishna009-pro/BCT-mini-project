import React from 'react';
import { 
  GraduationCap, 
  Wallet, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Sparkles, 
  Cpu, 
  Wifi, 
  ShieldCheck 
} from 'lucide-react';

export default function Navbar({
  account,
  balance,
  isConnecting,
  connectWallet,
  disconnectWallet,
  isDemoMode,
  setIsDemoMode,
  networkName
}) {
  const [copied, setCopied] = React.useState(false);

  const copyAddress = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortenAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-icon-wrapper">
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="brand-title">
              EduChain <span className="gradient-text">Pay</span>
            </div>
            <div className="brand-subtitle">
              BCT Mini Project • Decentralized Fee Portal
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Mode Switcher */}
          <div className="mode-switch" title="Toggle between real MetaMask Web3 and Demo Sandbox for presentations">
            <button
              className={`mode-btn ${!isDemoMode ? 'active' : ''}`}
              onClick={() => setIsDemoMode(false)}
            >
              <Cpu size={14} /> Live Web3
            </button>
            <button
              className={`mode-btn ${isDemoMode ? 'active-mock' : ''}`}
              onClick={() => setIsDemoMode(true)}
            >
              <Sparkles size={14} /> Demo Sandbox
            </button>
          </div>

          {/* Network Badge */}
          <div className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-dot pulse" style={{ color: isDemoMode ? '#10b981' : '#6366f1' }}></span>
            <span>{isDemoMode ? 'Simulated Chain' : networkName || 'Sepolia Testnet'}</span>
          </div>

          {/* Wallet Button */}
          {account ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                onClick={copyAddress}
                title="Click to copy address"
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                <span className="mono" style={{ fontSize: '0.82rem' }}>
                  {shortenAddress(account)}
                </span>
                <span style={{ color: 'var(--text-accent)', fontWeight: 'bold' }}>
                  {balance ? `${parseFloat(balance).toFixed(3)} ETH` : ''}
                </span>
                {copied ? <CheckCircle2 size={13} color="#10b981" /> : <Copy size={13} />}
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={disconnectWallet}
                title="Disconnect wallet"
                style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              <Wallet size={16} />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
