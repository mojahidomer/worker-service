"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { z } from "zod";
import styles from "@/ui/styles/login.module.css";

const loginSchema = z.object({
  loginId: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { loginId: "", password: "" },
  });

  async function onSubmit(data: LoginFormData) {
    setSubmitError(null);
    const result = await signIn("credentials", {
      loginId: data.loginId,
      password: data.password,
      callbackUrl: "/auth/callback",
      redirect: false,
    });

    if (result?.error) {
      setSubmitError(result.error === "CredentialsSignin" ? "Invalid email/phone or password." : result.error);
      return;
    }

    if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.loginForm}>
      {submitError && (
        <div className={styles.loginFormError} role="alert">
          {submitError}
        </div>
      )}

      <div className={styles.loginFormField}>
        <label htmlFor="loginId">Email or phone</label>
        <input
          id="loginId"
          type="text"
          placeholder="you@example.com or +1234567890"
          autoComplete="username"
          aria-invalid={!!errors.loginId}
          aria-describedby={errors.loginId ? "loginId-error" : undefined}
          {...register("loginId")}
        />
        {errors.loginId && (
          <span id="loginId-error" className={styles.loginFormFieldError}>
            {errors.loginId.message}
          </span>
        )}
      </div>

      <div className={styles.loginFormField}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <span id="password-error" className={styles.loginFormFieldError}>
            {errors.password.message}
          </span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className={styles.loginFormSubmit}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
