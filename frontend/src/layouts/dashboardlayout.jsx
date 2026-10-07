import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";

function DashboardLayout({ children }) {
  return (
    <div className="layout">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        <div className="page-content">
          {children}
        </div>

      </div>

    </div>
  );
}

export default DashboardLayout;