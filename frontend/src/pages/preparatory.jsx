import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../layouts/dashboardlayout";
import { savePreparatoryMarks, subscribePreparatoryMarks, subscribeStudents } from "../services/firebaseservices";

const classOptions = [8, 9, 10];
const sectionOptions = ["A", "B"];
const subjectKeys = ["kannada", "english", "hindi", "maths", "science", "social"];

const getGradeForOutOf100 = (value) => {
  if (value >= 90) return "A+";
  if (value >= 70) return "A";
  if (value >= 50) return "B+";
  if (value >= 30) return "B";
  return "C";
};

const getGradeForOutOf80 = (value) => {
  if (value >= 72) return "A+";
  if (value >= 64) return "A";
  if (value >= 56) return "B+";
  if (value >= 48) return "B";
  if (value >= 40) return "C+";
  if (value >= 28) return "C";
  return "NC";
};

const getTotalGrade = (value) => {
  if (value >= 450) return "A+";
  if (value >= 390) return "A";
  if (value >= 330) return "B+";
  if (value >= 270) return "B";
  if (value >= 210) return "C+";
  if (value >= 150) return "C";
  return "NC";
};

const hasMeaningfulMark = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0;
};

function Preparatory() {
  const { stage } = useParams();
  const [selectedClass, setSelectedClass] = useState(8);
  const [selectedSection, setSelectedSection] = useState("A");
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});

  useEffect(() => {
    const unsubscribeStudents = subscribeStudents(String(selectedClass), selectedSection, setStudents);
    const unsubscribeMarks = subscribePreparatoryMarks(stage, String(selectedClass), selectedSection, setMarks);

    return () => {
      unsubscribeStudents();
      unsubscribeMarks();
    };
  }, [selectedClass, selectedSection, stage]);

  const handleInputChange = async (studentId, field, value) => {
    const safeValue = Math.min(Math.max(Number(value) || 0, 0), field.includes("kannada") ? 100 : 80);
    const nextMarks = {
      ...marks,
      [studentId]: {
        ...(marks[studentId] || {}),
        [field]: safeValue
      }
    };

    setMarks(nextMarks);
    await savePreparatoryMarks(stage, String(selectedClass), selectedSection, nextMarks);
  };

  const rows = useMemo(() => {
    return students.map((student) => {
      const studentMarks = marks[student.id] || {};
      const subjectValues = {};
      let total = 0;

      subjectKeys.forEach((subject) => {
        const value = Number(studentMarks[subject]) || 0;
        subjectValues[subject] = value;
        total += value;
      });

      return {
        ...student,
        studentMarks,
        subjectValues,
        total,
        totalGrade: getTotalGrade(total)
      };
    });
  }, [students, marks]);

  const gradeSummary = useMemo(() => {
    const grades = ["A+", "A", "B+", "B", "C+", "C", "NC"];
    const summary = {};
    grades.forEach((grade) => {
      summary[grade] = { total: 0 };
      subjectKeys.forEach((subject) => {
        summary[grade][subject] = 0;
      });
    });

    rows.forEach((student) => {
      subjectKeys.forEach((subject) => {
        const value = student.subjectValues[subject] || 0;

        if (!hasMeaningfulMark(value)) {
          return;
        }

        const grade = subject === "kannada" ? getGradeForOutOf100(value) : getGradeForOutOf80(value);
        if (summary[grade]) {
          summary[grade][subject] += 1;
          summary[grade].total += 1;
        }
      });
    });

    const totalStudents = rows.length || 0;
    const totalStudentsBySubject = {};
    subjectKeys.forEach((subject) => {
      totalStudentsBySubject[subject] = rows.filter((student) => hasMeaningfulMark(student.subjectValues[subject])).length;
    });

    const absenteesBySubject = Object.fromEntries(
      subjectKeys.map((subject) => [subject, Math.max(0, totalStudents - totalStudentsBySubject[subject])])
    );

    return {
      grades,
      summary,
      totalStudents,
      totalStudentsBySubject,
      absenteesBySubject
    };
  }, [rows]);

  return (
    <DashboardLayout>
      <div className="login-container" style={{ alignItems: "flex-start", padding: "24px" }}>
        <div className="login-card" style={{ width: "100%", maxWidth: "1500px", textAlign: "left", background: "#f8fbff" }}>
          <h1>📘 Preparatory {stage}</h1>
          <h3>Class {selectedClass}th - Section {selectedSection}</h3>

          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            {['P1', 'P2', 'P3'].map((value) => (
              <button
                key={value}
                onClick={() => window.location.href = `/preparatory/${value}`}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: stage === value ? "#0d6efd" : "#e9f0ff",
                  color: stage === value ? "white" : "#0d6efd",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                {value}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <select value={selectedClass} onChange={(event) => setSelectedClass(Number(event.target.value))} style={{ padding: "8px", borderRadius: "8px", border: "1px solid #cfd8e3" }}>
              {classOptions.map((classValue) => (
                <option key={classValue} value={classValue}>{classValue}th</option>
              ))}
            </select>
            <select value={selectedSection} onChange={(event) => setSelectedSection(event.target.value)} style={{ padding: "8px", borderRadius: "8px", border: "1px solid #cfd8e3" }}>
              {sectionOptions.map((sectionValue) => (
                <option key={sectionValue} value={sectionValue}>{sectionValue}</option>
              ))}
            </select>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Sl No</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Name</th>
                {subjectKeys.flatMap((subject) => [
                  <th key={`${subject}-score`} style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>{subject.charAt(0).toUpperCase() + subject.slice(1)}</th>,
                  <th key={`${subject}-grade`} style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Grade</th>
                ])}
                <th style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Total</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={subjectKeys.length * 2 + 5} style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center" }}>No students found for this class and section.</td>
                </tr>
              ) : (
                rows.map((student, index) => (
                  <tr key={student.id}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{index + 1}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.name}</td>
                    {subjectKeys.flatMap((subject) => {
                      const value = student.subjectValues[subject] || 0;
                      const grade = subject === "kannada" ? getGradeForOutOf100(value) : getGradeForOutOf80(value);
                      return [
                        <td key={`${student.id}-${subject}-value`} style={{ border: "1px solid #ddd", padding: "8px" }}>
                          <input
                            type="number"
                            min="0"
                            max={subject === "kannada" ? 100 : 80}
                            value={value}
                            onChange={(event) => handleInputChange(student.id, subject, event.target.value)}
                            style={{ width: "72px", padding: "6px", borderRadius: "6px", border: "1px solid #c9d4df" }}
                          />
                        </td>,
                        <td key={`${student.id}-${subject}-grade`} style={{ border: "1px solid #ddd", padding: "8px" }}>{grade}</td>
                      ];
                    })}
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.total}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.totalGrade}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{ marginTop: "24px", border: "1px solid #dbe3ec", borderRadius: "10px", padding: "16px", background: "white" }}>
            <h3>Grade Count Summary</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Grade</th>
                  {subjectKeys.map((subject) => (
                    <th key={subject} style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>{subject.charAt(0).toUpperCase() + subject.slice(1)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gradeSummary.grades.map((grade) => (
                  <tr key={grade}>
                    <td style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>{grade}</td>
                    {subjectKeys.map((subject) => (
                      <td key={`${grade}-${subject}`} style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{gradeSummary.summary[grade][subject] || 0}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>TotalStudents</td>
                  {subjectKeys.map((subject) => (
                    <td key={`total-${subject}`} style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{gradeSummary.totalStudentsBySubject[subject] || 0}</td>
                  ))}
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>Absentees</td>
                  {subjectKeys.map((subject) => (
                    <td key={`absentees-${subject}`} style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{gradeSummary.absenteesBySubject[subject] || 0}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Preparatory;
