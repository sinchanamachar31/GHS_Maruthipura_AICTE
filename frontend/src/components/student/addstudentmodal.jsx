import { useState } from "react";
import "./addstudentmodal.css";

function AddStudentModal({ onClose, onSave }) {

    const [rollNo, setRollNo] = useState("");
    const [name, setName] = useState("");

    const handleSave = (event) => {
        if (event) {
            event.preventDefault();
        }

        const numericRollNo = Number(rollNo);

        if (!Number.isInteger(numericRollNo) || numericRollNo < 1 || numericRollNo > 80) {
            alert("Roll Number should be between 1 and 80");
            return;
        }

        const trimmedName = name.trim();

        if (trimmedName === "") {
            alert("Enter Student Name");
            return;
        }

        onSave({
            roll_no: numericRollNo,
            name: trimmedName
        });

    };

    return (

        <div className="modal-overlay">

            <div className="student-modal">

                <h2>Add Student</h2>

                <form onSubmit={handleSave}>
                    <label>Roll Number</label>

                    <input
                        type="number"
                        min="1"
                        max="80"
                        data-testid="student-roll-input"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                    />

                    <label>Student Name</label>

                    <input
                        type="text"
                        maxLength="50"
                        data-testid="student-name-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <div className="button-group">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-btn"
                        >
                            Save Student
                        </button>

                    </div>
                </form>

            </div>

        </div>

    );

}

export default AddStudentModal;