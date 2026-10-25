import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compiled = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/compiledContract.json'), 'utf8'));
const contractSol = fs.readFileSync(path.resolve(__dirname, '../contracts/CollegeFeePayment.sol'), 'utf8');
const originalSol = fs.readFileSync(path.resolve(__dirname, '../contracts/CollegeFeePaymentOriginal.sol'), 'utf8');

const content = `// Real Production-Ready Web3 Configuration for CollegeFeePayment
// Generated automatically from contracts/CollegeFeePayment.sol

export const DEFAULT_CONTRACT_ADDRESS = "0x8B32E185EfA84d720bf7D7100d582bffD1b5C269";
export const DEFAULT_COLLEGE_ACCOUNT = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
export const DEFAULT_FEE_ETH = "0.05";
export const DEFAULT_FEE_WEI = "50000000000000000"; // 0.05 ETH in Wei

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_HEX_CHAIN_ID = "0xaa36a7";
export const SEPOLIA_RPC_URLS = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://rpc.sepolia.org",
  "https://sepolia.drpc.org"
];
export const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io";

export const CONTRACT_ABI = ${JSON.stringify(compiled.abi, null, 2)};

export const CONTRACT_BYTECODE = "${compiled.bytecode}";

export const SOLIDITY_CODE_ENHANCED = ${JSON.stringify(contractSol)};

export const SOLIDITY_CODE_ORIGINAL = ${JSON.stringify(originalSol)};

// Real on-chain payments ledger initialized empty (populated exclusively by verified smart contract transactions)
export const INITIAL_MOCK_PAYMENTS = [];
`;

fs.writeFileSync(path.resolve(__dirname, '../src/contractData.js'), content, 'utf8');
console.log('✓ Successfully updated src/contractData.js with real compiled ABI & Bytecode!');
