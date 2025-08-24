"use client";
import { SignupForm, Loader } from "@/components/forms/sign-up";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <>
          <Loader />
        </>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
