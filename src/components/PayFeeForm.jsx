import React, { useState } from 'react';
import { 
  CreditCard, 
  UserCheck, 
  ShieldAlert, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  HelpCircle, 
  Receipt, 
  Sparkles,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PayFeeForm({
  account,
  feeEth,
  hasPaidCurrentWallet,
  onPayFee,
  isProcessing,
  txStep,
  onViewExistingReceipt,
  isDemoMode
}) {
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [department, setDepartment] = useState('Computer Engineering');
  const [semester, setSemester] = useState('Semester 5');
  const [category, setCategory] = useState('Semester Tuition Fee');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!studentId.trim()) {
      setFormError('Please enter your Student Roll Number / ID');
      return;
    }
    if (!studentName.trim()) {
      setFormError('Please enter your Full Name');
      return;
    }

    try {
      const receipt = await onPayFee({
        studentId: studentId.trim(),
        studentName: studentName.trim(),
        department,
        semester,
        category
      });

      if (receipt) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Payment failed. Please try again.');
    }
  };

  return (
    <div className="portal-layout">
      {/* Main Payment Form Card */}
      <div className="glass-panel payment-card">
        <div className="card-title">
          <CreditCard className="text-accent" size={24} color="#6366f1" />
          <span>Student Fee Payment Portal</span>
        </div>
        <p className="card-desc">
          Pay your university tuition fee directly to the college smart contract. All transactions are permanently sealed on the blockchain.
        </p>

        {hasPaidCurrentWallet ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#10b981'
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h4 style={{ fontSize: '1.2rem', color: '#10b981', marginBottom: '8px' }}>
              Fee Already Paid!
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '18px' }}>
              Your connected wallet address has already submitted the required college fee to the smart contract.
            </p>
            <button className="btn btn-primary" onClick={onViewExistingReceipt}>
              <Receipt size={18} /> View Your Blockchain Receipt
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {formError && (
              <div style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger)',
                color: '#fca5a5',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem'
              }}>
                <ShieldAlert size={18} color="#ef4444" />
                <span>{formError}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Student Roll / ID No. <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 2024-BCT-104"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={isProcessing}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Student Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Aryan Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  disabled={isProcessing}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department / Branch</label>
                <select
                  className="select-field"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={isProcessing}
                >
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Electronics & Telecomm">Electronics & Telecomm</option>
                  <option value="Blockchain Technology">Blockchain Technology</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Academic Semester</label>
                <select
                  className="select-field"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  disabled={isProcessing}
                >
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                  <option value="Semester 5">Semester 5 (Current)</option>
                  <option value="Semester 6">Semester 6</option>
                  <option value="Semester 7">Semester 7</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Category</label>
              <select
                className="select-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isProcessing}
              >
                <option value="Semester Tuition Fee">Semester Tuition Fee (Regular)</option>
                <option value="Examination & Lab Fee">Examination & Lab Fee</option>
                <option value="Library & Infrastructure Fee">Library & Infrastructure Fee</option>
              </select>
            </div>

            {/* Fee Breakdown Card */}
            <div className="fee-summary-box">
              <div className="fee-row">
                <span>Tuition Fee (Smart Contract Requirement)</span>
                <span className="mono" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                  {feeEth} ETH
                </span>
              </div>
              <div className="fee-row">
                <span>Estimated Blockchain Gas Fee</span>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>
                  ~0.00042 ETH
                </span>
              </div>
              <div className="fee-row total">
                <span>Total Amount to Transact</span>
                <span className="mono gradient-text">
                  {feeEth} ETH
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={20} className="status-dot pulse" />
                  <span>{txStep || 'Processing Transaction...'}</span>
                </>
              ) : (
                <>
                  <Zap size={20} />
                  <span>
                    {isDemoMode ? 'Pay Fee in Demo Mode' : 'Pay Fee with MetaMask'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Side Information Card / Instructions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#06b6d4" />
            <span>How On-Chain Fee Works</span>
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <li style={{ display: 'flex', gap: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                1
              </div>
              <div>
                <strong>Checks Verification:</strong> The smart contract checks that you send exactly <code>{feeEth} ETH</code> and haven't already paid.
              </div>
            </li>
            <li style={{ display: 'flex', gap: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                2
              </div>
              <div>
                <strong>State Update (Effects):</strong> Your payment record and timestamp are permanently written to contract storage.
              </div>
            </li>
            <li style={{ display: 'flex', gap: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                3
              </div>
              <div>
                <strong>Treasury Forward (Interactions):</strong> Ether is immediately forwarded to the College Treasury Account.
              </div>
            </li>
            <li style={{ display: 'flex', gap: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                4
              </div>
              <div>
                <strong>Digital Receipt:</strong> A tamper-proof receipt is issued with your transaction hash and block confirmation.
              </div>
            </li>
          </ul>
        </div>

        {/* Security Alert / CEI Pattern Explainer */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <h5 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#10b981', marginBottom: '6px' }}>
            CEI Pattern (Reentrancy Protection)
          </h5>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Unlike standard contracts where transfer precedes state update, this contract registers <code>records[msg.sender]</code> before dispatching funds via <code>.call</code>, eliminating reentrancy vulnerabilities.
          </p>
        </div>
      </div>
    </div>
  );
}
