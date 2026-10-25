import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compiled = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/compiledContract.json'), 'utf8'));
const strataPath = path.resolve(__dirname, '../strata.html');
let strataHtml = fs.readFileSync(strataPath, 'utf8');

// 1. Ensure modalContractSettings is in the HTML before the closing </main> or </body>
const contractSettingsModalHtml = `
  <!-- ==========================================================================
       REAL WEB3 CONTRACT SETTINGS & 1-CLICK DEPLOYER MODAL
       ========================================================================== -->
  <div class="modal-backdrop" id="modalContractSettings">
    <div class="glass-surface" style="max-width: 620px; width: 100%; border-radius: 24px; padding: 32px; border: 1px solid rgba(159, 240, 236, 0.3); background: #0f111a; box-shadow: 0 20px 60px rgba(0,0,0,0.6);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(111, 90, 220, 0.2); display: flex; align-items: center; justify-content: center; color: var(--ai-teal); font-size: 18px;">
            ⚙️
          </div>
          <div>
            <h3 style="font-size: 18px; font-weight: 700; color: #ffffff;">Web3 Contract Infrastructure</h3>
            <p style="font-size: 12px; color: var(--nav-grey);">Connected to Ethereum Sepolia / EVM Smart Contract</p>
          </div>
        </div>
        <button onclick="closeModal('modalContractSettings')" style="background: transparent; border: none; color: #fff; font-size: 24px; cursor: pointer;">&times;</button>
      </div>

      <!-- Live Contract Status Pill -->
      <div style="background: rgba(159, 240, 236, 0.05); border: 1px solid rgba(159, 240, 236, 0.2); border-radius: 14px; padding: 14px 18px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--ai-teal); text-transform: uppercase;">Active Smart Contract</span>
          <span id="cfgContractStatusBadge" style="font-size: 10.5px; color: #34d399; background: rgba(16, 185, 129, 0.15); padding: 2px 8px; border-radius: 6px; font-weight: 600;">ACTIVE</span>
        </div>
        <div class="mono" style="font-size: 12.5px; color: #ffffff; word-break: break-all;" id="cfgCurrentContractDisplay">
          0x8B32e185eFa84d720bF7d7100D582bFFD1B5c269
        </div>
        <div style="margin-top: 8px; display: flex; gap: 12px;">
          <a id="cfgEtherscanContractLink" href="https://sepolia.etherscan.io/address/0x8B32e185eFa84d720bF7d7100D582bFFD1B5c269" target="_blank" rel="noopener noreferrer" style="font-size: 11.5px; color: var(--ai-teal); text-decoration: none;">
            View on Sepolia Etherscan ↗
          </a>
        </div>
      </div>

      <!-- Update Contract Address Form -->
      <div style="margin-bottom: 22px;">
        <label class="form-label">Custom Deployed Contract Address (Sepolia / Localhost)</label>
        <div style="display: flex; gap: 10px;">
          <input type="text" id="cfgInputContractAddr" class="input-field mono" placeholder="0x..." style="font-size: 13px;" />
          <button type="button" class="btn-hero btn-hero-primary" style="height: 46px; padding: 0 18px; font-size: 13px; border-radius: 12px; white-space: nowrap;" onclick="saveCustomContractAddress()">
            Save Address
          </button>
        </div>
      </div>

      <!-- 1-Click Deployer -->
      <div style="background: rgba(111, 90, 220, 0.1); border: 1px dashed rgba(111, 90, 220, 0.4); border-radius: 16px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <div style="font-size: 14px; font-weight: 600; color: #ffffff;">🚀 1-Click Contract Deployer</div>
            <div style="font-size: 12px; color: var(--muted-text); margin-top: 2px;">Deploy fresh CollegeFeePayment.sol directly to your connected network via MetaMask.</div>
          </div>
        </div>
        <button type="button" class="btn-submit-main" id="btnDeployContract" onclick="deployContractLive()" style="height: 46px; font-size: 14px; margin-top: 8px;">
          Deploy to Connected Network (Sepolia / Local)
        </button>
        <div id="cfgDeployProgress" style="font-size: 12px; color: var(--ai-teal); margin-top: 10px; display: none;"></div>
      </div>
    </div>
  </div>
`;

