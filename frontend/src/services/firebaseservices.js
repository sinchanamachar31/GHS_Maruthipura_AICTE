import { db } from "../firebase";

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    query,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";

/*
  Shared collection architecture:
  - all users read the same Firestore documents
  - no browser-local fallback is used for app data
  - each device gets the same data because they hit the same collections
*/

const ensureFirestoreReady = () => {
    if (!db) {
        console.warn("Firestore is not configured. Please set the Firebase environment variables before deployment.");
        return false;
    }
    return true;
};

const buildStudentQuery = (studentClass, section) =>
    query(
        collection(db, "students"),
        where("class", "==", studentClass),
        where("section", "==", section)
    );

export const addStudent = async (studentClass, section, student) => {
    if (!ensureFirestoreReady()) {
        return;
    }

    await addDoc(collection(db, "students"), {
        roll_no: student.roll_no,
        name: student.name,
        class: studentClass,
        section,
    });
};

export const deleteStudent = async (id) => {
    if (!ensureFirestoreReady()) {
        return;
    }

    await deleteDoc(doc(db, "students", id));
};

export const subscribeStudents = (studentClass, section, callback) => {
    if (!ensureFirestoreReady()) {
        callback([]);
        return () => {};
    }

    const q = buildStudentQuery(studentClass, section);

    return onSnapshot(
        q,
        (snapshot) => {
            const students = snapshot.docs.map((document) => ({
                id: document.id,
                ...document.data(),
            }));

            students.sort((a, b) => Number(a.roll_no) - Number(b.roll_no));
            callback(students);
        },
        (error) => {
            console.error("Student Firestore subscription error:", error);
            callback([]);
        }
    );
};

export const saveSubjectMarks = async (studentClass, section, subject, marks) => {
    if (!ensureFirestoreReady()) {
        return;
    }

    const key = `${studentClass}-${section}-${subject}`;

    await setDoc(
        doc(db, "subjectMarks", key),
        {
            class: Number(studentClass),
            section,
            subject,
            marks,
            updatedAt: new Date().toISOString(),
        },
        { merge: true }
    );
};

export const subscribeSubjectMarks = (studentClass, section, subject, callback) => {
    if (!ensureFirestoreReady()) {
        callback({});
        return () => {};
    }

    const key = `${studentClass}-${section}-${subject}`;

    return onSnapshot(
        doc(db, "subjectMarks", key),
        (snapshot) => {
            const marks = snapshot.exists() ? snapshot.data().marks || {} : {};
            callback(marks);
        },
        (error) => {
            console.error("Subject marks Firestore subscription error:", error);
            callback({});
        }
    );
};

export const savePTMManualSA2 = async (studentClass, section, manualMarks) => {
    if (!ensureFirestoreReady()) {
        return;
    }

    const key = `${studentClass}-${section}-ptm-sa2`;

    await setDoc(
        doc(db, "ptmManualSA2", key),
        {
            class: Number(studentClass),
            section,
            marks: manualMarks,
            updatedAt: new Date().toISOString(),
        },
        { merge: true }
    );
};

export const subscribePTMManualSA2 = (studentClass, section, callback) => {
    if (!ensureFirestoreReady()) {
        callback({});
        return () => {};
    }

    const key = `${studentClass}-${section}-ptm-sa2`;

    return onSnapshot(
        doc(db, "ptmManualSA2", key),
        (snapshot) => {
            const marks = snapshot.exists() ? snapshot.data().marks || {} : {};
            callback(marks);
        },
        (error) => {
            console.error("PTM Firestore subscription error:", error);
            callback({});
        }
    );
};

export const saveLedgerManualSA2 = async (studentClass, section, manualMarks) => {
    if (!ensureFirestoreReady()) {
        return;
    }

    const key = `${studentClass}-${section}-ledger-sa2`;

    await setDoc(
        doc(db, "ledgerManualSA2", key),
        {
            class: Number(studentClass),
            section,
            marks: manualMarks,
            updatedAt: new Date().toISOString(),
        },
        { merge: true }
    );
};

export const subscribeLedgerManualSA2 = (studentClass, section, callback) => {
    if (!ensureFirestoreReady()) {
        callback({});
        return () => {};
    }

    const key = `${studentClass}-${section}-ledger-sa2`;

    return onSnapshot(
        doc(db, "ledgerManualSA2", key),
        (snapshot) => {
            const marks = snapshot.exists() ? snapshot.data().marks || {} : {};
            callback(marks);
        },
        (error) => {
            console.error("Ledger Firestore subscription error:", error);
            callback({});
        }
    );
};

export const savePreparatoryMarks = async (stage, studentClass, section, marks) => {
    if (!ensureFirestoreReady()) {
        return;
    }

    const key = `${stage}-${studentClass}-${section}`;

    await setDoc(
        doc(db, "preparatoryMarks", key),
        {
            stage,
            class: Number(studentClass),
            section,
            marks,
            updatedAt: new Date().toISOString(),
        },
        { merge: true }
    );
};

export const subscribePreparatoryMarks = (stage, studentClass, section, callback) => {
    if (!ensureFirestoreReady()) {
        callback({});
        return () => {};
    }

    const key = `${stage}-${studentClass}-${section}`;

    return onSnapshot(
        doc(db, "preparatoryMarks", key),
        (snapshot) => {
            const marks = snapshot.exists() ? snapshot.data().marks || {} : {};
            callback(marks);
        },
        (error) => {
            console.error("Preparatory Firestore subscription error:", error);
            callback({});
        }
    );
};

export const readDocument = async (collectionName, id) => {
    if (!ensureFirestoreReady()) {
        return null;
    }

    const snapshot = await getDoc(doc(db, collectionName, id));
    return snapshot.exists() ? snapshot.data() : null;
};

export const updateDocument = async (collectionName, id, payload) => {
    if (!ensureFirestoreReady()) {
        return;
    }

    await updateDoc(doc(db, collectionName, id), payload);
};