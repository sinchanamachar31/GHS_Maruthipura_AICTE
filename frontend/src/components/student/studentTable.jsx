import "./studenttable.css";

function StudentTable({
    students,
    onAddStudent,
    className,
    section
}){

    return(

        <div className="student-page">

            <div className="student-header">

                <div>

                    <h2>{className}</h2>

                    <h4>Section {section}</h4>

                </div>

                <button
                className="add-btn"
                onClick={onAddStudent}
                >
                    + Add Student
                </button>

            </div>

            <div className="search-container">

                <input
                type="text"
                placeholder="Search Roll No or Name"
                />

            </div>

            <table>

                <thead>

                    <tr>

                        <th>Roll No</th>

                        <th>Name</th>

                        <td>{
student.photo ? (

<img
src={student.photo}
alt="student"
width="50"
height="50"
style={{
borderRadius:"50%",
objectFit:"cover"
}}
/>

) : (

"No Photo"

)

}</td>

                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                    {students.length===0 ?(

                        <tr>

                            <td
                            colSpan="4"
                            className="empty"
                            >

                                No Students Found

                            </td>

                        </tr>

                    ):(
                        students.map(student=>(

                            <tr key={student.id}>

                                <td>{student.roll_no}</td>

                                <td>{student.name}</td>

                                <td>

                                    <img

                                    src={student.photo}

                                    alt="student"

                                    width="40"

                                    />

                                </td>

                                <td>

                                    👁 ✏ 🗑

                                </td>

                            </tr>

                        ))
                    )}

                </tbody>

            </table>

        </div>

    );

}

export default StudentTable;