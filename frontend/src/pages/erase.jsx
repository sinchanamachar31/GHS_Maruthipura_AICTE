import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/dashboardlayout";

function Erase() {
  const navigate = useNavigate();

  const handleEraseAll = () => {
    const confirmed = window.confirm("Warning: this will erase all saved student data. Do you want to continue?");

    if (!confirmed) {
      return;
    }

    localStorage.clear();
    alert("All data has been erased.");
    navigate("/dashboard");
  };

  return (
    <DashboardLayout>
      <div className="login-container">
        <div className="login-card">
          <h1>🗑️ Erase Data</h1>
          <h3>This action will clear all saved student records.</h3>
          <button onClick={handleEraseAll}>Erase Everything</button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Erase;
