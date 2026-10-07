import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/dashboardlayout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { savePTMManualSA2, subscribePTMManualSA2, subscribeStudents, subscribeSubjectMarks } from "../services/firebaseservices";

const classOptions = [8, 9, 10];
const sectionOptions = ["A", "B"];
const assessmentOptions = ["FA1", "FA2", "FA3", "FA4", "SA1", "SA2"];

const subjectKeys = ["kannada", "english", "hindi", "maths", "science", "social"];

const manualSA2Max = (subject) => (subject === "kannada" ? 100 : 80);

const SCHOOL_NAME = "GHS-Maruthipura";

const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const getPTMSubjectGrade = (value, classValue) => {
  const score = Number(value) || 0;

  if (classValue === 8) {
    if (score >= 18) return "A+";
    if (score >= 14) return "A";
    if (score >= 10) return "B+";
    if (score >= 6) return "B";
    return "C";
  }

  if (score >= 18) return "A+";
  if (score >= 16) return "A";
  if (score >= 14) return "B+";
  if (score >= 12) return "B";
  if (score >= 10) return "C+";
  if (score >= 7) return "C";
  return "NC";
};

const getPTMTotalGrade = (value, classValue) => {
  const score = Number(value) || 0;

  if (classValue === 8) {
    if (score >= 108) return "A+";
    if (score >= 84) return "A";
    if (score >= 60) return "B+";
    if (score >= 36) return "B";
    return "C";
  }

  if (score >= 108) return "A+";
  if (score >= 96) return "A";
  if (score >= 84) return "B+";
  if (score >= 72) return "B";
  if (score >= 60) return "C+";
  if (score >= 42) return "C";
  return "NC";
};

const hasMeaningfulMark = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0;
};