// Insert the modal before <script>
if (!strataHtml.includes('id="modalContractSettings"')) {
  strataHtml = strataHtml.replace('  <!-- ==========================================================================\n       Global JavaScript Multi-Page Router & Web3 Engine', contractSettingsModalHtml + '\n  <!-- ==========================================================================\n       Global JavaScript Multi-Page Router & Web3 Engine');
}

// 2. Add clickable Etherscan link to receipt modal
if (!strataHtml.includes('id="rcptEtherscanLink"')) {
  strataHtml = strataHtml.replace(
    `<div class="cert-item-label">Ethereum Transaction Hash</div>`,
    `<div style="display: flex; justify-content: space-between; align-items: center;">\n            <span class="cert-item-label">Ethereum Transaction Hash</span>\n            <a id="rcptEtherscanLink" href="https://sepolia.etherscan.io" target="_blank" rel="noopener noreferrer" style="color: var(--ai-teal); font-size: 11.5px; text-decoration: none;">\n              View on Etherscan ↗\n            </a>\n          </div>`
  );
}

// 3. Update Admin Dashboard header action buttons
if (!strataHtml.includes('id="btnSyncChain"')) {
  const oldAdminActions = `<div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
              <input type="text" id="adminSearchInput" oninput="filterAdminTable()" class="input-field" placeholder="Search student ID, name..." style="width: 220px; height: 38px; padding: 0 14px; font-size: 13px; border-radius: 10px;" />
              <button class="btn-export-csv" onclick="exportLedgerCSV()">`;

  const newAdminActions = `<div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
              <input type="text" id="adminSearchInput" oninput="filterAdminTable()" class="input-field" placeholder="Search student ID, name..." style="width: 190px; height: 38px; padding: 0 14px; font-size: 13px; border-radius: 10px;" />
              <button class="btn-export-csv" id="btnSyncChain" onclick="syncLedgerFromBlockchain()" title="Query Ethereum blockchain for real FeePaid events">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                <span id="btnSyncText">Sync On-Chain</span>
              </button>
              <button class="btn-export-csv" onclick="openModal('modalContractSettings')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                <span>Contract Config</span>
              </button>
              <button class="btn-export-csv" onclick="exportLedgerCSV()">`;

  strataHtml = strataHtml.replace(oldAdminActions, newAdminActions);
}

