"use client";

import { useState } from "react";
import Link from "next/link";
import { UserForm } from "./user-form";
import { WorkerForm } from "./worker-form";
import styles from "@/ui/styles/register.module.css";

type Role = "user" | "worker" | null;

export function RegisterClient() {
  const [role, setRole] = useState<Role>(null);

  return (
    <div className={styles.registerPage}>
      <h1 className={styles.registerPageTitle}>Create account</h1>

      {role === null && (
        <>
          <p style={{ marginBottom: "1rem", color: "#6b7280" }}>
            Choose how you want to register:
          </p>
          <div className={styles.roleSelection}>
            <button
              type="button"
              className={styles.roleOption}
              onClick={() => setRole("user")}
            >
              <span className={styles.roleOptionTitle}>User</span>
              <span className={styles.roleOptionDesc}>
                Sign up to use the platform as a customer.
              </span>
            </button>
            <button
              type="button"
              className={styles.roleOption}
              onClick={() => setRole("worker")}
            >
              <span className={styles.roleOptionTitle}>Worker</span>
              <span className={styles.roleOptionDesc}>
                Register as a service provider with skills and service area.
              </span>
            </button>
          </div>
        </>
      )}

      {role === "user" && (
        <>
          <Link href="/register" className={styles.backLink}>
            ← Back to role selection
          </Link>
          <UserForm />
        </>
      )}

      {role === "worker" && (
        <>
          <Link href="/register" className={styles.backLink}>
            ← Back to role selection
          </Link>
          <WorkerForm />
        </>
      )}

      <p style={{ marginTop: "1.5rem", fontSize: "0.875rem", color: "#6b7280" }}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}
