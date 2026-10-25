import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  CreditCard, 
  Search, 
  ShieldCheck, 
  Code2, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import PayFeeForm from './components/PayFeeForm';
import StatusChecker from './components/StatusChecker';
import AdminPanel from './components/AdminPanel';
import ContractViewer from './components/ContractViewer';
import ReceiptModal from './components/ReceiptModal';

import {
  DEFAULT_CONTRACT_ADDRESS,
  DEFAULT_COLLEGE_ACCOUNT,
  DEFAULT_FEE_ETH,
  CONTRACT_ABI,
  INITIAL_MOCK_PAYMENTS
} from './contractData';

export default function App() {
  // Web3 state
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkName, setNetworkName] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Contract parameters
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [collegeAccount, setCollegeAccount] = useState(DEFAULT_COLLEGE_ACCOUNT);
  const [feeEth, setFeeEth] = useState(DEFAULT_FEE_ETH);

  // Payments Ledger initialized from persistent storage (filtered from any mock data)
  const [paymentsList, setPaymentsList] = useState(() => {
    try {
      const saved = localStorage.getItem('STRATA_PAYMENTS');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.filter(p => !p.isLocalCache && p.studentId !== '2024-BCT-101' && p.studentId !== '2024-BCT-102' && p.studentId !== '2024-BCT-103' && !p.txHash?.includes('4e29f3d91b8a'));
    } catch {
      return [];
    }
  });

  // Active view tab
  const [activeTab, setActiveTab] = useState('pay');

  // Transaction processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [txStep, setTxStep] = useState('');

  // Active receipt modal data
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Toast notification
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Connect MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      showToast('MetaMask extension not detected. Running in Demo Sandbox mode.');
      setIsDemoMode(true);
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      const bal = await provider.getBalance(addr);
      const network = await provider.getNetwork();

      setAccount(addr);
      setBalance(ethers.formatEther(bal));
      setNetworkName(network.name === 'unknown' ? `Chain ID ${network.chainId}` : network.name);
      setIsDemoMode(false);
      showToast(`Connected wallet: ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`);
    } catch (err) {
      console.error(err);
      showToast('Wallet connection cancelled or failed.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setBalance('');
    setIsDemoMode(true);
    showToast('Wallet disconnected. Switched to Demo Sandbox.');
  };

  // Sync on-chain events from the smart contract on mount & address change
  useEffect(() => {
    const syncOnChainEvents = async () => {
      try {
        const provider = window.ethereum
          ? new ethers.BrowserProvider(window.ethereum)
          : new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
        const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);

        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 10000);
        const events = await contract.queryFilter(contract.filters.FeePaid(), fromBlock, 'latest');

        if (events && events.length > 0) {
          const onChainPayments = events.map((ev) => ({
            txHash: ev.transactionHash,
            studentAddress: ev.args.studentAddress,
            studentId: ev.args.studentId,
            studentName: ev.args.studentName,
            department: ev.args.department,
            semester: ev.args.semester,
            category: 'Semester Tuition Fee',
            amountEth: ethers.formatEther(ev.args.amount),
            amountWei: ev.args.amount.toString(),
            timestamp: Number(ev.args.timestamp),
            blockNumber: ev.blockNumber,
            hasPaid: true,
            onChain: true
          }));

          setPaymentsList((prev) => {
            const map = new Map();
            onChainPayments.forEach((p) => map.set(p.txHash || p.studentId, p));
            prev.forEach((p) => {
              if (!map.has(p.txHash || p.studentId)) map.set(p.txHash || p.studentId, p);
            });
            const merged = Array.from(map.values());
            localStorage.setItem('STRATA_PAYMENTS', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.warn('Sync on-chain events note:', err);
      }
    };

    syncOnChainEvents();
  }, [contractAddress]);

  // Listen for MetaMask account/network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          connectWallet();
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  // Check if current connected wallet has paid
  const hasPaidCurrentWallet = Boolean(
    account && paymentsList.some((p) => p.studentAddress?.toLowerCase() === account.toLowerCase())
  );

  // Handle Pay Fee
  const handlePayFee = async ({ studentId, studentName, department, semester, category }) => {
    setIsProcessing(true);

    try {
      if (!isDemoMode && window.ethereum && account) {
        // Live Web3 transaction via MetaMask & ethers
        setTxStep('Awaiting signature in MetaMask...');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

        const feeInWei = ethers.parseEther(feeEth.toString());

        setTxStep('Broadcasting transaction to Ethereum network...');
        const tx = await contract.payFee(studentId, studentName, department, semester, {
          value: feeInWei
        });

        setTxStep('Mining block and waiting for consensus...');
        const receipt = await tx.wait();

        const newPayment = {
          txHash: receipt.hash || tx.hash,
          studentAddress: account,
          studentId,
          studentName,
          department,
          semester,
          category,
          amountEth: feeEth,
          amountWei: feeInWei.toString(),
          timestamp: Math.floor(Date.now() / 1000),
          blockNumber: receipt.blockNumber || 5220450,
          hasPaid: true,
          onChain: true
        };

        setPaymentsList((prev) => {
          const updated = [newPayment, ...prev];
          localStorage.setItem('STRATA_PAYMENTS', JSON.stringify(updated));
          return updated;
        });
        setActiveReceipt(newPayment);
        showToast('Payment successful! Transaction confirmed on-chain.');
        return newPayment;
      } else {
        throw new Error("MetaMask wallet connection required. Please connect your MetaMask wallet on Sepolia to execute real on-chain payments.");
      }
    } catch (err) {
      showToast(err.reason || err.message || "Payment transaction failed", true);
      throw err;
    } finally {
      setIsProcessing(false);
      setTxStep('');
    }
  };

  // Real On-Chain & Persistent Status Checker
  const handleCheckStatus = async (query) => {
    const q = query.trim().toLowerCase();
    const found = paymentsList.find(
      (p) =>
        p.studentId?.toLowerCase() === q ||
        p.studentAddress?.toLowerCase() === q ||
        p.studentName?.toLowerCase() === q ||
        (p.txHash && p.txHash.toLowerCase() === q)
    );
    if (found) return found;

    // Try live query on smart contract
    try {
      const provider = window.ethereum
        ? new ethers.BrowserProvider(window.ethereum)
        : new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);

      if (q.startsWith('0x') && q.length === 42) {
        const res = await contract.checkPaymentStatus(q);
        if (res && res.hasPaid) {
          return {
            txHash: 'On-Chain Verified Record',
            studentAddress: q,
            studentId: res.studentId,
            studentName: res.studentName,
            department: res.department,
            semester: res.semester,
            category: 'Semester Tuition Fee',
            amountEth: ethers.formatEther(res.amountPaid),
            amountWei: res.amountPaid.toString(),
            timestamp: Number(res.timestamp),
            blockNumber: 5220492,
            hasPaid: true,
            onChain: true
          };
        }
      } else {
        const res = await contract.checkPaymentStatusByRollId(query.trim());
        if (res && res.hasPaid) {
          return {
            txHash: 'On-Chain Verified Record',
            studentAddress: res.studentAddress,
            studentId: query.trim(),
            studentName: res.studentName,
            department: res.department,
            semester: res.semester,
            category: 'Semester Tuition Fee',
            amountEth: ethers.formatEther(res.amountPaid),
            amountWei: res.amountPaid.toString(),
            timestamp: Number(res.timestamp),
            blockNumber: 5220492,
            hasPaid: true,
            onChain: true
          };
        }
      }
    } catch (e) {
      console.warn('On-chain verification check note:', e);
    }

    return null;
  };

  // Admin: Update Fee
  const handleUpdateFee = async (newFee) => {
    if (!isDemoMode && window.ethereum && account) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      const newFeeWei = ethers.parseEther(newFee.toString());
      const tx = await contract.updateFeeAmount(newFeeWei);
      await tx.wait();
    }
    setFeeEth(newFee.toString());
    showToast(`Fee amount updated to ${newFee} ETH!`);
  };

  // Admin: Update Treasury
  const handleUpdateCollegeAccount = async (newAcc) => {
    if (!isDemoMode && window.ethereum && account) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      const tx = await contract.updateCollegeAccount(newAcc);
      await tx.wait();
    }
    setCollegeAccount(newAcc);
    showToast(`College treasury address updated!`);
  };

  // Get current user's existing receipt
  const handleViewCurrentReceipt = () => {
    const found = paymentsList.find(
      (p) => p.studentAddress?.toLowerCase() === account?.toLowerCase()
    );
    if (found) {
      setActiveReceipt(found);
    }
  };

  return (
    <div className="app-container">
      {/* Top Announcement Bar for Strata 3D Edition */}
      <div style={{
        background: 'linear-gradient(90deg, #4d19b1, #6f5adc, #06b6d4)',
        padding: '10px 20px',
        textAlign: 'center',
        fontSize: '0.88rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        color: '#ffffff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        zIndex: 101
      }}>
        <span>✨ Ultra-Premium 3D Isometric Strata Web3 Edition is Live!</span>
        <a 
          href="/strata.html" 
          style={{
            background: 'rgba(255,255,255,0.22)',
            color: '#ffffff',
            padding: '4px 14px',
            borderRadius: '999px',
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.45)',
            fontSize: '0.8rem',
            fontWeight: '700',
            transition: 'all 0.2s ease'
          }}
        >
          Open Strata 3D &rarr;
        </a>
      </div>

      {/* Top Navbar */}
      <Navbar
        account={account}
        balance={balance}
        isConnecting={isConnecting}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        networkName={networkName}
      />

      {/* Main Body */}
      <main className="main-content">
        {/* Hero Title */}
        <section className="hero-header">
          <div className="badge badge-purple" style={{ marginBottom: '12px' }}>
            <Sparkles size={14} /> Blockchain Technology Mini Project (Sem 5)
          </div>
          <h1>
            Decentralized <span className="gradient-text">College Fee Payment</span> System
          </h1>
          <p>
            Secure, transparent, and immutable tuition fee payments governed by Ethereum smart contracts. Direct peer-to-college settlement with zero intermediary gateway fees.
          </p>
        </section>

        {/* Live Metrics Row */}
        <StatsCards
          feeEth={feeEth}
          totalPaidCount={paymentsList.length}
          collegeAccount={collegeAccount}
          contractAddress={contractAddress}
        />

        {/* Navigation Tabs */}
        <div className="nav-tabs-wrapper">
          <button
            className={`nav-tab ${activeTab === 'pay' ? 'active' : ''}`}
            onClick={() => setActiveTab('pay')}
          >
            <CreditCard size={18} /> Pay College Fee
          </button>
          <button
            className={`nav-tab ${activeTab === 'verify' ? 'active' : ''}`}
            onClick={() => setActiveTab('verify')}
          >
            <Search size={18} /> Verify Fee Status
          </button>
          <button
            className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <ShieldCheck size={18} /> College Administration
          </button>
          <button
            className={`nav-tab ${activeTab === 'contract' ? 'active' : ''}`}
            onClick={() => setActiveTab('contract')}
          >
            <Code2 size={18} /> Smart Contract & Architecture
          </button>
        </div>

        {/* Tab View Contents */}
        <div style={{ marginTop: '24px' }}>
          {activeTab === 'pay' && (
            <PayFeeForm
              account={account}
              feeEth={feeEth}
              hasPaidCurrentWallet={hasPaidCurrentWallet}
              onPayFee={handlePayFee}
              isProcessing={isProcessing}
              txStep={txStep}
              onViewExistingReceipt={handleViewCurrentReceipt}
              isDemoMode={isDemoMode}
            />
          )}

          {activeTab === 'verify' && (
            <StatusChecker
              onCheckStatus={handleCheckStatus}
              onViewReceipt={(receipt) => setActiveReceipt(receipt)}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPanel
              paymentsList={paymentsList}
              collegeAccount={collegeAccount}
              feeEth={feeEth}
              onUpdateFee={handleUpdateFee}
              onUpdateCollegeAccount={handleUpdateCollegeAccount}
              onViewReceipt={(receipt) => setActiveReceipt(receipt)}
              isOwner={true}
            />
          )}

          {activeTab === 'contract' && <ContractViewer />}
        </div>
      </main>

      {/* Official Blockchain Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="toast">
          <CheckCircle2 size={18} color="#10b981" />
          <span style={{ fontSize: '0.9rem', color: '#f8fafc' }}>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
