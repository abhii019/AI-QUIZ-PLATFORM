// This file provides functions to interact with Firebase Firestore.

import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  getDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
  orderBy, // Added for sorting submissions
  setDoc,
  deleteDoc,
} from "firebase/firestore";

interface Question {
  question: string;
  options: string[];
  answer: string; // The correct option text
}

export interface Quiz {
  id: string;
  teacherId: string; // Placeholder for the teacher's user ID
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  numQuestions: number;
  prompt: string;
  questions: Question[];
  roomCode: string;
  timeLimit: number; // Time limit in minutes
  createdAt: Timestamp; // Use Firebase Timestamp
  updatedAt: Timestamp; // Use Firebase Timestamp
  startTime?: Timestamp; // Optional: When the quiz becomes available
  endTime?: Timestamp; // Optional: When the quiz closes
}

export interface Submission {
  id: string;
  quizId: string;
  studentId: string; // Student's user ID
  studentEmail: string; // Student's email address
  answers: { questionIndex: number; selectedOption: string }[];
  score: number;
  submittedAt: Timestamp; // Use Firebase Timestamp
}

export interface User {
  id: string;
  email: string;
  role: "teacher" | "student";
  createdAt: Timestamp;
}

export const firestoreCollections = {
  quizzes: collection(db, "quizzes"),
  submissions: collection(db, "submissions"),
  users: collection(db, "users"),
};

export const firestoreDb = {
  quizzes: {
    async create(
      quizData: Omit<Quiz, "id" | "createdAt" | "updatedAt">
    ): Promise<Quiz> {
      const docRef = await addDoc(firestoreCollections.quizzes, {
        ...quizData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const newQuizDoc = await getDoc(docRef);
      return { id: newQuizDoc.id, ...(newQuizDoc.data() as Omit<Quiz, "id">) };
    },
    async getById(id: string): Promise<Quiz | undefined> {
      const docRef = doc(db, "quizzes", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...(docSnap.data() as Omit<Quiz, "id">) };
      }
      return undefined;
    },
    async getByRoomCode(roomCode: string): Promise<Quiz | undefined> {
      const q = query(
        firestoreCollections.quizzes,
        where("roomCode", "==", roomCode)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        return { id: docSnap.id, ...(docSnap.data() as Omit<Quiz, "id">) };
      }
      return undefined;
    },
    async getByTeacherId(teacherId: string): Promise<Quiz[]> {
      const q = query(
        firestoreCollections.quizzes,
        where("teacherId", "==", teacherId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Quiz, "id">),
      }));
    },
    async update(
      id: string,
      updates: Partial<Omit<Quiz, "id" | "createdAt">>
    ): Promise<Quiz | undefined> {
      const docRef = doc(db, "quizzes", id);
      await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
      const updatedDoc = await getDoc(docRef);
      if (updatedDoc.exists()) {
        return {
          id: updatedDoc.id,
          ...(updatedDoc.data() as Omit<Quiz, "id">),
        };
      }
      return undefined;
    },
    async delete(id: string): Promise<void> {
      const docRef = doc(db, "quizzes", id);
      await deleteDoc(docRef);
    },
  },
  submissions: {
    async create(
      submissionData: Omit<Submission, "id" | "submittedAt">
    ): Promise<Submission> {
      const docRef = await addDoc(firestoreCollections.submissions, {
        ...submissionData,
        submittedAt: serverTimestamp(),
      });
      const newSubmissionDoc = await getDoc(docRef);
      return {
        id: newSubmissionDoc.id,
        ...(newSubmissionDoc.data() as Omit<Submission, "id">),
      };
    },
    async getByQuizId(quizId: string): Promise<Submission[]> {
      const q = query(
        firestoreCollections.submissions,
        where("quizId", "==", quizId),
        orderBy("score", "desc")
      ); // Order by score for ranking
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Submission, "id">),
      }));
    },
    async getByStudentId(studentId: string): Promise<Submission[]> {
      const q = query(
        firestoreCollections.submissions,
        where("studentId", "==", studentId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Submission, "id">),
      }));
    },
    async delete(id: string): Promise<void> {
      const docRef = doc(db, "submissions", id);
      await deleteDoc(docRef);
    },
    // Migration function to update existing submissions with studentEmail
    async migrateSubmissionsWithEmail(): Promise<void> {
      const q = query(firestoreCollections.submissions);
      const querySnapshot = await getDocs(q);

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        if (!data.studentEmail && data.studentId) {
          // Try to get user email from Firebase Auth or set a placeholder
          try {
            // For now, we'll set a placeholder since we can't easily get the email from just the UID
            // In a real scenario, you might want to store user emails in a separate collection
            await updateDoc(docSnap.ref, {
              studentEmail: `student-${data.studentId.slice(
                -4
              )}@placeholder.com`,
            });
          } catch (error) {
            console.error(`Failed to migrate submission ${docSnap.id}:`, error);
          }
        }
      }
    },
  },
  users: {
    async create(
      userId: string,
      userData: Omit<User, "id" | "createdAt">
    ): Promise<User> {
      const docRef = doc(db, "users", userId);
      await setDoc(docRef, {
        ...userData,
        createdAt: serverTimestamp(),
      });
      const newUserDoc = await getDoc(docRef);
      return { id: newUserDoc.id, ...(newUserDoc.data() as Omit<User, "id">) };
    },
    async getById(id: string): Promise<User | undefined> {
      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...(docSnap.data() as Omit<User, "id">) };
      }
      return undefined;
    },
    async getByEmail(email: string): Promise<User | undefined> {
      const q = query(firestoreCollections.users, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        return { id: docSnap.id, ...(docSnap.data() as Omit<User, "id">) };
      }
      return undefined;
    },
    async update(
      id: string,
      updates: Partial<Omit<User, "id" | "createdAt">>
    ): Promise<User | undefined> {
      const docRef = doc(db, "users", id);
      await updateDoc(docRef, updates);
      const updatedDoc = await getDoc(docRef);
      if (updatedDoc.exists()) {
        return {
          id: updatedDoc.id,
          ...(updatedDoc.data() as Omit<User, "id">),
        };
      }
      return undefined;
    },
  },
};
