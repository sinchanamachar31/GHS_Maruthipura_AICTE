import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaUserGraduate,
  FaBook,
  FaUsers,
  FaTrash,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaTimes
} from "react-icons/fa";

import "./sidebar.css";

const GRADES = [
  { grade: "8th Grade", sections: ["A", "B"] },
  { grade: "9th Grade", sections: ["A", "B"] },
  { grade: "10th Grade", sections: ["A", "B"] }
];

function Sidebar({ isOpen, onClose }) {
  const [open, setOpen] = useState(false);

  const sidebarVariants = {
    closed: { x: "-100%", opacity: 0.5 },
    open: { x: 0, opacity: 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="sidebar"
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="sidebar-header">
              <h2>🏫 GHSM</h2>
              <button className="close-btn" onClick={onClose}>
                <FaTimes />
              </button>
            </div>

            <div className="menu" onClick={() => setOpen(!open)}>
              <span className="menu-label">
                <FaUserGraduate />
                Students
              </span>
              {open ? <FaChevronDown /> : <FaChevronRight />}
            </div>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="submenu"
                >
                  {GRADES.map(({ grade, sections }) => {
                    const num = grade.replace(/\D/g, "");
                    return (
                      <div className="grade-block" key={grade}>
                        <p className="grade-title">{grade}</p>
                        <div className="section-grid">
                          {sections.map((sec) => (
                            <Link
                              key={sec}
                              to={`/students/${num}/${sec}`}
                              className="section-btn"
                              onClick={onClose}
                            >
                              Section {sec}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <Link className="menu" to="/ledgerlogin" onClick={onClose}>
              <span className="menu-label">
                <FaBook />
                Ledger
              </span>
            </Link>

            <Link className="menu" to="/ptmlogin" onClick={onClose}>
              <span className="menu-label">
                <FaUsers />
                PTM
              </span>
            </Link>

            <Link className="menu" to="/subjectlogin" onClick={onClose}>
              <span className="menu-label">
                <FaBook />
                Subject Login
              </span>
            </Link>

            <Link className="menu" to="/preparatorylogin" onClick={onClose}>
              <span className="menu-label">
                <FaBook />
                Preparatory
              </span>
            </Link>

            <Link className="menu" to="/erase" onClick={onClose}>
              <span className="menu-label">
                <FaTrash />
                Erase
              </span>
            </Link>

            <Link className="menu" to="/" onClick={onClose}>
              <span className="menu-label">
                <FaSignOutAlt />
                Logout
              </span>
            </Link>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Sidebar;