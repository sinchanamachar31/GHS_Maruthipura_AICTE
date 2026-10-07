import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import "./dashboard.css";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="dashboard-wrapper">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* hamburger button, always top-left */}
      <motion.button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ x: sidebarOpen ? 260 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <FaBars />
      </motion.button>

      <motion.div
        className="dashboard-content"
        animate={{ marginLeft: sidebarOpen ? 260 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <motion.div
          className="welcome-card"
          initial={{ opacity: 0, y: 60, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="floating-emoji"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Welcome to GHS Maruthipura
          </motion.h1>

          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            📚 Student Management System
          </motion.h3>

          <motion.button
            className="get-started-btn"
            whileHover={{ scale: 1.08, boxShadow: "0 8px 25px rgba(106,90,205,0.5)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            onClick={() => setShowPopup(true)}
          >
            Get Started 
          </motion.button>
        </motion.div>
      </motion.div>

      {/* popup modal */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="popup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              className="popup-card"
              initial={{ scale: 0.6, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Quick Actions 🚀</h2>
              <p>Use the menu (☰) in the top-left to explore Students, Ledger, PTM and more.</p>
              <motion.button
                className="popup-close-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPopup(false)}
              >
                Got it!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;