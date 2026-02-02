# Eth Dashboard: Explorer & Vault

A production-grade Blockchain Dashboard featuring a fully functional **Block Explorer** (simulating Etherscan) and a standalone **Non-Custodial Crypto Wallet**. Built with React, Vite, and Ethers.js.

This application serves as a comprehensive interface for interacting with the Ethereum blockchain. It is divided into two core modules:

1.  **The Explorer (Mainnet):** A read-only dashboard that visualizes the current state of the Ethereum network, including blocks, transactions, gas prices, and market data.
2.  **The Vault (Sepolia):** A fully functional HD Wallet implementation that allows users to generate keys, import seed phrases, and sign transactions client-side without relying on browser extensions like MetaMask.

---

## Key Features

### The Block Explorer 
* Fetches real-time ETH Price, Market Cap (via CoinGecko), Gas Prices, and Network TPS.
* Simultaneous visualization of the latest Blocks and Transactions.
* Search functionality supporting both **Block Numbers** and **Transaction Hashes**.
* Interactive "Slide-Over" modal to view raw details (Nonce, Miner, Gas Limit, Input Data) without leaving the page.
* Implements manual transaction fetching to bypass Ethers.js v6 prefetching errors on public RPCs.

### The Wallet
* Generates valid 12-word mnemonic phrases and derives Ethereum addresses using `ethers.HDNodeWallet`.
* Allows users to recover existing wallets using their secret recovery phrase.
* Fetches live Sepolia ETH balances with a "Refresh" feature.
* Signs and broadcasts transactions (simulated UI for safety, connected to Sepolia RPC).
* Does **not** require MetaMask or window injection. It manages keys locally in the browser memory.

---

## Tech Stack

* **Frontend Framework:** React (Vite)
* **Blockchain Interaction:** Ethers.js (v6)
* **Styling:** Tailwind CSS (v3) + PostCSS
* **Icons:** Lucide React
* **Routing:** React Router DOM
* **Data Sources:**
    * *Blockchain Data:* `https://ethereum.publicnode.com` (Mainnet) & `https://ethereum-sepolia.publicnode.com` (Sepolia)
    * *Market Data:* CoinGecko API

---

## Project Structure

        ```bash
        src/
        ├── assets/             # Static assets
        ├── components/         # Reusable UI components
        │   └── Navbar.jsx      # Responsive nav with Theme Toggle
        ├── pages/              # Core Application Views
        │   ├── Explorer.jsx    # Mainnet Block Explorer logic
        │   └── Wallet.jsx      # Sepolia Wallet logic
        ├── utils/              # Helper functions
        │   └── formatters.js   # Address truncation & ETH formatting
        ├── App.jsx             # Routing configuration
        └── main.jsx            # Entry point
        ```

## Follow these steps to run the dashboard locally.

1. Clone the Repository
```Bash
git clone </>
cd eth-dashboard
```

2. Install Dependencies
```Bash
npm install
```

3. Run Development Server
```Bash
npm run dev
```

* Open your browser and navigate to http://localhost:5173.

## Technical Implementation Details

** Handling Ethers.js v6 Quirks **
One challenge faced during development was the UNSUPPORTED_OPERATION error when accessing transaction details from a Block object.

The Explorer implements a "Fetch-Then-Enrich" pattern. It fetches the Block Header first, extracts transaction hashes, and then parallel-fetches the full transaction objects. This ensures robust data rendering across different RPC providers.

## The Wallet
The Sepolia Vault is a non-custodial wallet.

Private keys and Mnemonic phrases are stored in React state only. They are never sent to a backend server or stored in LocalStorage.

Refreshing the page clears the wallet from memory, ensuring no sensitive data remains on shared devices.

## Usage Guide
- Toggle between Light and Dark mode using the icon in the Navbar.

- Click on any Block or Transaction row to open the Details Preview slide-over.

- Select "Create New" to generate a wallet.

- Copy your phrase using the checkmark-feedback button.

- Switch tabs to "Import" to test wallet recovery.

_Developed for Blockheader Web3 Cohort 8 By **Faithy Raymond**_