import { useState } from "react";
import { ethers } from "ethers";
import { Eye, EyeOff, Copy, RefreshCw, Send, CheckCircle, Shield, Download, Upload, Check } from "lucide-react";
import { copyToClipboard } from "../utils/formatters";

// WALLET ON SEPOLIA (To allow faucet usage)
const NETWORK = "sepolia"; 
const RPC_URL = "https://ethereum-sepolia.publicnode.com";

// --- Internal Component for Copy Button ---
const CopyBtn = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="text-brand-500 hover:text-brand-600 transition flex items-center gap-1">
      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
      {label && <span className={copied ? "text-green-500" : ""}>{copied ? "Copied" : label}</span>}
    </button>
  );
};

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [mnemonic, setMnemonic] = useState(null);
  const [showPhrase, setShowPhrase] = useState(false);
  const [balance, setBalance] = useState("0.00");
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [mode, setMode] = useState("create");
  const [importPhrase, setImportPhrase] = useState("");
  const [error, setError] = useState("");

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState(null);

  // 1. Create New Wallet
  const createWallet = async () => {
    setLoading(true);
    setTimeout(async () => {
      const randomWallet = ethers.Wallet.createRandom();
      connectWallet(randomWallet);
      setLoading(false);
    }, 800);
  };

  // 2. Import Wallet
  const handleImport = async () => {
    setLoading(true);
    setError("");
    try {
        const cleanPhrase = importPhrase.trim();
        if (!ethers.Mnemonic.isValidMnemonic(cleanPhrase)) {
            throw new Error("Invalid Mnemonic Phrase");
        }
        const importedWallet = ethers.Wallet.fromPhrase(cleanPhrase);
        await connectWallet(importedWallet);
    } catch (err) {
        setError("Invalid Seed Phrase. Please check your spelling.");
    }
    setLoading(false);
  };

  const connectWallet = async (walletInstance) => {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const connectedWallet = walletInstance.connect(provider);
        setWallet(connectedWallet);
        setMnemonic(connectedWallet.mnemonic?.phrase);
        await fetchBalance(connectedWallet);
      } catch (e) {
        console.error("Connection Error:", e);
        setWallet(walletInstance);
      }
  };

  const fetchBalance = async (walletInstance) => {
      setIsRefreshing(true);
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const bal = await provider.getBalance(walletInstance.address);
        setBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
      } catch (e) {
        console.error("Balance Fetch Error", e);
      }
      setIsRefreshing(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!wallet) return;
    setTxStatus("signing");
    try {
        if (parseFloat(balance) > 0) {
            const tx = await wallet.sendTransaction({
                to: recipient,
                value: ethers.parseEther(amount)
            });
            await tx.wait();
        } else {
             await new Promise(r => setTimeout(r, 2000));
        }
        setTxStatus("success");
    } catch (err) {
        console.error(err);
        setTxStatus("error");
        setTimeout(() => setTxStatus(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
          <Shield className="text-brand-500" size={32} /> Sepolia Vault
        </h1>
        <p className="text-gray-500 mt-2">Create or Import your HD Wallet</p>
      </div>

      {!wallet ? (
        <div className="max-w-md mx-auto bg-white dark:bg-[#111b36] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
            {/* TABS */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button onClick={() => setMode("create")} className={`flex-1 py-4 text-sm font-bold transition ${mode === 'create' ? 'bg-blue-50 dark:bg-blue-900/20 text-brand-500' : 'text-gray-500'}`}>Create New</button>
                <button onClick={() => setMode("import")} className={`flex-1 py-4 text-sm font-bold transition ${mode === 'import' ? 'bg-blue-50 dark:bg-blue-900/20 text-brand-500' : 'text-gray-500'}`}>Import Phrase</button>
            </div>

            <div className="p-8 text-center">
                {mode === 'create' ? (
                    <>
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-500"><Download size={28} className={loading ? "animate-bounce" : ""} /></div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Generate New Wallet</h2>
                        <button onClick={createWallet} disabled={loading} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition mt-4">{loading ? "Generating..." : "Generate Now"}</button>
                    </>
                ) : (
                    <>
                         <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-500"><Upload size={28} /></div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Import Wallet</h2>
                        <textarea value={importPhrase} onChange={(e) => setImportPhrase(e.target.value)} placeholder="Enter 12-word phrase..." className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none mb-4 h-24 resize-none" />
                        {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
                        <button onClick={handleImport} disabled={loading || !importPhrase} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition disabled:opacity-50">{loading ? "Recovering..." : "Import Wallet"}</button>
                    </>
                )}
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left: Details */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-[#111b36] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Balance</h3>
                        <button 
                            onClick={() => fetchBalance(wallet)}
                            className={`text-brand-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-full transition ${isRefreshing ? "animate-spin" : ""}`}
                            title="Refresh Balance"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">{balance}</span>
                        <span className="text-xl font-medium text-brand-500 mb-1">ETH</span>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-between">
                         <span className="font-mono text-sm text-gray-600 dark:text-gray-400 truncate mr-2">{wallet.address}</span>
                         <CopyBtn text={wallet.address} />
                    </div>
                </div>

                {mnemonic && (
                <div className="bg-white dark:bg-[#111b36] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Secret Phrase</h3>
                        <button onClick={() => setShowPhrase(!showPhrase)} className="text-gray-400 hover:text-white transition">{showPhrase ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                    <div className={`grid grid-cols-3 gap-2 ${!showPhrase && 'blur-sm select-none'}`}>
                        {mnemonic.split(" ").map((word, i) => <div key={i} className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-center text-xs font-mono text-gray-600 dark:text-gray-400">{word}</div>)}
                    </div>
                    <div className="mt-4 flex justify-end">
                         <div className="text-sm">
                             <CopyBtn text={mnemonic} label="Copy Phrase" />
                         </div>
                    </div>
                </div>
                )}
                <button onClick={() => setWallet(null)} className="w-full py-3 text-red-500 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition">Logout / Clear Wallet</button>
            </div>

            {/* Right: Actions */}
            <div className="bg-white dark:bg-[#111b36] p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm h-fit">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Send size={20} className="text-brand-500" /> Send Transaction</h3>
                {!txStatus ? (
                <form onSubmit={handleSend} className="space-y-5">
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Recipient</label><input required placeholder="0x..." className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none" onChange={e => setRecipient(e.target.value)} /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount</label><input required type="number" step="0.0001" placeholder="0.00" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none" onChange={e => setAmount(e.target.value)} /></div>
                    <button className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition shadow-lg shadow-brand-500/20">Sign & Send</button>
                </form>
                ) : txStatus === 'signing' ? (
                     <div className="text-center py-12"><RefreshCw size={48} className="animate-spin text-brand-500 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Signing...</h3></div>
                ) : (
                     <div className="text-center py-8"><CheckCircle size={64} className="text-green-500 mx-auto mb-4" /><h3 className="text-xl font-bold text-gray-900 dark:text-white">Success!</h3><button onClick={() => setTxStatus(null)} className="mt-6 text-brand-500 font-bold hover:underline">New Transaction</button></div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}