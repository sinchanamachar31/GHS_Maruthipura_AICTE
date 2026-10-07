import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/dashboardlayout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveLedgerManualSA2, subscribeLedgerManualSA2, subscribeStudents, subscribeSubjectMarks } from "../services/firebaseservices";

const classOptions = [8, 9, 10];
const sectionOptions = ["A", "B"];
const assessmentOptions = ["FA1", "FA2", "FA3", "FA4", "SA1", "SA2"];

const subjectKeys = ["kannada", "english", "hindi", "maths", "science", "social"];

const CLASS10_SA2_MAX = 80;

const SCHOOL_NAME = "GHS-Maruthipura";

const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

function Ledger() {
  const [selectedClass, setSelectedClass] = useState(8);
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedAssessment, setSelectedAssessment] = useState("FA1");
  const [students, setStudents] = useState([]);
  const [subjectMarksMap, setSubjectMarksMap] = useState({});
  const [manualMarks, setManualMarks] = useState({});

  const isEditable = selectedClass === 10 && selectedAssessment === "SA2";

  useEffect(() => {
    const unsubscribeStudents = subscribeStudents(String(selectedClass), selectedSection, setStudents);
    const subjectSubscriptions = subjectKeys.map((subject) =>
      subscribeSubjectMarks(String(selectedClass), selectedSection, subject, (marks) => {
        setSubjectMarksMap((current) => ({ ...current, [subject]: marks }));
      })
    );
    const unsubscribeManual = subscribeLedgerManualSA2(String(selectedClass), selectedSection, setManualMarks);

    return () => {
      unsubscribeStudents();
      subjectSubscriptions.forEach((unsubscribe) => unsubscribe());
      unsubscribeManual();
    };
  }, [selectedClass, selectedSection]);

  const getFetchedValue = (subject, studentId) => {
    const raw = subjectMarksMap[subject]?.[studentId] || {};

    if (selectedClass === 8) {
      if (selectedAssessment === "FA1") {
        const a1 = Number(raw.a1) || 0;
        const a2 = Number(raw.a2) || 0;
        const fa1 = Number(raw.fa1) || 0;
        return Math.round(((a1 + a2 + fa1) / 40) * 10);
      }
      if (selectedAssessment === "FA2") {
        const a3 = Number(raw.a3) || 0;
        const a4 = Number(raw.a4) || 0;
        const fa2 = Number(raw.fa2) || 0;
        return Math.round(((a3 + a4 + fa2) / 40) * 10);
      }
      if (selectedAssessment === "FA3") {
        const a5 = Number(raw.a5) || 0;
        const a6 = Number(raw.a6) || 0;
        const fa3 = Number(raw.fa3) || 0;
        return Math.round(((a5 + a6 + fa3) / 40) * 10);
      }
      if (selectedAssessment === "FA4") {
        const a7 = Number(raw.a7) || 0;
        const a8 = Number(raw.a8) || 0;
        const fa4 = Number(raw.fa4) || 0;
        return Math.round(((a7 + a8 + fa4) / 40) * 10);
      }
      if (selectedAssessment === "SA1") {
        const sa1 = Number(raw.sa1) || 0;
        const oral1 = Number(raw.oral1) || 0;
        return Math.round(((sa1 + oral1) / 60) * 30);
      }
      const sa2 = Number(raw.sa2) || 0;
      const oral2 = Number(raw.oral2) || 0;
      return Math.round(((sa2 + oral2) / 60) * 30);
    }

    if (selectedClass === 9) {
      if (selectedAssessment === "FA1") {
        return (Number(raw.a1) || 0) + (Number(raw.a2) || 0) + (Number(raw.fa1) || 0);
      }
      if (selectedAssessment === "FA2") {
        return (Number(raw.a3) || 0) + (Number(raw.a4) || 0) + (Number(raw.fa2) || 0);
      }
      if (selectedAssessment === "FA3") {
        return (Number(raw.a5) || 0) + (Number(raw.a6) || 0) + (Number(raw.fa3) || 0);
      }
      if (selectedAssessment === "FA4") {
        return (Number(raw.a7) || 0) + (Number(raw.a8) || 0) + (Number(raw.fa4) || 0);
      }
      if (selectedAssessment === "SA1") {
        return Number(raw.sa1) || 0;
      }
      return Number(raw.sa2) || 0;
    }

    if (selectedAssessment === "FA1") {
      return (Number(raw.a1) || 0) + (Number(raw.a2) || 0) + (Number(raw.fa1) || 0);
    }
    if (selectedAssessment === "FA2") {
      return (Number(raw.a3) || 0) + (Number(raw.a4) || 0) + (Number(raw.fa2) || 0);
    }
    if (selectedAssessment === "FA3") {
      return (Number(raw.a5) || 0) + (Number(raw.a6) || 0) + (Number(raw.fa3) || 0);
    }
    if (selectedAssessment === "FA4") {
      return (Number(raw.a7) || 0) + (Number(raw.a8) || 0) + (Number(raw.fa4) || 0);
    }
    const sa1Raw = Number(raw.sa1) || 0;
    const sa1Max = subject === "kannada" ? 100 : 80;
    return Math.min(sa1Raw, sa1Max);
  };

  const handleManualChange = async (studentId, subject, value) => {
    const parsedValue = Number(value);
    const safeValue = Number.isNaN(parsedValue) ? 0 : Math.min(Math.max(parsedValue, 0), CLASS10_SA2_MAX);

    const nextManual = {
      ...manualMarks,
      [studentId]: {
        ...(manualMarks[studentId] || {}),
        [subject]: safeValue
      }
    };

    setManualMarks(nextManual);
    await saveLedgerManualSA2(String(selectedClass), selectedSection, nextManual);
  };

  const rows = useMemo(() => {
    return students.map((student) => {
      const subjectValues = {};
      let total = 0;

      subjectKeys.forEach((subject) => {
        const value = isEditable
          ? Number(manualMarks[student.id]?.[subject]) || 0
          : getFetchedValue(subject, student.id);
        subjectValues[subject] = value;
        total += value;
      });

      return {
        ...student,
        subjectValues,
        total
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, subjectMarksMap, manualMarks, selectedClass, selectedSection, selectedAssessment, isEditable]);

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
      ...subjectKeys.map((subject) => student.subjectValues[subject]),
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

    doc.save(`Ledger_${selectedClass}${selectedSection}_${selectedAssessment}.pdf`);
  };

  return (
    <DashboardLayout>
      <div className="login-container" style={{ alignItems: "flex-start", padding: "24px" }}>
        <div className="login-card" style={{ width: "100%", maxWidth: "1400px", textAlign: "left", background: "#f8fbff" }}>
          <h1>📒 Ledger Dashboard</h1>
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

          <p style={{ margin: "0 0 12px", fontSize: "14px", color: "#5b6b7c" }}>
            {isEditable
              ? "Class 10 SA2 isn't tracked in Subject entry, so enter it directly here."
              : "Values are fetched automatically from each subject's marks entry — this table is read-only."}
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Roll No</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Name</th>
                {subjectKeys.map((subject) => (
                  <th key={subject} style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>
                    {subject}
                  </th>
                ))}
                <th style={{ border: "1px solid #ddd", padding: "8px", background: "#1565c0", color: "white" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={subjectKeys.length + 3} style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center" }}>
                    No students found for this class and section.
                  </td>
                </tr>
              ) : (
                rows.map((student) => (
                  <tr key={student.id}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.roll_no}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.name}</td>
                    {subjectKeys.map((subject) =>
                      isEditable ? (
                        <td key={subject} style={{ border: "1px solid #ddd", padding: "8px" }}>
                          <input
                            type="number"
                            min="0"
                            max={CLASS10_SA2_MAX}
                            value={student.subjectValues[subject] ?? ""}
                            onChange={(event) => handleManualChange(student.id, subject, event.target.value)}
                            style={{ width: "70px", padding: "6px" }}
                          />
                        </td>
                      ) : (
                        <td key={subject} style={{ border: "1px solid #ddd", padding: "8px" }}>
                          {student.subjectValues[subject]}
                        </td>
                      )
                    )}
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Ledger;
