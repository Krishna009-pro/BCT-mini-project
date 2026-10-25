import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Coins, 
  Landmark, 
  Users, 
  ArrowUpRight, 
  CheckCircle2, 
  Receipt, 
  Search,
  Filter
} from 'lucide-react';

export default function AdminPanel({
  paymentsList,
  collegeAccount,
  feeEth,
  onUpdateFee,
  onUpdateCollegeAccount,
  onViewReceipt,
  isOwner
}) {
  const [newFee, setNewFee] = useState(feeEth);
  const [newAccount, setNewAccount] = useState(collegeAccount);
  const [feeStatus, setFeeStatus] = useState('');
  const [accountStatus, setAccountStatus] = useState('');
  const [searchTable, setSearchTable] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdateFee(newFee);
      setFeeStatus('Fee updated successfully on-chain!');
      setTimeout(() => setFeeStatus(''), 4000);
    } catch (err) {
      setFeeStatus('Error: ' + err.message);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdateCollegeAccount(newAccount);
      setAccountStatus('College treasury updated successfully!');
      setTimeout(() => setAccountStatus(''), 4000);
    } catch (err) {
      setAccountStatus('Error: ' + err.message);
    }
  };

  const totalCollectedEth = paymentsList.reduce((acc, p) => acc + parseFloat(p.amountEth || 0.05), 0);

  const filteredPayments = paymentsList.filter((item) => {
    const matchesSearch = 
      item.studentName?.toLowerCase().includes(searchTable.toLowerCase()) ||
      item.studentId?.toLowerCase().includes(searchTable.toLowerCase()) ||
      item.studentAddress?.toLowerCase().includes(searchTable.toLowerCase());

    const matchesDept = filterDept === 'All' || item.department === filterDept;

    return matchesSearch && matchesDept;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const d = new Date(typeof timestamp === 'number' && timestamp < 1e12 ? timestamp * 1000 : timestamp);
    return d.toLocaleString('en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Admin Stats Overview */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Treasury Revenue</span>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Coins size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            {totalCollectedEth.toFixed(2)} ETH
          </div>
          <div className="stat-subtext">Directly forwarded to college treasury</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-title">Registered Students</span>
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value gradient-text">
            {paymentsList.length} Records
          </div>
          <div className="stat-subtext">Verified on-chain mapping</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-title">Authority Role</span>
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.4rem', color: '#a78bfa' }}>
            College Admin
          </div>
          <div className="stat-subtext">Authorized with onlyOwner modifier</div>
        </div>
      </div>

      {/* Contract Administration Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Update Fee Amount */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Coins size={18} color="#6366f1" />
            <span>Update Required Fee Amount</span>
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '18px' }}>
            Calls <code>updateFeeAmount(uint256)</code> on the smart contract to adjust mandatory tuition.
          </p>

          <form onSubmit={handleFeeSubmit}>
            <div className="form-group">
              <label className="form-label">New Fee Amount (ETH)</label>
              <input
                type="number"
                step="0.001"
                className="input-field"
                value={newFee}
                onChange={(e) => setNewFee(e.target.value)}
                required
              />
            </div>
            {feeStatus && (
              <div style={{ fontSize: '0.85rem', color: '#10b981', marginBottom: '12px' }}>
                {feeStatus}
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
              Update Fee On-Chain
            </button>
          </form>
        </div>

        {/* Update College Treasury */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Landmark size={18} color="#06b6d4" />
            <span>Update College Treasury Wallet</span>
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '18px' }}>
            Calls <code>updateCollegeAccount(address)</code> to divert student payments to a new treasury.
          </p>

          <form onSubmit={handleAccountSubmit}>
            <div className="form-group">
              <label className="form-label">New Treasury Wallet Address</label>
              <input
                type="text"
                className="input-field mono"
                placeholder="0x..."
                value={newAccount}
                onChange={(e) => setNewAccount(e.target.value)}
                required
              />
            </div>
            {accountStatus && (
              <div style={{ fontSize: '0.85rem', color: '#10b981', marginBottom: '12px' }}>
                {accountStatus}
              </div>
            )}
            <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Update Treasury Address
            </button>
          </form>
        </div>
      </div>

      {/* Master Payments Ledger Table */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Master Fee Payment Ledger</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Real-time records retrieved from the blockchain
            </p>
          </div>

          {/* Search & Filter */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Search student or ID..."
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                style={{ padding: '8px 12px 8px 34px', fontSize: '0.85rem' }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <select
              className="select-field"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '0.85rem', width: '170px' }}
            >
              <option value="All">All Departments</option>
              <option value="Computer Engineering">Computer Eng.</option>
              <option value="Information Technology">Information Tech.</option>
              <option value="AI & Data Science">AI & Data Science</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Term</th>
                <th>Fee Paid</th>
                <th>Tx Hash</th>
                <th>Date / Time</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((item, idx) => (
                  <tr key={idx}>
                    <td className="mono" style={{ fontWeight: '700', color: '#818cf8' }}>
                      {item.studentId}
                    </td>
                    <td style={{ fontWeight: '600' }}>{item.studentName}</td>
                    <td>{item.department || 'Computer Engineering'}</td>
                    <td>{item.semester || 'Semester 5'}</td>
                    <td className="mono" style={{ color: '#10b981', fontWeight: 'bold' }}>
                      {item.amountEth || '0.05'} ETH
                    </td>
                    <td className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {item.txHash ? `${item.txHash.substring(0, 10)}...` : '0xConfirmed'}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {formatDate(item.timestamp)}
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                        onClick={() => onViewReceipt(item)}
                      >
                        <Receipt size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No payment records matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
