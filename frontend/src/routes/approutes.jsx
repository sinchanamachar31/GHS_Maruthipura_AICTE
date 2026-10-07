import { Routes, Route } from "react-router-dom";

import Login from "../pages/login";
import Dashboard from "../pages/dashboard";
import Students from "../pages/students";
import LedgerLogin from "../pages/ledgerlogin";
import Ledger from "../pages/ledger";
import PTMLogin from "../pages/ptmlogin";
import PTM from "../pages/ptm";
import SubjectLogin from "../pages/subjectlogin";
import Subject from "../pages/subject";
import PreparatoryLogin from "../pages/preparatorylogin";
import Preparatory from "../pages/preparatory";
import Erase from "../pages/erase";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/students/:class/:section" element={<Students />} />
      <Route path="/ledgerlogin" element={<LedgerLogin />} />
      <Route path="/ledger" element={<Ledger />} />
      <Route path="/ptmlogin" element={<PTMLogin />} />
      <Route path="/ptm" element={<PTM />} />
      <Route path="/subjectlogin" element={<SubjectLogin />} />
      <Route path="/subject/:subject" element={<Subject />} />
      <Route path="/preparatorylogin" element={<PreparatoryLogin />} />
      <Route path="/preparatory/:stage" element={<Preparatory />} />
      <Route path="/erase" element={<Erase />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;