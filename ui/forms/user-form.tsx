"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import styles from "@/ui/styles/register.module.css";

const userSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().min(1, "Phone is required").max(50),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  async function onSubmit(data: UserFormData) {
    setSubmitError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setSubmitError(json.error ?? "Registration failed. Please try again.");
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className={styles.successMessage}>
        <p>Account created successfully. <Link href="/login">Sign in</Link></p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.formCard}>
      {submitError && (
        <div className={styles.formError} role="alert">
          {submitError}
        </div>
      )}

      <div className={styles.formField}>
        <label htmlFor="user-name">Name</label>
        <input
          id="user-name"
          type="text"
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <span className={styles.formFieldError}>{errors.name.message}</span>
        )}
      </div>

      <div className={styles.formField}>
        <label htmlFor="user-email">Email</label>
        <input
          id="user-email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <span className={styles.formFieldError}>{errors.email.message}</span>
        )}
      </div>

      <div className={styles.formField}>
        <label htmlFor="user-phone">Phone</label>
        <input
          id="user-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1234567890"
          aria-invalid={!!errors.phone}
          {...register("phone")}
        />
        {errors.phone && (
          <span className={styles.formFieldError}>{errors.phone.message}</span>
        )}
      </div>

      <div className={styles.formField}>
        <label htmlFor="user-password">Password</label>
        <input
          id="user-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <span className={styles.formFieldError}>{errors.password.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className={styles.formSubmit}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
