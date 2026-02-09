"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import styles from "@/ui/styles/register.module.css";

const workerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().min(1, "Phone is required").max(50),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  skills: z.string().min(1, "Skills are required").max(2000),
  experience: z.string().min(1, "Experience is required").max(500),
  address: z.string().min(1, "Address is required").max(500),
  latitude: z
    .union([z.string().min(1, "Latitude is required"), z.number()])
    .transform((v) => (typeof v === "string" ? parseFloat(v) : v))
    .refine((n) => !Number.isNaN(n) && n >= -90 && n <= 90, "Invalid latitude (-90 to 90)"),
  longitude: z
    .union([z.string().min(1, "Longitude is required"), z.number()])
    .transform((v) => (typeof v === "string" ? parseFloat(v) : v))
    .refine((n) => !Number.isNaN(n) && n >= -180 && n <= 180, "Invalid longitude (-180 to 180)"),
  serviceRadius: z.coerce.number().int().min(1, "Service radius must be at least 1 km").max(500, "Max 500 km"),
});

type WorkerFormData = z.infer<typeof workerSchema>;

export function WorkerForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      skills: "",
      experience: "",
      address: "",
      latitude: undefined,
      longitude: undefined,
      serviceRadius: 25,
    },
  });

  async function onSubmit(data: WorkerFormData) {
    setSubmitError(null);
    const res = await fetch("/api/auth/register/worker", {
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
        <p>Worker account created. <Link href="/login">Sign in</Link></p>
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
        <label htmlFor="worker-name">Name</label>
        <input
          id="worker-name"
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
        <label htmlFor="worker-email">Email</label>
        <input
          id="worker-email"
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
        <label htmlFor="worker-phone">Phone</label>
        <input
          id="worker-phone"
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
        <label htmlFor="worker-password">Password</label>
        <input
          id="worker-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <span className={styles.formFieldError}>{errors.password.message}</span>
        )}
      </div>

      <div className={styles.formField}>
        <label htmlFor="worker-skills">Skills</label>
        <textarea
          id="worker-skills"
          placeholder="e.g. Plumbing, HVAC, Electrical"
          aria-invalid={!!errors.skills}
          {...register("skills")}
        />
        {errors.skills && (
          <span className={styles.formFieldError}>{errors.skills.message}</span>
        )}
      </div>

      <div className={styles.formField}>
        <label htmlFor="worker-experience">Experience</label>
        <input
          id="worker-experience"
          type="text"
          placeholder="e.g. 5 years"
          aria-invalid={!!errors.experience}
          {...register("experience")}
        />
        {errors.experience && (
          <span className={styles.formFieldError}>{errors.experience.message}</span>
        )}
      </div>

      <div className={styles.formField}>
        <label htmlFor="worker-address">Address</label>
        <input
          id="worker-address"
          type="text"
          autoComplete="street-address"
          placeholder="Street, city, state, zip"
          aria-invalid={!!errors.address}
          {...register("address")}
        />
        {errors.address && (
          <span className={styles.formFieldError}>{errors.address.message}</span>
        )}
      </div>

      <div className={styles.formField}>
        <label htmlFor="worker-latitude">Latitude</label>
        <input
          id="worker-latitude"
          type="number"
          step="any"
          placeholder="e.g. 40.7128"
          aria-invalid={!!errors.latitude}
          {...register("latitude")}
        />
        {errors.latitude && (
          <span className={styles.formFieldError}>{errors.latitude.message}</span>
        )}
      </div>

      <div className={styles.formField}>
        <label htmlFor="worker-longitude">Longitude</label>
        <input
          id="worker-longitude"
          type="number"
          step="any"
          placeholder="e.g. -74.0060"
          aria-invalid={!!errors.longitude}
          {...register("longitude")}
        />
        {errors.longitude && (
          <span className={styles.formFieldError}>{errors.longitude.message}</span>
        )}
      </div>

      <div className={styles.formField}>
        <label htmlFor="worker-serviceRadius">Service radius (km)</label>
        <input
          id="worker-serviceRadius"
          type="number"
          min={1}
          max={500}
          aria-invalid={!!errors.serviceRadius}
          {...register("serviceRadius")}
        />
        {errors.serviceRadius && (
          <span className={styles.formFieldError}>{errors.serviceRadius.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className={styles.formSubmit}>
        {isSubmitting ? "Creating account…" : "Create worker account"}
      </button>
    </form>
  );
}