function PTM() {
  const [selectedClass, setSelectedClass] = useState(8);
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedAssessment, setSelectedAssessment] = useState("FA1");
  const [students, setStudents] = useState([]);
  const [subjectMarksData, setSubjectMarksData] = useState({});
  const [manualSA2, setManualSA2] = useState({});
  const [showRankList, setShowRankList] = useState(false);

  useEffect(() => {
    const unsubscribeStudents = subscribeStudents(String(selectedClass), selectedSection, setStudents);
    const subjectSubscriptions = subjectKeys.map((subject) =>
      subscribeSubjectMarks(String(selectedClass), selectedSection, subject, (marks) => {
        setSubjectMarksData((current) => ({ ...current, [subject]: marks }));
      })
    );
    const unsubscribeManualSA2 = subscribePTMManualSA2(String(selectedClass), selectedSection, setManualSA2);

    return () => {
      unsubscribeStudents();
      subjectSubscriptions.forEach((unsubscribe) => unsubscribe());
      unsubscribeManualSA2();
    };
  }, [selectedClass, selectedSection]);

  const handleManualSA2Change = async (studentId, subject, value) => {
    const parsedValue = Number(value);
    const maxMarks = manualSA2Max(subject);
    const safeValue = Number.isNaN(parsedValue) ? 0 : Math.min(Math.max(parsedValue, 0), maxMarks);

    const nextManual = {
      ...manualSA2,
      [studentId]: {
        ...(manualSA2[studentId] || {}),
        [subject]: safeValue
      }
    };

    setManualSA2(nextManual);
    await savePTMManualSA2(String(selectedClass), selectedSection, nextManual);
  };

  const getSubjectValue = (subject, studentId) => {
    const record = subjectMarksData[subject]?.[studentId] || {};

    if (selectedAssessment === "FA1") return Number(record.fa1) || 0;
    if (selectedAssessment === "FA2") return Number(record.fa2) || 0;
    if (selectedAssessment === "FA3") return Number(record.fa3) || 0;
    if (selectedAssessment === "FA4") return Number(record.fa4) || 0;

    if (selectedAssessment === "SA1") {
      if (selectedClass === 8) {
        return (Number(record.sa1) || 0) + (Number(record.oral1) || 0);
      }
      return Number(record.sa1) || 0;
    }

    if (selectedAssessment === "SA2") {
      if (selectedClass === 8) {
        return (Number(record.sa2) || 0) + (Number(record.oral2) || 0);
      }
      if (selectedClass === 9) {
        return Number(record.sa2) || 0;
      }
      return Number(manualSA2[studentId]?.[subject]) || 0;
    }

    return 0;
  };

  const isManualCell = (subject) => selectedClass === 10 && selectedAssessment === "SA2";

  const rows = useMemo(() => {
    return students.map((student) => {
      const marksBySubject = {};
      let total = 0;
      subjectKeys.forEach((subject) => {
        const value = getSubjectValue(subject, student.id);
        marksBySubject[subject] = value;
        total += value;
      });

      return {
        ...student,
        marksBySubject,
        total,
        totalGrade: getPTMTotalGrade(total, selectedClass)
      };
    });
  }, [students, subjectMarksData, manualSA2, selectedAssessment, selectedClass]);

  const gradeSummary = useMemo(() => {
    const grades = ["A+", "A", "B+", "B", "C+", "C", "NC"];
    const summary = {};

    grades.forEach((grade) => {
      summary[grade] = {};
      subjectKeys.forEach((subject) => {
        summary[grade][subject] = 0;
      });
    });

    rows.forEach((student) => {
      subjectKeys.forEach((subject) => {
        const value = student.marksBySubject[subject];

        if (!hasMeaningfulMark(value)) {
          return;
        }

        const grade = getPTMSubjectGrade(value, selectedClass);
        if (summary[grade]) {
          summary[grade][subject] += 1;
        }
      });
    });

    const totalStudents = rows.length || 0;
    const totalStudentsBySubject = {};
    subjectKeys.forEach((subject) => {
      totalStudentsBySubject[subject] = rows.filter((student) => hasMeaningfulMark(student.marksBySubject[subject])).length;
    });

    return {
      grades,
      summary,
      totalStudents,
      totalStudentsBySubject,
      absenteesBySubject: Object.fromEntries(
        subjectKeys.map((subject) => [subject, Math.max(0, totalStudents - totalStudentsBySubject[subject])])
      )
    };
  }, [rows, selectedClass]);

  const rankList = useMemo(() => {
    return [...rows]
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((student) => ({ name: student.name, total: student.total }));
  }, [rows]);

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.text(SCHOOL_NAME, 14, 15);

    doc.setFontSize(11);
    doc.text(`Academic Year: ${getAcademicYear()}`, 14, 22);
    doc.text(`Class: ${selectedClass}th   Section: ${selectedSection}   Exam: ${selectedAssessment}`, 14, 28);

    const tableColumns = [
      "Roll No",
      "Name",
      ...subjectKeys.map((subject) => subject.charAt(0).toUpperCase() + subject.slice(1)),
      "Total"
    ];

    const tableRows = rows.map((student) => [
      student.roll_no,
      student.name,
      ...subjectKeys.map((subject) => student.marksBySubject[subject]),
      student.total
    ]);

    autoTable(doc, {
      startY: 34,
      head: [tableColumns],
      body: tableRows,
      headStyles: { fillColor: [21, 101, 192] },
      styles: { halign: "center", fontSize: 9 },
      columnStyles: { 1: { halign: "left" } }
    });

    doc.save(`PTM_${selectedClass}${selectedSection}_${selectedAssessment}.pdf`);
  };

  return (
    <DashboardLayout>
      <div className="login-container" style={{ alignItems: "flex-start", padding: "24px" }}>
        <div className="login-card" style={{ width: "100%", maxWidth: "1400px", textAlign: "left", background: "#f8fbff" }}>
          <h1>👥 PTM Dashboard</h1>
          <h3>Marks entry for {selectedClass}th {selectedSection}</h3>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
            <select value={selectedClass} onChange={(event) => setSelectedClass(Number(event.target.value))} style={{ padding: "8px", borderRadius: "8px", border: "1px solid #cfd8e3" }}>
              {classOptions.map((classValue) => (
                <option key={classValue} value={classValue}>
                  {classValue}th
                </option>
              ))}
            </select>

            <select value={selectedSection} onChange={(event) => setSelectedSection(event.target.value)} style={{ padding: "8px", borderRadius: "8px", border: "1px solid #cfd8e3" }}>
              {sectionOptions.map((sectionValue) => (
                <option key={sectionValue} value={sectionValue}>
                  {sectionValue}
                </option>
              ))}
            </select>

            <select value={selectedAssessment} onChange={(event) => setSelectedAssessment(event.target.value)} style={{ padding: "8px", borderRadius: "8px", border: "1px solid #cfd8e3" }}>
              {assessmentOptions.map((assessmentValue) => (
                <option key={assessmentValue} value={assessmentValue}>
                  {assessmentValue}
                </option>
              ))}
            </select>

            <button
              onClick={handleDownloadPdf}
              style={{ padding: "10px 16px", borderRadius: "8px", background: "#2e7d32", color: "white", border: "none", cursor: "pointer" }}
            >
              📄 Convert to PDF
            </button>
          </div>

          {selectedClass === 10 && selectedAssessment === "SA2" && (
            <p style={{ marginBottom: "12px", color: "#8a6d00", background: "#fff6da", padding: "8px 12px", borderRadius: "8px", border: "1px solid #f0dfa0" }}>
              10th SA2 isn't recorded in the subject login, so enter it here directly.
            </p>
          )}

          <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Roll No</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Name</th>
                {subjectKeys.flatMap((subject) => [
                  <th key={`${subject}-value`} style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>
                    {subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </th>,
                  <th key={`${subject}-grade`} style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>
                    Grade
                  </th>
                ])}
                <th style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Total</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Total Grade</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={subjectKeys.length * 2 + 5} style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center" }}>
                    No students found for this class and section.
                  </td>
                </tr>
              ) : (
                rows.map((student) => (
                  <tr key={student.id}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.roll_no}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.name}</td>
                    {subjectKeys.flatMap((subject) => {
                      const grade = getPTMSubjectGrade(student.marksBySubject[subject], selectedClass);
                      return [
                        <td key={`${student.id}-${subject}-value`} style={{ border: "1px solid #ddd", padding: "8px" }}>
                          {isManualCell(subject) ? (
                            <input
                              type="number"
                              min="0"
                              max={manualSA2Max(subject)}
                              value={manualSA2[student.id]?.[subject] ?? ""}
                              onChange={(event) => handleManualSA2Change(student.id, subject, event.target.value)}
                              style={{ width: "70px", padding: "6px" }}
                            />
                          ) : (
                            student.marksBySubject[subject]
                          )}
                        </td>,
                        <td key={`${student.id}-${subject}-grade`} style={{ border: "1px solid #ddd", padding: "8px" }}>{grade}</td>
                      ];
                    })}
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.total}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{getPTMTotalGrade(student.total, selectedClass)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{ marginTop: "20px" }}>
            <button onClick={() => setShowRankList((value) => !value)} style={{ padding: "10px 16px", borderRadius: "8px", background: "#0b5ed7", color: "white", border: "none", cursor: "pointer" }}>
              {showRankList ? "Hide Rank List" : "View Rank List"}
            </button>
          </div>

          {showRankList && (
            <div style={{ marginTop: "16px", border: "1px solid #dbe3ec", borderRadius: "10px", padding: "16px", background: "white" }}>
              <h3>Top 10 Rank List for {selectedAssessment}</h3>
              {rankList.length === 0 ? (
                <p>No marks entered yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Rank</th>
                      <th style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Name</th>
                      <th style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankList.map((student, index) => (
                      <tr key={`${student.name}-${index}`}>
                        <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{index + 1}</td>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.name}</td>
                        <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{student.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <div style={{ marginTop: "24px", border: "1px solid #dbe3ec", borderRadius: "10px", padding: "16px", background: "white" }}>
            <h3>Grade Summary for Class {selectedClass}th - Section {selectedSection}</h3>
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
                      <td key={`${grade}-${subject}`} style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                        {gradeSummary.summary[grade][subject]}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>TotalStudents</td>
                  {subjectKeys.map((subject) => (
                    <td key={`total-${subject}`} style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                      {gradeSummary.totalStudentsBySubject[subject]}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>Absentees</td>
                  {subjectKeys.map((subject) => (
                    <td key={`absentees-${subject}`} style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                      {gradeSummary.absenteesBySubject[subject]}
                    </td>
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

export default PTM;
