import { auth, db } from "./config";
import { GoogleAuthProvider } from "firebase/auth";
const provider = new GoogleAuthProvider();
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";

export const loginWithGoogle = async (selectedRole: string) => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // First try to find the user in "teachers"
  let userDoc = await getDoc(doc(db, "teachers", user.uid));
  if (userDoc.exists()) {
    // Also ensure user is in unified users collection
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: "teacher",
      createdAt: serverTimestamp(),
    }, { merge: true });
    return "teacher";
  }

  // Then try "students"
  userDoc = await getDoc(doc(db, "students", user.uid));
  if (userDoc.exists()) {
    // Also ensure user is in unified users collection
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: "student",
      createdAt: serverTimestamp(),
    }, { merge: true });
    return "student";
  }

  // If user doesn't exist, use selected role and create new doc
  const collection = selectedRole === "teacher" ? "teachers" : "students";
  await setDoc(doc(db, collection, user.uid), {
    name: user.displayName,
    email: user.email,
    role: selectedRole,
  });

  // Also store in unified users collection
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    role: selectedRole,
    createdAt: serverTimestamp(),
  });

  return selectedRole;
};


export const signupWithEmail = async (email: string, password: string, role: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;

  await setDoc(doc(db, role === "teacher" ? "teachers" : "students", user.uid), {
    email,
    role,
  });

  // Also store in unified users collection
  await setDoc(doc(db, "users", user.uid), {
    email,
    role,
    createdAt: serverTimestamp(),
  });

  return role;
};

export const loginWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;

  const teacherDoc = await getDoc(doc(db, "teachers", user.uid));
  if (teacherDoc.exists()) {
    // Also ensure user is in unified users collection
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: "teacher",
      createdAt: serverTimestamp(),
    }, { merge: true });
    return "teacher";
  }

  const studentDoc = await getDoc(doc(db, "students", user.uid));
  if (studentDoc.exists()) {
    // Also ensure user is in unified users collection
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: "student",
      createdAt: serverTimestamp(),
    }, { merge: true });
    return "student";
  }

  throw new Error("No role assigned to user");
};
