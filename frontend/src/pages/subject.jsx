import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../layouts/dashboardlayout";
import { saveSubjectMarks, subscribeStudents, subscribeSubjectMarks } from "../services/firebaseservices";

const subjectLabels = {
  kannada: "Kannada",
  english: "English",
  hindi: "Hindi",
  maths: "Maths",
  science: "Science",
  social: "Social"
};

const classOptions = [8, 9, 10];
const sectionOptions = ["A", "B"];

const getInputLimits = (classValue, subjectValue) => {
  if (classValue === 10) {
    return {
      a1: 15,
      a2: 15,
      fa1: 20,
      a3: 15,
      a4: 15,
      fa2: 20,
      sa1: subjectValue === "kannada" ? 100 : 80,
      a5: 15,
      a6: 15,
      fa3: 20,
      a7: 15,
      a8: 15,
      fa4: 20
    };
  }

  if (classValue === 9) {
    return {
      a1: 15,
      a2: 15,
      fa1: 20,
      a3: 15,
      a4: 15,
      fa2: 20,
      sa1: 80,
      a5: 15,
      a6: 15,
      fa3: 20,
      a7: 15,
      a8: 15,
      fa4: 20,
      sa2: 80
    };
  }

  return {
    a1: 10,
    a2: 10,
    fa1: 20,
    a3: 10,
    a4: 10,
    fa2: 20,
    sa1: 50,
    oral1: 10,
    a5: 10,
    a6: 10,
    fa3: 20,
    a7: 10,
    a8: 10,
    fa4: 20,
    sa2: 50,
    oral2: 10
  };
};

const getTermGrade = (value, classValue) => {
  if (classValue === 9 || classValue === 10) {
    if (value <= 17) return "NC";
    if (value <= 24) return "C";
    if (value <= 29) return "C+";
    if (value <= 34) return "B";
    if (value <= 39) return "B+";
    if (value <= 44) return "A";
    return "A+";
  }

  if (value <= 2) return "C";
  if (value <= 4) return "B";
  if (value <= 6) return "B+";
  if (value <= 8) return "A";
  return "A+";
};

const getSemesterGrade = (value, classValue) => {
  if (classValue === 9 || classValue === 10) {
    return getTermGrade(value, classValue);
  }

  if (value <= 9) return "C";
  if (value <= 15) return "B";
  if (value <= 21) return "B+";
  if (value <= 26) return "A";
  return "A+";
};

const getResultGrade = (value) => {
  if (value <= 29) return "C";
  if (value <= 49) return "B";
  if (value <= 69) return "B+";
  if (value <= 89) return "A";
  return "A+";
};

