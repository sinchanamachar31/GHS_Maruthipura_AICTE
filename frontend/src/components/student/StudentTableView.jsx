import { useMemo, useState } from "react";
import "./studenttable.css";

function StudentTableView({
    students,
    onAddStudent,
    onEraseStudent,
    className,
    section
}) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredStudents = useMemo(() => {
        const searchText = searchTerm.trim().toLowerCase();

        if (!searchText) {
            return students;
        }

        return students.filter((student) => {
            const rollNo = String(student.roll_no);
            const name = student.name.toLowerCase();
            return rollNo.includes(searchText) || name.includes(searchText);
        });
    }, [searchTerm, students]);

    return (
        <div className="student-page">
            <div className="student-header">
                <div>
                    <h2>{className}</h2>
                    <h4>Section {section}</h4>
                </div>

                <button className="add-btn" onClick={onAddStudent}>
                    + Add Student
                </button>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search Roll No or Name"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredStudents.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="empty">
                                No Students Found
                            </td>
                        </tr>
                    ) : (
                        filteredStudents.map((student) => (
                            <tr key={student.id}>
                                <td>{student.roll_no}</td>
                                <td>{student.name}</td>
                                <td>
                                    <button
                                        className="erase-btn"
                                        onClick={() => onEraseStudent(student.id)}
                                    >
                                        Erase
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default StudentTableView;
