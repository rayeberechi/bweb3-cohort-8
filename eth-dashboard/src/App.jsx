import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Explorer from "./pages/Explorer";
import Wallet from "./pages/Wallet";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b1221] transition-colors duration-200">
        <Navbar />
        <Routes>
          <Route path="/" element={<Explorer />} />
          <Route path="/wallet" element={<Wallet />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;