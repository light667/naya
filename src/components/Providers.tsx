"use client";

import { MotionConfig } from "motion/react";
import { AuthProvider } from "./AuthProvider";
import { ToastProvider } from "./Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </MotionConfig>
  );
}
