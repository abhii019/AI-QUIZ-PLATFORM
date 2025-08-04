import { auth, db } from "./config";
import { GoogleAuthProvider } from "firebase/auth";
const provider = new GoogleAuthProvider();
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";

export const loginWithGoogle = async (role: string) => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const userDoc = await getDoc(doc(db, role === "teacher" ? "teachers" : "students", user.uid));

  // If first time login, store user info with role
  if (!userDoc.exists()) {
    await setDoc(doc(db, role === "teacher" ? "teachers" : "students", user.uid), {
      name: user.displayName,
      email: user.email,
      role,
    });
  }

  return role;
};

export const signupWithEmail = async (email: string, password: string, role: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;

  await setDoc(doc(db, role === "teacher" ? "teachers" : "students", user.uid), {
    email,
    role,
  });

  return role;
};

export const loginWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;

  const teacherDoc = await getDoc(doc(db, "teachers", user.uid));
  if (teacherDoc.exists()) return "teacher";

  const studentDoc = await getDoc(doc(db, "students", user.uid));
  if (studentDoc.exists()) return "student";

  throw new Error("No role assigned to user");
};