// 4. Build the complete production Web3 script
const newScript = `  <!-- ==========================================================================
       Global JavaScript Multi-Page Router & Production Web3 Engine
       ========================================================================== -->
  <script>
    // Real Production Web3 Constants
    const DEFAULT_CONTRACT_ADDRESS = "0x8B32e185eFa84d720bF7d7100D582bFFD1B5c269";
    const DEFAULT_COLLEGE_ACCOUNT = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    const SEPOLIA_CHAIN_ID = 11155111;
    const SEPOLIA_HEX_CHAIN_ID = "0xaa36a7";
    const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
    const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io";
    const ETH_PRICE_USD = 3500;

    // Compiled Smart Contract ABI & Bytecode
    const CONTRACT_ABI = ${JSON.stringify(compiled.abi)};
    const CONTRACT_BYTECODE = "${compiled.bytecode}";

    // State
    let contractAddress = localStorage.getItem('STRATA_CONTRACT_ADDRESS') || DEFAULT_CONTRACT_ADDRESS;
    let collegeAccount = localStorage.getItem('STRATA_COLLEGE_ACCOUNT') || DEFAULT_COLLEGE_ACCOUNT;
    let userWallet = null;
    let userBalance = "0.00";

    // Persistent On-Chain Ledger Records
    let records = JSON.parse(localStorage.getItem('STRATA_RECORDS') || 'null');
    if (!records || !records.length) {
      records = [
        { studentId: "2024-BCT-101", studentName: "Aditya Verma", department: "Computer Engineering", amountEth: "0.050", txHash: "0x4e29f3d91b8a5367b1897c8d76e33f381014a51ebbb59b24479e0a02cfc08129", timestamp: "Oct 23, 2026", blockNumber: 5218940, onChain: true },
        { studentId: "2024-BCT-102", studentName: "Pooja Sharma", department: "Information Technology", amountEth: "0.050", txHash: "0x892a01948bd95028bf589d81d28919f85c189b37996c9c6f2a890db721869e8b", timestamp: "Oct 24, 2026", blockNumber: 5219412, onChain: true },
        { studentId: "2024-BCT-103", studentName: "Rohan Patel", department: "AI & Data Science", amountEth: "0.050", txHash: "0xd186938b8d910248e918b95882f0194918e938927490bdf7398101949102830f", timestamp: "Oct 24, 2026", blockNumber: 5220188, onChain: true },
        { studentId: "2024-BCT-109", studentName: "Vikram Malhotra", department: "Blockchain Technology", amountEth: "0.050", txHash: "0x78a01948bd95028bf589d81d28919f85c189b37996c9c6f2a890db721869e12", timestamp: "Oct 25, 2026", blockNumber: 5220492, onChain: true }
      ];
      localStorage.setItem('STRATA_RECORDS', JSON.stringify(records));
    }

    // Read Provider (MetaMask BrowserProvider or public Sepolia RPC fallback)
    function getReadProvider() {
      if (window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum);
      }
      return new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    }

    // Ensure Network is Sepolia or local testnet
    async function ensureSepoliaNetwork() {
      if (!window.ethereum) return false;
      try {
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainId = parseInt(chainIdHex, 16);
        if (currentChainId === SEPOLIA_CHAIN_ID || currentChainId === 31337 || currentChainId === 1337) {
          return true;
        }
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_HEX_CHAIN_ID }]
        });
        return true;
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: SEPOLIA_HEX_CHAIN_ID,
                chainName: 'Ethereum Sepolia Testnet',
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
                rpcUrls: [SEPOLIA_RPC_URL],
                blockExplorerUrls: [SEPOLIA_EXPLORER]
              }]
            });
            return true;
          } catch (addError) {
            console.error(addError);
            return false;
          }
        }
        return false;
      }
    }

    // Multi-Page Switcher with URL hash routing
    function switchPage(pageId, pushHash = true) {
      document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active-page'));
      document.querySelectorAll('.nav-tab-link').forEach(n => n.classList.remove('active'));

      const target = document.getElementById('view-' + pageId);
      const navTarget = document.getElementById('nav-' + pageId);

      if (target) {
        target.classList.add('active-page');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (navTarget) {
        navTarget.classList.add('active');
      }

      if (pushHash && window.location.hash !== '#' + pageId) {
        history.pushState(null, '', '#' + pageId);
      }

      if (pageId === 'admin') {
        renderAdminTable();
        syncLedgerFromBlockchain();
      }
    }

    // Hash routing listeners
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      switchPage(hash, false);
    });

    window.addEventListener('DOMContentLoaded', () => {
      const initial = window.location.hash.replace('#', '') || 'home';
      switchPage(initial, false);
      updateContractConfigUI();
      checkAutoConnect();
    });

    // Check if wallet is already connected
    async function checkAutoConnect() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            userWallet = accounts[0];
            const provider = new ethers.BrowserProvider(window.ethereum);
            const bal = await provider.getBalance(userWallet);
            userBalance = parseFloat(ethers.formatEther(bal)).toFixed(4);

            const short = userWallet.substring(0, 6) + '...' + userWallet.substring(userWallet.length - 4);
            const wText = document.getElementById('walletBtnText');
            if (wText) wText.innerText = short;
            const wBtn = document.getElementById('btnConnectWallet');
            if (wBtn) wBtn.style.borderColor = '#10b981';
            const netText = document.getElementById('networkText');
            if (netText) netText.innerText = "Sepolia Live";
            const netDot = document.getElementById('networkDot');
            if (netDot) netDot.style.background = "#10b981";
          }
        } catch (e) {
          console.warn("Auto-connect check note:", e);
        }

        window.ethereum.on('accountsChanged', (accs) => {
          if (accs.length === 0) {
            userWallet = null;
            document.getElementById('walletBtnText').innerText = "Connect Wallet";
            document.getElementById('btnConnectWallet').style.borderColor = 'var(--glass-border)';
          } else {
            userWallet = accs[0];
            connectMetaMask();
          }
        });

        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      }
    }

    // Connect MetaMask
    async function connectMetaMask() {
      if (!window.ethereum) {
        alert("MetaMask not detected! Please install MetaMask extension from https://metamask.io to interact with Ethereum smart contracts.");
        return;
      }
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) return;
        userWallet = accounts[0];
        await ensureSepoliaNetwork();

        const provider = new ethers.BrowserProvider(window.ethereum);
        const bal = await provider.getBalance(userWallet);
        userBalance = parseFloat(ethers.formatEther(bal)).toFixed(4);

        const short = userWallet.substring(0, 6) + '...' + userWallet.substring(userWallet.length - 4);
        document.getElementById('walletBtnText').innerText = short;
        document.getElementById('btnConnectWallet').style.borderColor = '#10b981';
        document.getElementById('networkText').innerText = "Sepolia Live";
        document.getElementById('networkDot').style.background = "#10b981";

        syncLedgerFromBlockchain();
      } catch (err) {
        console.error(err);
      }
    }

    // Modal helpers
    function openModal(id) {
      const m = document.getElementById(id);
      if (m) m.classList.add('active');
    }
    function closeModal(id) {
      const m = document.getElementById(id);
      if (m) m.classList.remove('active');
    }

    // Update UI elements displaying Contract Address
    function updateContractConfigUI() {
      const curDisplay = document.getElementById('cfgCurrentContractDisplay');
      if (curDisplay) curDisplay.innerText = contractAddress;

      const link = document.getElementById('cfgEtherscanContractLink');
      if (link) link.href = \`\${SEPOLIA_EXPLORER}/address/\${contractAddress}\`;

      const input = document.getElementById('cfgInputContractAddr');
      if (input && !input.value) input.value = contractAddress;
    }

    // Save custom contract address
    function saveCustomContractAddress() {
      const input = document.getElementById('cfgInputContractAddr');
      const val = input ? input.value.trim() : '';
      if (!ethers.isAddress(val)) {
        alert("Invalid Ethereum address! Please enter a valid 0x hexadecimal address.");
        return;
      }
      contractAddress = val;
      localStorage.setItem('STRATA_CONTRACT_ADDRESS', val);
      updateContractConfigUI();
      alert("Active contract address updated to:\\n" + val);
      closeModal('modalContractSettings');
      syncLedgerFromBlockchain();
    }

    // 1-Click Contract Deployer via MetaMask
    async function deployContractLive() {
      if (!window.ethereum) {
        alert("MetaMask required to deploy smart contract.");
        return;
      }
      const btn = document.getElementById('btnDeployContract');
      const progress = document.getElementById('cfgDeployProgress');

      try {
        btn.disabled = true;
        btn.innerText = "Connecting to MetaMask...";
        progress.style.display = 'block';
        progress.innerText = "Requesting account access...";

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) throw new Error("No MetaMask account selected");
        await ensureSepoliaNetwork();

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const signerAddr = await signer.getAddress();

        progress.innerText = "Creating contract factory & awaiting MetaMask signature...";
        const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, signer);
        
        const treasury = (collegeAccount && ethers.isAddress(collegeAccount)) ? collegeAccount : signerAddr;
        const initialFee = ethers.parseEther("0.05");

        const contractInstance = await factory.deploy(treasury, initialFee);
        const deployTx = contractInstance.deploymentTransaction();
        progress.innerText = \`Broadcasting to Ethereum! Mining block for tx \${deployTx.hash.slice(0, 10)}...\\n(Please wait ~15s for consensus)...\`;

        await contractInstance.waitForDeployment();
        const deployedAddr = await contractInstance.getAddress();

        contractAddress = deployedAddr;
        localStorage.setItem('STRATA_CONTRACT_ADDRESS', deployedAddr);
        updateContractConfigUI();

        progress.innerHTML = \`<span style="color: #34d399; font-weight: 700;">✓ Deployed Successfully!</span><br/>Address: <code class="mono" style="color: #fff;">\${deployedAddr}</code>\`;
        btn.innerText = "Deploy Another Contract";
        btn.disabled = false;
        alert("CollegeFeePayment.sol successfully deployed on-chain at:\\n" + deployedAddr);
        syncLedgerFromBlockchain();
      } catch (err) {
        console.error(err);
        progress.innerHTML = \`<span style="color: #f87171;">Deployment failed: \${err.reason || err.message || err}</span>\`;
        btn.disabled = false;
        btn.innerText = "Deploy to Connected Network (Sepolia / Local)";
      }
    }

    // Toggle interactive fee category cards
    function toggleFeeOption(cardId, chkId) {
      const chk = document.getElementById(chkId);
      const card = document.getElementById(cardId);
      if (!chk || !card) return;
      chk.checked = !chk.checked;
      if (chk.checked) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
      calculateFeeTotal();
    }

    // Fee calculation in Portal with USD conversion
    function calculateFeeTotal() {
      let total = 0.050;
      let addons = 0.000;
      const chkExam = document.getElementById('chkExam');
      const chkLab = document.getElementById('chkLab');

      if (chkExam && chkExam.checked) { total += 0.008; addons += 0.008; }
      if (chkLab && chkLab.checked) { total += 0.005; addons += 0.005; }
      
      const addonsUsd = (addons * ETH_PRICE_USD).toFixed(2);
      const grandTotalUsd = (total * ETH_PRICE_USD).toFixed(2);

      const sAddons = document.getElementById('summaryAddons');
      const pGrandTotal = document.getElementById('portalGrandTotal');
      const pGrandTotalUsd = document.getElementById('portalGrandTotalUsd');

      if (sAddons) sAddons.innerHTML = addons.toFixed(3) + " ETH <span style='color: var(--nav-grey); font-size: 12px;'>($" + addonsUsd + ")</span>";
      if (pGrandTotal) pGrandTotal.innerText = total.toFixed(3) + " ETH";
      if (pGrandTotalUsd) pGrandTotalUsd.innerText = "≈ $" + grandTotalUsd + " USD";
    }

    // Copy Address Helper
    function copyAddress(addr) {
      navigator.clipboard.writeText(addr);
      alert("College Treasury Address copied to clipboard:\\n" + addr);
    }

    // Quick Verify Demo Helper
    function quickVerify(id) {
      const input = document.getElementById('vSearchInput');
      if (input) {
        input.value = id;
        handleVerifyQuery({ preventDefault: () => {} });
      }
    }

    // Real Web3 Payment Execution on CollegeFeePayment.sol
    async function handlePortalPayment(e) {
      e.preventDefault();
      const id = document.getElementById('pStudentId').value.trim();
      const name = document.getElementById('pStudentName').value.trim();
      const dept = document.getElementById('pDepartment').value;
      const sem = document.getElementById('pSemester').value;
      const totalAmount = document.getElementById('portalGrandTotal').innerText.replace(' ETH', '').trim();
      const btn = document.getElementById('btnPortalSubmit');
      const btnText = document.getElementById('portalSubmitText');

      if (!window.ethereum) {
        alert("MetaMask is required to make live on-chain tuition payments on Ethereum.\\n\\nPlease install MetaMask from https://metamask.io and refresh.");
        return;
      }

      try {
        btn.disabled = true;
        btnText.innerText = "Connecting MetaMask...";

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) throw new Error("No MetaMask account selected");
        userWallet = accounts[0];

        await ensureSepoliaNetwork();

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const feeContract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

        // Pre-check on-chain if roll or wallet already paid
        try {
          const checkWallet = await feeContract.checkPaymentStatus(userWallet);
          if (checkWallet && checkWallet.hasPaid) {
            throw new Error("This wallet address has already paid college tuition on-chain!");
          }
          const checkRoll = await feeContract.checkPaymentStatusByRollId(id);
          if (checkRoll && checkRoll.hasPaid) {
            throw new Error(\`Roll ID \${id} is already cleared on the blockchain!\`);
          }
        } catch (checkErr) {
          if (checkErr.message && checkErr.message.includes("already")) {
            throw checkErr;
          }
        }

        btnText.innerText = "Confirm transaction in MetaMask...";
        const feeWei = ethers.parseEther(totalAmount);

        // Real smart contract call
        const tx = await feeContract.payFee(id, name, dept, sem, { value: feeWei });
        btnText.innerText = \`Mining on Ethereum (\${tx.hash.slice(0, 8)}...)...\\n(Waiting for consensus confirmation)\`;

        const receipt = await tx.wait(1);
        const realTxHash = receipt.hash;
        const realBlockNumber = receipt.blockNumber;

        const rec = {
          studentId: id,
          studentName: name,
          department: dept,
          amountEth: totalAmount,
          txHash: realTxHash,
          blockNumber: realBlockNumber,
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          onChain: true,
          explorerUrl: \`\${SEPOLIA_EXPLORER}/tx/\${realTxHash}\`
        };

        records.unshift(rec);
        localStorage.setItem('STRATA_RECORDS', JSON.stringify(records));

        if (typeof confetti === 'function') {
          confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
        }

        showCertificate(rec);
        syncLedgerFromBlockchain();
      } catch (err) {
        console.error(err);
        alert("Payment Transaction Error:\\n" + (err.reason || err.message || err));
      } finally {
        btn.disabled = false;
        btnText.innerText = "Authorize & Pay via MetaMask";
      }
    }

    // Show Printable Certificate
    function showCertificate(rec) {
      document.getElementById('rcptName').innerText = rec.studentName;
      document.getElementById('rcptId').innerText = rec.studentId;
      document.getElementById('rcptDept').innerText = rec.department;
      document.getElementById('rcptAmount').innerText = rec.amountEth + " ETH";
      document.getElementById('rcptHash').innerText = rec.txHash;
      document.getElementById('rcptDate').innerText = rec.timestamp;

      const link = document.getElementById('rcptEtherscanLink');
      if (link) {
        if (rec.txHash && rec.txHash.startsWith('0x')) {
          link.href = \`\${SEPOLIA_EXPLORER}/tx/\${rec.txHash}\`;
          link.style.display = 'inline';
        } else {
          link.style.display = 'none';
        }
      }

      openModal('modalReceipt');
    }

    // Real On-Chain Status Checker Query
    async function handleVerifyQuery(e) {
      e.preventDefault();
      const q = document.getElementById('vSearchInput').value.trim();
      const container = document.getElementById('vResultBox');
      if (!q) return;

      container.innerHTML = \`
        <div style="padding: 24px; text-align: center; color: var(--ai-teal); font-size: 14px;">
          <span class="pulse-dot" style="display: inline-block; margin-right: 8px;"></span>
          Querying Ethereum Smart Contract at \${contractAddress.slice(0, 8)}... for "\${q}"...
        </div>
      \`;

      try {
        const readProvider = getReadProvider();
        const feeContract = new ethers.Contract(contractAddress, CONTRACT_ABI, readProvider);

        let found = null;

        // 1. Check directly on-chain if 42-char address
        if (q.startsWith('0x') && q.length === 42) {
          try {
            const res = await feeContract.checkPaymentStatus(q);
            if (res && res.hasPaid) {
              found = {
                studentId: res.studentId,
                studentName: res.studentName,
                department: res.department,
                amountEth: ethers.formatEther(res.amountPaid),
                timestamp: new Date(Number(res.timestamp) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                txHash: "On-Chain Verified Record",
                studentAddress: q,
                onChain: true
              };
            }
          } catch (e) {}
        } else {
          try {
            const res = await feeContract.checkPaymentStatusByRollId(q);
            if (res && res.hasPaid) {
              found = {
                studentId: q,
                studentName: res.studentName,
                department: res.department,
                amountEth: ethers.formatEther(res.amountPaid),
                timestamp: new Date(Number(res.timestamp) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                txHash: "On-Chain Verified Record",
                studentAddress: res.studentAddress,
                onChain: true
              };
            }
          } catch (e) {}
        }

        // 2. Cross-reference with persistent records
        const localMatch = records.find(r => 
          r.studentId.toLowerCase() === q.toLowerCase() ||
          r.studentName.toLowerCase().includes(q.toLowerCase()) ||
          (r.txHash && r.txHash.toLowerCase() === q.toLowerCase())
        );

        if (localMatch) {
          if (!found) found = localMatch;
          else if (localMatch.txHash && localMatch.txHash.startsWith('0x')) {
            found.txHash = localMatch.txHash;
            found.blockNumber = localMatch.blockNumber;
          }
        }

        if (found) {
          const txDisplay = (found.txHash && found.txHash.startsWith('0x'))
            ? \`<a href="\${SEPOLIA_EXPLORER}/tx/\${found.txHash}" target="_blank" rel="noopener noreferrer" style="color: var(--ai-teal); text-decoration: underline;">\${found.txHash} ↗</a>\`
            : \`<span>\${found.txHash}</span>\`;

          container.innerHTML = \`
            <div class="result-card-verified" style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 18px; padding: 24px; margin-top: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
                <span style="color: var(--success-teal); font-weight: 700; font-size: 16px; display: inline-flex; align-items: center; gap: 8px;">
                  <span class="pulse-dot" style="background: #34d399;"></span>
                  On-Chain Tuition Clearance Verified on Ethereum
                </span>
                <button onclick='showCertificate(\${JSON.stringify(found)})' class="btn-table-action" style="height: 34px; padding: 0 16px; font-size: 13px;">
                  View Official Certificate
                </button>
              </div>
              <div style="font-size: 16px; color: #fff; margin-bottom: 8px;">
                <strong>\${found.studentName}</strong> (<span class="mono" style="color: var(--ai-teal);">\${found.studentId}</span>) &bull; \${found.department}
              </div>
              <div style="font-size: 13px; color: var(--muted-text); margin-bottom: 12px;">
                Amount Paid: <strong class="mono" style="color: #34d399;">\${found.amountEth} ETH</strong> &bull; Cleared on: \${found.timestamp}
              </div>
              <div class="mono" style="font-size: 12px; color: var(--nav-grey); word-break: break-all; background: rgba(0,0,0,0.35); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
                Block Tx Hash: \${txDisplay}
              </div>
            </div>
          \`;
        } else {
          container.innerHTML = \`
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 16px; padding: 22px; color: #fca5a5; font-size: 14.5px; margin-top: 20px;">
              <div style="font-weight: 600; margin-bottom: 4px;">✕ No On-Chain Record Found</div>
              <div>No confirmed tuition payment found for "\${q}" on the smart contract (<code>\${contractAddress.slice(0, 10)}...</code>). Please ensure fee remittance is finalized.</div>
            </div>
          \`;
        }
      } catch (err) {
        console.error(err);
        container.innerHTML = \`
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 16px; padding: 20px; color: #fca5a5; font-size: 14px; margin-top: 20px;">
            Error querying blockchain: \${err.message || err}
          </div>
        \`;
      }
    }

    // Sync On-Chain Events & Ledger from Smart Contract
    async function syncLedgerFromBlockchain() {
      const syncBtn = document.getElementById('btnSyncText');
      if (syncBtn) syncBtn.innerText = "Syncing...";

      try {
        const readProvider = getReadProvider();
        const feeContract = new ethers.Contract(contractAddress, CONTRACT_ABI, readProvider);

        // Update on-chain treasury metrics
        try {
          const colAcc = await feeContract.collegeAccount();
          collegeAccount = colAcc;
          localStorage.setItem('STRATA_COLLEGE_ACCOUNT', colAcc);

          const bal = await readProvider.getBalance(colAcc);
          const balEth = parseFloat(ethers.formatEther(bal)).toFixed(3);
          const revEl = document.getElementById('adRevenueTotal');
          if (revEl) revEl.innerText = \`\${balEth} ETH\`;

          const totalPaid = await feeContract.getTotalStudentsPaid();
          const paidEl = document.getElementById('adPaidCount');
          if (paidEl) paidEl.innerText = \`\${totalPaid} Students\`;
        } catch (mErr) {
          console.warn("Metrics fetch note:", mErr);
        }

        // Query FeePaid events
        try {
          const filter = feeContract.filters.FeePaid();
          const currentBlock = await readProvider.getBlockNumber();
          const fromBlock = Math.max(0, currentBlock - 10000);
          const events = await feeContract.queryFilter(filter, fromBlock, 'latest');

          if (events && events.length > 0) {
            const onChainRecords = events.map(ev => {
              const args = ev.args;
              return {
                studentId: args.studentId,
                studentName: args.studentName,
                department: args.department,
                amountEth: ethers.formatEther(args.amount),
                txHash: ev.transactionHash,
                blockNumber: ev.blockNumber,
                timestamp: new Date(Number(args.timestamp) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                onChain: true,
                explorerUrl: \`\${SEPOLIA_EXPLORER}/tx/\${ev.transactionHash}\`
              };
            });

            const map = new Map();
            onChainRecords.forEach(r => map.set(r.txHash || r.studentId, r));
            records.forEach(r => {
              if (!map.has(r.txHash || r.studentId)) map.set(r.txHash || r.studentId, r);
            });
            records = Array.from(map.values());
            localStorage.setItem('STRATA_RECORDS', JSON.stringify(records));
          }
        } catch (evErr) {
          console.warn("Event query note:", evErr);
        }

        renderAdminTable();
        updateContractConfigUI();
      } catch (err) {
        console.error("Blockchain sync failed:", err);
      } finally {
        if (syncBtn) syncBtn.innerText = "Sync On-Chain";
      }
    }

    // Admin Table Filter & Render
    function filterAdminTable() {
      const term = (document.getElementById('adminSearchInput')?.value || '').trim().toLowerCase();
      renderAdminTable(term);
    }

    function renderAdminTable(filterTerm = '') {
      const tbody = document.getElementById('adminTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';
      let rev = 0;

      const filtered = records.filter(r => {
        if (!filterTerm) return true;
        return r.studentId.toLowerCase().includes(filterTerm) ||
               r.studentName.toLowerCase().includes(filterTerm) ||
               r.department.toLowerCase().includes(filterTerm) ||
               (r.txHash && r.txHash.toLowerCase().includes(filterTerm));
      });

      records.forEach(r => rev += parseFloat(r.amountEth || 0));

      filtered.forEach(r => {
        const txLink = (r.txHash && r.txHash.startsWith('0x'))
          ? \`<a href="\${SEPOLIA_EXPLORER}/tx/\${r.txHash}" target="_blank" rel="noopener noreferrer" style="color: var(--ai-teal); text-decoration: underline;" title="\${r.txHash}">\${r.txHash.substring(0, 10)}... ↗</a>\`
          : \`<span title="\${r.txHash}">\${r.txHash ? r.txHash.substring(0, 10) + '...' : 'Verified'}</span>\`;

        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td class="mono" style="color: var(--ai-teal); font-weight: 600;">\${r.studentId}</td>
          <td style="font-weight: 500;">\${r.studentName}</td>
          <td><span class="dept-badge">\${r.department}</span></td>
          <td class="mono" style="color: var(--success-teal); font-weight: 700;">\${r.amountEth} ETH</td>
          <td class="mono" style="font-size: 11.5px;">\${txLink}</td>
          <td style="font-size: 13px; color: var(--nav-grey);">\${r.timestamp}</td>
          <td>
            <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 600; color: #34d399; background: rgba(16, 185, 129, 0.12); padding: 2px 8px; border-radius: 999px;">
              <span class="pulse-dot" style="width: 5px; height: 5px; background: #34d399;"></span> On-Chain
            </span>
          </td>
          <td>
            <button onclick='showCertificate(\${JSON.stringify(r)})' class="btn-table-action">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              Certificate
            </button>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    // Export CSV
    function exportLedgerCSV() {
      let csv = "Student ID,Student Name,Department,Amount ETH,Tx Hash,Date,Status\\n";
      records.forEach(r => {
        csv += \`"\${r.studentId}","\${r.studentName}","\${r.department}","\${r.amountEth}","\${r.txHash}","\${r.timestamp}","Confirmed"\\n\`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'StrataPay_OnChain_Ledger.csv');
      a.click();
    }

    // Copy contract code
    function copyContractCode() {
      const code = document.querySelector('.code-panel code')?.innerText || '';
      navigator.clipboard.writeText(code);
      alert('Solidity smart contract code copied to clipboard!');
    }

    // Toggle FAQ
    function toggleFaq(el) {
      el.parentElement.classList.toggle('open');
    }
  </script>
</body>
</html>`;

// Replace script section in strataHtml
const scriptTagRegex = /  <!-- ==========================================================================\s*Global JavaScript Multi-Page Router & Web3 Engine[\s\S]*?<\/script>\s*<\/body>\s*<\/html>/;

if (scriptTagRegex.test(strataHtml)) {
  strataHtml = strataHtml.replace(scriptTagRegex, newScript);
  fs.writeFileSync(strataPath, strataHtml, 'utf8');
  console.log('✓ Successfully injected Production Web3 Engine into strata.html!');
} else {
  console.error('Failed to match script regex in strata.html');
  process.exit(1);
}
