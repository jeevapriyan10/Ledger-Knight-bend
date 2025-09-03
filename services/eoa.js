const { JsonRpcProvider, parseEther, Wallet } = require('ethers');
const Institution = require('../models/Institution');
const { decrypt } = require('./crypto');

const provider = new JsonRpcProvider(process.env.ETH_RPC_URL);

async function getInstitutionBalance(institutionId) {
  const inst = await Institution.findById(institutionId).lean();
  const addr = inst?.walletAddress;
  if (!addr) return '0';
  const bal = await provider.getBalance(addr);
  return (Number(bal) / 1e18).toString(); // simple toString ETH
}

async function sendFromInstitution(institutionId, to, amountEth) {
  const inst = await Institution.findById(institutionId).lean();
  if (!inst?.walletKeyEnc || !inst.walletAddress) throw new Error('Institution wallet not configured');
  const pk = decrypt(inst.walletKeyEnc);
  const wallet = new Wallet(pk, provider);
  if (wallet.address.toLowerCase() !== inst.walletAddress.toLowerCase()) {
    throw new Error('Wallet key/address mismatch');
  }
  const tx = await wallet.sendTransaction({ to, value: parseEther(String(amountEth)) });
  const rec = await tx.wait();
  return rec?.hash || tx.hash;
}

module.exports = { provider, getInstitutionBalance, sendFromInstitution };