function Subject() {
  const { subject } = useParams();
  const label = subjectLabels[subject] || "Subject";
  const [selectedClass, setSelectedClass] = useState(8);
  const [selectedSection, setSelectedSection] = useState("A");
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loginPassword, setLoginPassword] = useState("");

  const isTenth = selectedClass === 10;
  const isNinth = selectedClass === 9;
  const inputLimits = getInputLimits(selectedClass, subject);

  useEffect(() => {
    try {
      setLoginPassword(localStorage.getItem("ghs-login-password") || "");
    } catch {
      setLoginPassword("");
    }
  }, []);

  const hideNinthColumns = isNinth && loginPassword === "12345";

  useEffect(() => {
    const unsubscribeStudents = subscribeStudents(String(selectedClass), selectedSection, setStudents);
    const unsubscribeMarks = subscribeSubjectMarks(String(selectedClass), selectedSection, subject, setMarks);

    return () => {
      unsubscribeStudents();
      unsubscribeMarks();
    };
  }, [selectedClass, selectedSection, subject]);

  const handleInputChange = async (studentId, field, value) => {
    const parsedValue = Number(value);
    const limit = inputLimits[field] ?? 100;
    const safeValue = Number.isNaN(parsedValue) ? 0 : Math.min(Math.max(parsedValue, 0), limit);

    const nextMarks = {
      ...marks,
      [studentId]: {
        ...(marks[studentId] || {}),
        [field]: safeValue
      }
    };

    setMarks(nextMarks);
    await saveSubjectMarks(String(selectedClass), selectedSection, subject, nextMarks);
  };

  const rows = useMemo(() => {
    return students.map((student) => {
      const studentMarks = marks[student.id] || {};

      if (isTenth) {
        const a1 = Number(studentMarks.a1) || 0;
        const a2 = Number(studentMarks.a2) || 0;
        const fa1 = Number(studentMarks.fa1) || 0;
        const t1 = a1 + a2 + fa1;
        const grade1 = getTermGrade(t1, selectedClass);

        const a3 = Number(studentMarks.a3) || 0;
        const a4 = Number(studentMarks.a4) || 0;
        const fa2 = Number(studentMarks.fa2) || 0;
        const t2 = a3 + a4 + fa2;
        const grade2 = getTermGrade(t2, selectedClass);

        const sa1 = Number(studentMarks.sa1) || 0;

        const a5 = Number(studentMarks.a5) || 0;
        const a6 = Number(studentMarks.a6) || 0;
        const fa3 = Number(studentMarks.fa3) || 0;
        const t3 = a5 + a6 + fa3;
        const grade3 = getTermGrade(t3, selectedClass);

        const a7 = Number(studentMarks.a7) || 0;
        const a8 = Number(studentMarks.a8) || 0;
        const fa4 = Number(studentMarks.fa4) || 0;
        const t4 = a7 + a8 + fa4;
        const grade4 = getTermGrade(t4, selectedClass);

        const sum = t1 + t2 + t3 + t4;
        const rt = Math.round((sum / 200) * (subject === "kannada" ? 25 : 20));

        return {
          ...student,
          studentMarks,
          t1,
          grade1,
          t2,
          grade2,
          sa1,
          t3,
          grade3,
          t4,
          grade4,
          sum,
          rt
        };
      }

      if (isNinth) {
        const a1 = Number(studentMarks.a1) || 0;
        const a2 = Number(studentMarks.a2) || 0;
        const fa1 = Number(studentMarks.fa1) || 0;
        const t1 = a1 + a2 + fa1;
        const grade1 = getTermGrade(t1, selectedClass);

        const a3 = Number(studentMarks.a3) || 0;
        const a4 = Number(studentMarks.a4) || 0;
        const fa2 = Number(studentMarks.fa2) || 0;
        const t2 = a3 + a4 + fa2;
        const grade2 = getTermGrade(t2, selectedClass);

        const sa1 = Number(studentMarks.sa1) || 0;

        const a5 = Number(studentMarks.a5) || 0;
        const a6 = Number(studentMarks.a6) || 0;
        const fa3 = Number(studentMarks.fa3) || 0;
        const t3 = a5 + a6 + fa3;
        const grade3 = getTermGrade(t3, selectedClass);

        const a7 = Number(studentMarks.a7) || 0;
        const a8 = Number(studentMarks.a8) || 0;
        const fa4 = Number(studentMarks.fa4) || 0;
        const t4 = a7 + a8 + fa4;
        const grade4 = getTermGrade(t4, selectedClass);

        const sum = t1 + t2 + t3 + t4;
        const rt = Math.min(20, Math.max(0, Math.round((sum / 200) * 20)));
        const sa2 = Number(studentMarks.sa2) || 0;
        const result = rt + sa2;
        const resultGrade = getResultGrade(result);

        return {
          ...student,
          studentMarks,
          t1,
          grade1,
          t2,
          grade2,
          sa1,
          t3,
          grade3,
          t4,
          grade4,
          sum,
          rt,
          sa2,
          result,
          resultGrade
        };
      }

      const a1 = Number(studentMarks.a1) || 0;
      const a2 = Number(studentMarks.a2) || 0;
      const fa1 = Number(studentMarks.fa1) || 0;
      const t1 = a1 + a2 + fa1;
      const rt1 = Math.round((t1 / 40) * 10);
      const grade1 = getTermGrade(rt1, selectedClass);

      const a3 = Number(studentMarks.a3) || 0;
      const a4 = Number(studentMarks.a4) || 0;
      const fa2 = Number(studentMarks.fa2) || 0;
      const t2 = a3 + a4 + fa2;
      const rt2 = Math.round((t2 / 40) * 10);
      const grade2 = getTermGrade(rt2, selectedClass);

      const sa1 = Number(studentMarks.sa1) || 0;
      const oral1 = Number(studentMarks.oral1) || 0;
      const total1 = sa1 + oral1;
      const rts1 = Math.round((total1 / 60) * 30);
      const gradeS1 = getSemesterGrade(rts1, selectedClass);

      const a5 = Number(studentMarks.a5) || 0;
      const a6 = Number(studentMarks.a6) || 0;
      const fa3 = Number(studentMarks.fa3) || 0;
      const t3 = a5 + a6 + fa3;
      const rt3 = Math.round((t3 / 40) * 10);
      const grade3 = getTermGrade(rt3, selectedClass);

      const a7 = Number(studentMarks.a7) || 0;
      const a8 = Number(studentMarks.a8) || 0;
      const fa4 = Number(studentMarks.fa4) || 0;
      const t4 = a7 + a8 + fa4;
      const rt4 = Math.round((t4 / 40) * 10);
      const grade4 = getTermGrade(rt4, selectedClass);

      const sa2 = Number(studentMarks.sa2) || 0;
      const oral2 = Number(studentMarks.oral2) || 0;
      const total2 = sa2 + oral2;
      const rts2 = Math.round((total2 / 60) * 30);
      const gradeS2 = getSemesterGrade(rts2, selectedClass);

      const result = rt1 + rt2 + rts1 + rt3 + rt4 + rts2;
      const resultGrade = getResultGrade(result);

      return {
        ...student,
        studentMarks,
        t1,
        rt1,
        grade1,
        t2,
        rt2,
        grade2,
        total1,
        rts1,
        gradeS1,
        t3,
        rt3,
        grade3,
        t4,
        rt4,
        grade4,
        total2,
        rts2,
        gradeS2,
        result,
        resultGrade
      };
    });
  }, [students, marks, isNinth, isTenth, selectedClass, subject]);

  const renderInputCell = (studentId, field, value) => (
    <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>
      <input
        type="number"
        min="0"
        max={inputLimits[field] ?? 100}
        step="1"
        value={value ?? ""}
        onChange={(event) => handleInputChange(studentId, field, event.target.value)}
        style={{ width: "70px", padding: "6px", borderRadius: "6px", border: "1px solid #c9d4df" }}
      />
    </td>
  );

  return (
    <DashboardLayout>
      <div className="login-container" style={{ alignItems: "flex-start", padding: "24px" }}>
        <div className="login-card" style={{ width: "100%", maxWidth: "1500px", textAlign: "left", background: "#f8fbff" }}>
          <h1>📚 {label} Marks Entry</h1>
          <h3>Class {selectedClass}th - Section {selectedSection}</h3>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
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
          </div>

          {isTenth ? (
            <>
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ marginBottom: "8px" }}>1st Semester</h2>
                <h3>Part 1</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white", marginBottom: "16px" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Roll No</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Name</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A1</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A2</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>FA1</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>T1</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A3</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A4</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>FA2</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>T2</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan="12" style={{ border: "1px solid #d7e0ea", padding: "12px", textAlign: "center" }}>
                          No students found for this class and section.
                        </td>
                      </tr>
                    ) : (
                      rows.map((student) => (
                        <tr key={student.id}>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.roll_no}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.name}</td>
                          {renderInputCell(student.id, "a1", student.studentMarks.a1)}
                          {renderInputCell(student.id, "a2", student.studentMarks.a2)}
                          {renderInputCell(student.id, "fa1", student.studentMarks.fa1)}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.t1}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.grade1}</td>
                          {renderInputCell(student.id, "a3", student.studentMarks.a3)}
                          {renderInputCell(student.id, "a4", student.studentMarks.a4)}
                          {renderInputCell(student.id, "fa2", student.studentMarks.fa2)}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.t2}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.grade2}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <h3>Part 2</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Roll No</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Name</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>SA1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ border: "1px solid #d7e0ea", padding: "12px", textAlign: "center" }}>
                          No students found for this class and section.
                        </td>
                      </tr>
                    ) : (
                      rows.map((student) => (
                        <tr key={student.id}>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.roll_no}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.name}</td>
                          {renderInputCell(student.id, "sa1", student.studentMarks.sa1)}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ marginBottom: "8px" }}>2nd Semester</h2>
                <h3>Part 1</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white", marginBottom: "16px" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Roll No</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Name</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A5</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A6</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>FA3</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>T3</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A7</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A8</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>FA4</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>T4</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan="12" style={{ border: "1px solid #d7e0ea", padding: "12px", textAlign: "center" }}>
                          No students found for this class and section.
                        </td>
                      </tr>
                    ) : (
                      rows.map((student) => (
                        <tr key={student.id}>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.roll_no}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.name}</td>
                          {renderInputCell(student.id, "a5", student.studentMarks.a5)}
                          {renderInputCell(student.id, "a6", student.studentMarks.a6)}
                          {renderInputCell(student.id, "fa3", student.studentMarks.fa3)}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.t3}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.grade3}</td>
                          {renderInputCell(student.id, "a7", student.studentMarks.a7)}
                          {renderInputCell(student.id, "a8", student.studentMarks.a8)}
                          {renderInputCell(student.id, "fa4", student.studentMarks.fa4)}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.t4}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.grade4}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <h3>Part 2</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Roll No</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Name</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Sum</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>RT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ border: "1px solid #d7e0ea", padding: "12px", textAlign: "center" }}>
                          No students found for this class and section.
                        </td>
                      </tr>
                    ) : (
                      rows.map((student) => (
                        <tr key={student.id}>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.roll_no}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.name}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.sum}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.rt}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : isNinth ? (
            <>
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ marginBottom: "8px" }}>1st Semester</h2>
                <h3>Part 1</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white", marginBottom: "16px" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Roll No</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Name</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A1</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A2</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>FA1</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>T1</th>
                      {!hideNinthColumns && (
                        <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>RT_1</th>
                      )}
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A3</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A4</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>FA2</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>T2</th>
                      {!hideNinthColumns && (
                        <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>RT_2</th>
                      )}
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={hideNinthColumns ? 12 : 14} style={{ border: "1px solid #d7e0ea", padding: "12px", textAlign: "center" }}>
                          No students found for this class and section.
                        </td>
                      </tr>
                    ) : (
                      rows.map((student) => (
                        <tr key={student.id}>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.roll_no}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.name}</td>
                          {renderInputCell(student.id, "a1", student.studentMarks.a1)}
                          {renderInputCell(student.id, "a2", student.studentMarks.a2)}
                          {renderInputCell(student.id, "fa1", student.studentMarks.fa1)}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.t1}</td>
                          {!hideNinthColumns && (
                            <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.rt1}</td>
                          )}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.grade1}</td>
                          {renderInputCell(student.id, "a3", student.studentMarks.a3)}
                          {renderInputCell(student.id, "a4", student.studentMarks.a4)}
                          {renderInputCell(student.id, "fa2", student.studentMarks.fa2)}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.t2}</td>
                          {!hideNinthColumns && (
                            <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.rt2}</td>
                          )}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.grade2}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <h3>Part 2</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Roll No</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Name</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>SA1</th>
                      {!hideNinthColumns && (
                        <>
                          <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Oral_1</th>
                          <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Total_1</th>
                          <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>RTS_1</th>
                        </>
                      )}
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={hideNinthColumns ? 4 : 7} style={{ border: "1px solid #d7e0ea", padding: "12px", textAlign: "center" }}>
                          No students found for this class and section.
                        </td>
                      </tr>
                    ) : (
                      rows.map((student) => (
                        <tr key={student.id}>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.roll_no}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.name}</td>
                          {renderInputCell(student.id, "sa1", student.studentMarks.sa1)}
                          {!hideNinthColumns && (
                            <>
                              {renderInputCell(student.id, "oral1", student.studentMarks.oral1)}
                              <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.total1}</td>
                              <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.rts1}</td>
                            </>
                          )}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.gradeS1}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ marginBottom: "8px" }}>2nd Semester</h2>
                <h3>Part 1</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white", marginBottom: "16px" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Roll No</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Name</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A5</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A6</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>FA3</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>T3</th>
                      {!hideNinthColumns && (
                        <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>RT_3</th>
                      )}
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A7</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A8</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>FA4</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>T4</th>
                      {!hideNinthColumns && (
                        <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>RT_4</th>
                      )}
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={hideNinthColumns ? 12 : 14} style={{ border: "1px solid #d7e0ea", padding: "12px", textAlign: "center" }}>
                          No students found for this class and section.
                        </td>
                      </tr>
                    ) : (
                      rows.map((student) => (
                        <tr key={student.id}>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.roll_no}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.name}</td>
                          {renderInputCell(student.id, "a5", student.studentMarks.a5)}
                          {renderInputCell(student.id, "a6", student.studentMarks.a6)}
                          {renderInputCell(student.id, "fa3", student.studentMarks.fa3)}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.t3}</td>
                          {!hideNinthColumns && (
                            <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.rt3}</td>
                          )}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.grade3}</td>
                          {renderInputCell(student.id, "a7", student.studentMarks.a7)}
                          {renderInputCell(student.id, "a8", student.studentMarks.a8)}
                          {renderInputCell(student.id, "fa4", student.studentMarks.fa4)}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.t4}</td>
                          {!hideNinthColumns && (
                            <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.rt4}</td>
                          )}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.grade4}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <h3>Part 2</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Roll No</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Name</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>SA2</th>
                      {!hideNinthColumns && (
                        <>
                          <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Oral_2</th>
                          <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Total_2</th>
                          <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>RTS_2</th>
                        </>
                      )}
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={hideNinthColumns ? 4 : 7} style={{ border: "1px solid #d7e0ea", padding: "12px", textAlign: "center" }}>
                          No students found for this class and section.
                        </td>
                      </tr>
                    ) : (
                      rows.map((student) => (
                        <tr key={student.id}>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.roll_no}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.name}</td>
                          {renderInputCell(student.id, "sa2", student.studentMarks.sa2)}
                          {!hideNinthColumns && (
                            <>
                              {renderInputCell(student.id, "oral2", student.studentMarks.oral2)}
                              <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.total2}</td>
                              <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.rts2}</td>
                            </>
                          )}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.gradeS2}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <h2 style={{ marginBottom: "8px" }}>Result</h2>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Roll No</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Name</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Result</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ border: "1px solid #d7e0ea", padding: "12px", textAlign: "center" }}>
                          No students found for this class and section.
                        </td>
                      </tr>
                    ) : (
                      rows.map((student) => (
                        <tr key={student.id}>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.roll_no}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.name}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.result}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.resultGrade}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ marginBottom: "8px" }}>1st Semester</h2>
                <h3>Part 1</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white", marginBottom: "16px" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Roll No</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Name</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A1</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A2</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>FA1</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>T1</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>RT1</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A3</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A4</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>FA2</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>T2</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>RT2</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan="14" style={{ border: "1px solid #d7e0ea", padding: "12px", textAlign: "center" }}>
                          No students found for this class and section.
                        </td>
                      </tr>
                    ) : (
                      rows.map((student) => (
                        <tr key={student.id}>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.roll_no}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.name}</td>
                          {renderInputCell(student.id, "a1", student.studentMarks.a1)}
                          {renderInputCell(student.id, "a2", student.studentMarks.a2)}
                          {renderInputCell(student.id, "fa1", student.studentMarks.fa1)}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.t1}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.rt1}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.grade1}</td>
                          {renderInputCell(student.id, "a3", student.studentMarks.a3)}
                          {renderInputCell(student.id, "a4", student.studentMarks.a4)}
                          {renderInputCell(student.id, "fa2", student.studentMarks.fa2)}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.t2}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.rt2}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.grade2}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <h3>Part 2</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Roll No</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Name</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>SA1</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Oral1</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Total1</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>RTS1</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ border: "1px solid #d7e0ea", padding: "12px", textAlign: "center" }}>
                          No students found for this class and section.
                        </td>
                      </tr>
                    ) : (
                      rows.map((student) => (
                        <tr key={student.id}>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.roll_no}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.name}</td>
                          {renderInputCell(student.id, "sa1", student.studentMarks.sa1)}
                          {renderInputCell(student.id, "oral1", student.studentMarks.oral1)}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.total1}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.rts1}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.gradeS1}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ marginBottom: "8px" }}>2nd Semester</h2>
                <h3>Part 1</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white", marginBottom: "16px" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Roll No</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Name</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A5</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A6</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>FA3</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>T3</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>RT3</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A7</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>A8</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>FA4</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>T4</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>RT4</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan="14" style={{ border: "1px solid #d7e0ea", padding: "12px", textAlign: "center" }}>
                          No students found for this class and section.
                        </td>
                      </tr>
                    ) : (
                      rows.map((student) => (
                        <tr key={student.id}>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.roll_no}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.name}</td>
                          {renderInputCell(student.id, "a5", student.studentMarks.a5)}
                          {renderInputCell(student.id, "a6", student.studentMarks.a6)}
                          {renderInputCell(student.id, "fa3", student.studentMarks.fa3)}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.t3}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.rt3}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.grade3}</td>
                          {renderInputCell(student.id, "a7", student.studentMarks.a7)}
                          {renderInputCell(student.id, "a8", student.studentMarks.a8)}
                          {renderInputCell(student.id, "fa4", student.studentMarks.fa4)}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.t4}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.rt4}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.grade4}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <h3>Part 2</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Roll No</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Name</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>SA2</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Oral2</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Total2</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>RTS2</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ border: "1px solid #d7e0ea", padding: "12px", textAlign: "center" }}>
                          No students found for this class and section.
                        </td>
                      </tr>
                    ) : (
                      rows.map((student) => (
                        <tr key={student.id}>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.roll_no}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.name}</td>
                          {renderInputCell(student.id, "sa2", student.studentMarks.sa2)}
                          {renderInputCell(student.id, "oral2", student.studentMarks.oral2)}
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.total2}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.rts2}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.gradeS2}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <h2 style={{ marginBottom: "8px" }}>Result</h2>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Roll No</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Name</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Result</th>
                      <th style={{ border: "1px solid #d7e0ea", padding: "8px", background: "#1e88e5", color: "white" }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ border: "1px solid #d7e0ea", padding: "12px", textAlign: "center" }}>
                          No students found for this class and section.
                        </td>
                      </tr>
                    ) : (
                      rows.map((student) => (
                        <tr key={student.id}>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.roll_no}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.name}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.result}</td>
                          <td style={{ border: "1px solid #d7e0ea", padding: "8px" }}>{student.resultGrade}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Subject;
