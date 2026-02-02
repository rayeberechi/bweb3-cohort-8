import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Search, Box, FileText, ArrowRight, Clock, Database, Layers, RefreshCw, X, CheckCircle, Shield, Zap, Check, Copy } from "lucide-react";
import { formatAddress, formatEth } from "../utils/formatters";

// MAINNET RPC
const RPC_URL = "https://ethereum.publicnode.com";

export default function Explorer() {
  const [blocks, setBlocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [networkStats, setNetworkStats] = useState({
    ethPrice: "0.00",
    marketCap: "0",
    gasPrice: "0",
    finalizedBlock: 0,
    safeBlock: 0,
    tps: "0.0"
  });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); 
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // 1. Fetch Market Data
  const fetchMarketData = async () => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_change=true");
      const data = await res.json();
      return {
        price: data.ethereum.usd,
        cap: data.ethereum.usd_market_cap
      };
    } catch (e) {
      console.warn("CoinGecko Error", e);
      return null;
    }
  };

  const fetchBlockchainData = async () => {
    setIsRefreshing(true);
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);

      const [blockNum, feeData, marketData, finalized, safe] = await Promise.all([
        provider.getBlockNumber(),
        provider.getFeeData(),
        fetchMarketData(),
        provider.getBlock("finalized"),
        provider.getBlock("safe")
      ]);

      const latestBlock = await provider.getBlock(blockNum);
      const tps = (latestBlock.transactions.length / 12).toFixed(1);

      setNetworkStats({
        ethPrice: marketData?.price.toLocaleString() || "2,200.00",
        marketCap: marketData?.cap.toLocaleString() || "270,000,000,000",
        gasPrice: ethers.formatUnits(feeData.gasPrice, "gwei"),
        finalizedBlock: finalized.number,
        safeBlock: safe.number,
        tps: tps
      });

      const newBlocks = [];
      for (let i = 0; i < 6; i++) {
        const b = await provider.getBlock(blockNum - i, false); 
        if (b) newBlocks.push(b);
      }
      setBlocks(newBlocks);

      if (newBlocks[0] && newBlocks[0].transactions) {
        const txHashes = newBlocks[0].transactions.slice(0, 6);
        const txDetails = await Promise.all(txHashes.map(hash => provider.getTransaction(hash)));
        setTransactions(txDetails.filter(t => t !== null));
      }

      setLoading(false);
    } catch (err) {
      console.error("Explorer Error:", err);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchBlockchainData();
    const interval = setInterval(fetchBlockchainData, 15000);
    return () => clearInterval(interval);
  }, []);

  // --- SEARCH FUNCTION ---
  const handleSearch = async (e) => {
    if (e.type === 'keydown' && e.key !== 'Enter') return;
    
    if (!searchTerm) return;
    setIsSearching(true);

    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      let result = null;

      // Check if input is a Block Number (digits only)
      if (/^\d+$/.test(searchTerm)) {
        result = await provider.getBlock(parseInt(searchTerm));
      } 
      // Check if input is a Transaction Hash (0x + 64 hex chars)
      else if (ethers.isHexString(searchTerm, 32)) {
        result = await provider.getTransaction(searchTerm);
      }

      if (result) {
        setSelectedItem(result); // Open the details modal with the result
        setSearchTerm(""); // Clear input
      } else {
        alert("Not found. Please enter a valid Block Number or Transaction Hash.");
      }
    } catch (err) {
      console.error(err);
      alert("Search failed. Invalid format.");
    }
    setIsSearching(false);
  };

  const renderDetails = () => {
    if (!selectedItem) return null;
    const isBlock = !!selectedItem.miner; 

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
          <div className={`p-3 rounded-lg ${isBlock ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'}`}>
            {isBlock ? <Box size={24} /> : <FileText size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{isBlock ? `Block #${selectedItem.number}` : "Transaction Details"}</h3>
            <p className="text-xs text-gray-400 font-mono break-all">{selectedItem.hash}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-4 text-sm">
          {isBlock ? (
            <>
               <DetailRow label="Timestamp" value={new Date(Number(selectedItem.timestamp) * 1000).toLocaleString()} />
               <DetailRow label="Transactions" value={`${selectedItem.transactions.length} txns`} />
               <DetailRow label="Miner" value={selectedItem.miner} copy />
               <DetailRow label="Gas Used" value={selectedItem.gasUsed.toString()} />
               <DetailRow label="Gas Limit" value={selectedItem.gasLimit.toString()} />
               <DetailRow label="Parent Hash" value={selectedItem.parentHash} copy />
            </>
          ) : (
            <>
               <DetailRow label="From" value={selectedItem.from} copy />
               <DetailRow label="To" value={selectedItem.to || "Contract Creation"} copy />
               <DetailRow label="Value" value={`${formatEth(selectedItem.value)} ETH`} />
               <DetailRow label="Nonce" value={selectedItem.nonce} />
               <DetailRow label="Block Number" value={selectedItem.blockNumber} />
               <DetailRow label="Chain ID" value={selectedItem.chainId.toString()} />
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto px-4">
      {/* HEADER */}
      <div className="bg-[#111b36] py-10 px-6 rounded-3xl border border-gray-800 shadow-2xl mb-8 relative overflow-hidden mt-6">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
           <Layers size={200} className="text-brand-500" />
        </div>
        <div className="relative z-10 text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Ethereum Mainnet Explorer</h1>
          <div className="relative max-w-xl mx-auto">
            <input 
              type="text" 
              placeholder="Search by Txn Hash or Block Number..." 
              className="w-full pl-5 pr-12 py-3.5 rounded-xl bg-white/10 border border-gray-600 text-white placeholder-gray-400 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch} // Trigger on Enter
            />
            <button 
              onClick={handleSearch} // Trigger on Click
              className="absolute right-2 top-2 p-1.5 bg-brand-500 rounded-lg text-white hover:bg-brand-600 transition disabled:opacity-50"
              disabled={isSearching}
            >
              {isSearching ? <RefreshCw size={20} className="animate-spin" /> : <Search size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- DASHBOARD STATS --- */}
      <div className="bg-white dark:bg-[#111b36] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800">
          
          <div className="space-y-4 px-4">
            <div className="flex items-center gap-3">
               <img src="https://etherscan.io/images/svg/brands/ethereum.svg?v=1.3" className="w-6 h-6" alt="ETH" />
               <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">ETHER PRICE</p>
                  <p className="text-sm font-bold dark:text-gray-200">${networkStats.ethPrice}</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <Database size={24} className="text-gray-400" />
               <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">MARKET CAP</p>
                  <p className="text-sm font-bold dark:text-gray-200">${networkStats.marketCap}</p>
               </div>
            </div>
          </div>

          <div className="space-y-4 px-4">
            <div className="flex items-center gap-3">
               <Zap size={24} className="text-gray-400" />
               <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">TRANSACTIONS</p>
                  <p className="text-sm font-bold dark:text-gray-200">1,942.32 M <span className="text-xs font-normal text-gray-400">({networkStats.tps} TPS)</span></p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <Clock size={24} className="text-gray-400" />
               <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">GAS PRICE</p>
                  <p className="text-sm font-bold dark:text-gray-200">{parseFloat(networkStats.gasPrice).toFixed(2)} Gwei</p>
               </div>
            </div>
          </div>

          <div className="space-y-4 px-4">
            <div className="flex items-center gap-3">
               <CheckCircle size={24} className="text-gray-400" />
               <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">LAST FINALIZED BLOCK</p>
                  <p className="text-sm font-bold dark:text-gray-200">{networkStats.finalizedBlock}</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <Shield size={24} className="text-gray-400" />
               <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">LAST SAFE BLOCK</p>
                  <p className="text-sm font-bold dark:text-gray-200">{networkStats.safeBlock}</p>
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- BLOCKS & TRANSACTIONS GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latest Blocks */}
        <div className="bg-white dark:bg-[#111b36] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between">
            <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><Box size={18} /> Latest Blocks</h2>
            <button onClick={fetchBlockchainData} className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw size={16} /></button>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? <SkeletonRows /> : blocks.map((block) => (
              <div 
                key={block.number} 
                onClick={() => setSelectedItem(block)}
                className="p-4 flex items-center gap-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition cursor-pointer group"
              >
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-300 font-bold text-xs">Bk</div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-brand-500 font-medium text-sm">#{block.number}</span>
                    <span className="text-xs text-gray-400">{Math.floor((Date.now()/1000 - block.timestamp))}s ago</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-500">Miner: {formatAddress(block.miner)}</span>
                    <span className="text-gray-500">{block.transactions.length} txns</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Transactions */}
        <div className="bg-white dark:bg-[#111b36] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><FileText size={18} /> Latest Transactions</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? <SkeletonRows /> : transactions.map((tx) => (
              <div 
                key={tx.hash} 
                onClick={() => setSelectedItem(tx)}
                className="p-4 flex items-center gap-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition cursor-pointer group"
              >
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-300 font-bold text-xs">Tx</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className="text-brand-500 font-medium text-sm truncate w-24">{formatAddress(tx.hash)}</span>
                    <span className="text-xs text-gray-400 border border-gray-200 dark:border-gray-700 px-1 rounded bg-gray-50 dark:bg-gray-800">{formatEth(tx.value)} ETH</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs mt-1 text-gray-500">
                    From <span className="text-gray-300">{formatAddress(tx.from)}</span>
                    <ArrowRight size={10} />
                    To <span className="text-gray-300">{tx.to ? formatAddress(tx.to) : "Contract"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- DETAILS MODAL --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setSelectedItem(null)}>
          <div className="w-full max-w-md bg-[#111b36] h-full shadow-2xl p-6 border-l border-gray-800 overflow-y-auto animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Details Preview</h2>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            {renderDetails()}
          </div>
        </div>
      )}
    </div>
  );
}

const DetailRow = ({ label, value, copy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-1 pb-2 border-b border-gray-800 last:border-0">
            <span className="text-gray-500 text-xs uppercase font-bold">{label}</span>
            <div className="flex items-center justify-between group">
                <span className="font-mono text-gray-300 truncate">{value}</span>
                {copy && (
                    <button onClick={handleCopy} className="text-gray-500 hover:text-brand-500 transition">
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                )}
            </div>
        </div>
    );
}

const SkeletonRows = () => (
  <div className="p-4 space-y-4 animate-pulse">
    {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>)}
  </div>
);