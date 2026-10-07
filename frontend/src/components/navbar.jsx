import "./navbar.css";
import { FaUserCircle } from "react-icons/fa";

function navbar() {

    return(

        <div className="navbar">

            <h2>🏫 GHS Maruthipura</h2>

            <div className="admin">

                <FaUserCircle size={28}/>

                <span>Admin</span>

            </div>

        </div>

    );

}

export default navbar;