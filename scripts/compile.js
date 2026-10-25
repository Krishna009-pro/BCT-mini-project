import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractPath = path.resolve(__dirname, '../contracts/CollegeFeePayment.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'CollegeFeePayment.sol': {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode'],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  output.errors.forEach((err) => {
    console.error(err.formattedMessage);
  });
  const hasFatal = output.errors.some((e) => e.severity === 'error');
  if (hasFatal) {
    process.exit(1);
  }
}

const contract = output.contracts['CollegeFeePayment.sol']['CollegeFeePayment'];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

console.log('✓ Compiled CollegeFeePayment.sol successfully!');
console.log('Bytecode length:', bytecode.length);

const outData = {
  abi,
  bytecode: '0x' + bytecode,
};

fs.writeFileSync(
  path.resolve(__dirname, '../src/compiledContract.json'),
  JSON.stringify(outData, null, 2)
);

console.log('✓ Saved src/compiledContract.json');
