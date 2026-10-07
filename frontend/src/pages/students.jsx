import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DashboardLayout from "../layouts/dashboardlayout";
import StudentTableView from "../components/student/StudentTableView";
import AddStudentModal from "../components/student/addstudentmodal";

import {
    addStudent,
    deleteStudent,
    subscribeStudents
} from "../services/firebaseservices";

function Students() {

    const { class: studentClass, section } = useParams();

    const [students, setStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {

        const unsubscribe = subscribeStudents(
            studentClass,
            section,
            setStudents
        );

        return () => unsubscribe();

    }, [studentClass, section]);

    const handleAddStudent = async (student) => {

        try {

            await addStudent(
                studentClass,
                section,
                student
            );

            setShowModal(false);

        } catch (error) {

            console.error(error);
            alert("Unable to save student.");

        }

    };

    const handleDeleteStudent = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to erase this student?"
        );

        if (!confirmDelete) return;

        try {

            await deleteStudent(id);

        } catch (error) {

            console.error(error);
            alert("Unable to delete student.");

        }

    };

    return (

        <DashboardLayout>

            <StudentTableView
                students={students}
                className={studentClass}
                section={section}
                onAddStudent={() => setShowModal(true)}
                onEraseStudent={handleDeleteStudent}
            />

            {

                showModal && (

                    <AddStudentModal
                        onClose={() => setShowModal(false)}
                        onSave={handleAddStudent}
                    />

                )

            }

        </DashboardLayout>

    );

}

export default Students;