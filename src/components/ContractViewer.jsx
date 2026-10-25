import React, { useState } from 'react';
import { 
  FileCode2, 
  Network, 
  HelpCircle, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { SOLIDITY_CODE_ENHANCED, SOLIDITY_CODE_ORIGINAL, CONTRACT_ABI } from '../contractData';

export default function ContractViewer() {
  const [selectedContract, setSelectedContract] = useState('enhanced');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAbi, setCopiedAbi] = useState(false);

  const copyCode = () => {
    const code = selectedContract === 'enhanced' ? SOLIDITY_CODE_ENHANCED : SOLIDITY_CODE_ORIGINAL;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyAbi = () => {
    navigator.clipboard.writeText(JSON.stringify(CONTRACT_ABI, null, 2));
    setCopiedAbi(true);
    setTimeout(() => setCopiedAbi(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. Architecture Flow Diagram */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Network size={22} color="#6366f1" />
          <span>Decentralized Architecture & Transaction Flow</span>
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
          How payment transactions travel from the student's browser through consensus nodes to the college treasury.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          position: 'relative'
        }}>
          {/* Node 1 */}
          <div style={{
            background: 'rgba(10, 15, 26, 0.9)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            position: 'relative'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 'bold', marginBottom: '6px' }}>STEP 1 • CLIENT</div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>Student Browser & MetaMask</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Student inputs roll number & signs the transaction with private key via MetaMask.
            </p>
          </div>

          {/* Node 2 */}
          <div style={{
            background: 'rgba(10, 15, 26, 0.9)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 'bold', marginBottom: '6px' }}>STEP 2 • NETWORK</div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>EVM JSON-RPC Node</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Broadcasts signed raw transaction to Ethereum / Sepolia mempool for validator consensus.
            </p>
          </div>

          {/* Node 3 */}
          <div style={{
            background: 'rgba(10, 15, 26, 0.9)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-md)',
            padding: '20px'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 'bold', marginBottom: '6px' }}>STEP 3 • SMART CONTRACT</div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>CollegeFeePayment.sol</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Executes Checks-Effects-Interactions, verifies payment amount, logs immutable receipt.
            </p>
          </div>

          {/* Node 4 */}
          <div style={{
            background: 'rgba(10, 15, 26, 0.9)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', marginBottom: '6px' }}>STEP 4 • BENEFICIARY</div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>College Treasury Account</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Directly receives native Ether with zero intermediary payment gateways.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Solidity Code Explorer */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Solidity Smart Contract Source</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Inspect and copy the on-chain smart contract code for Remix, Hardhat, or project reports
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${selectedContract === 'enhanced' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedContract('enhanced')}
            >
              Enhanced Version (CEI + Records)
            </button>
            <button
              className={`btn btn-sm ${selectedContract === 'original' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedContract('original')}
            >
              Original Version
            </button>
            <button className="btn btn-secondary btn-sm" onClick={copyCode}>
              {copiedCode ? <CheckCircle2 size={14} color="#10b981" /> : <Copy size={14} />}
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={copyAbi}>
              {copiedAbi ? <CheckCircle2 size={14} color="#10b981" /> : <Copy size={14} />}
              {copiedAbi ? 'Copied ABI' : 'Copy ABI'}
            </button>
          </div>
        </div>

        <pre className="code-box">
          <code>{selectedContract === 'enhanced' ? SOLIDITY_CODE_ENHANCED : SOLIDITY_CODE_ORIGINAL}</code>
        </pre>
      </div>

      {/* 3. BCT Viva / Academic Questions & Answers */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={22} color="#06b6d4" />
          <span>BCT Mini Project Viva Questions & Answers</span>
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Key technical explanations commonly asked by external examiners during project defense:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h5 style={{ color: '#818cf8', fontSize: '0.95rem', marginBottom: '6px' }}>
              Q1: Why is the Checks-Effects-Interactions (CEI) pattern critical in `payFee()`?
            </h5>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <strong>Answer:</strong> In the CEI pattern, the contract checks preconditions (<code>require(msg.value == feeAmount)</code>), modifies internal state (<code>records[msg.sender].hasPaid = true</code>), and only then performs external interactions (transferring Ether). This prevents <strong>Reentrancy Attacks</strong>, where a malicious fallback contract could hijack execution before the paid flag is marked.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h5 style={{ color: '#818cf8', fontSize: '0.95rem', marginBottom: '6px' }}>
              Q2: Why use <code>.call&#123;value: msg.value&#125;("")</code> instead of <code>.transfer()</code>?
            </h5>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <strong>Answer:</strong> <code>.transfer()</code> forwards a hardcoded gas limit of 2300 gas. Following Ethereum hard forks (EIP-1884), gas costs for opcodes changed, causing <code>.transfer()</code> to fail if the recipient is a multi-signature wallet (e.g. Gnosis Safe) or smart contract. Modern Solidity standards mandate using <code>.call</code> with a boolean success check.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h5 style={{ color: '#818cf8', fontSize: '0.95rem', marginBottom: '6px' }}>
              Q3: What role do `event FeePaid(...)` and `indexed` keywords play?
            </h5>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <strong>Answer:</strong> Solidity events write log records to the Ethereum blockchain's receipt trie, which is vastly cheaper in gas than storing data in contract storage. Adding the <code>indexed</code> keyword to the student address allows client dApps and indexers (like The Graph or Etherscan) to filter and search payment events directly by wallet address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
