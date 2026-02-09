"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRegisterWorkerStep4Mutation } from "@/lib/api/workerRegistrationApi";
import { useServerFieldErrors } from "@/lib/hooks/useServerFieldErrors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegistration } from "../_components/RegistrationProvider";
import { verificationSchema, type VerificationFormValues } from "../_schemas/verification";

const logoMark = "https://www.figma.com/api/mcp/asset/7515972f-ae3f-493a-8636-887c84646c06";
const arrowRight = "https://www.figma.com/api/mcp/asset/f3cc806a-630c-4dec-8247-f6460315dde9";

export default function WorkerRegisterVerifyPage() {
  const router = useRouter();
  const { data, setVerification } = useRegistration();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registerWorkerStep4, { isLoading }] = useRegisterWorkerStep4Mutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      consent: data.verification.consent,
    },
  });

  const handleServerError = useServerFieldErrors<VerificationFormValues>(setError, [
    { field: "consent", pattern: /consent/i },
    { field: "idFront", pattern: /front|id/i },
    { field: "idBack", pattern: /back|id/i },
    { field: "license", pattern: /license/i },
  ]);

  const onSubmit = async (values: VerificationFormValues) => {
    setVerification({
      idFront: values.idFront?.[0] ?? null,
      idBack: values.idBack?.[0] ?? null,
      license: values.license?.[0] ?? null,
      consent: values.consent ?? false,
    });
    setSubmitError(null);
    try {
      if (!data.userId) {
        throw new Error("Please complete steps 1-3 first.");
      }
      await registerWorkerStep4({
        userId: data.userId,
        idFront: Boolean(values.idFront?.length),
        idBack: Boolean(values.idBack?.length),
        license: Boolean(values.license?.length),
        consent: values.consent,
      }).unwrap();
      router.push("/");
    } catch (err) {
      const result = handleServerError(err, "Registration failed");
      if (!result.handled) setSubmitError(result.message);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <nav className="w-full border-b border-neutral-border bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 pb-[25px] pt-[24px] sm:px-12 lg:px-[48px]">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center" aria-hidden>
              <img src={logoMark} alt="" className="h-6 w-6" />
            </div>
            <span className="text-[20px] font-bold leading-[30px] text-black">LocalPros</span>
          </Link>
          <div className="text-[14px] leading-[21px] text-neutral-muted">
            Need help?{" "}
            <Link href="/support" className="font-medium text-brand-green">
              Support
            </Link>
          </div>
        </div>
      </nav>

      <section className="bg-[#dbf7e5] px-6 py-[64px] sm:px-12 lg:px-[24px]">
        <div className="mx-auto w-full max-w-[680px] rounded-[24px] border border-[#e8e8e8] bg-white shadow-[0px_4px_24px_0px_rgba(0,0,0,0.04)]">
          <div className="px-12 pt-10">
            <Link href="/worker/register/location" className="text-[12px] leading-[18px] text-neutral-muted">
              ← Back to Location
            </Link>
          </div>

          <div className="relative flex items-center justify-center px-12 pt-6">
            <div className="absolute left-1/2 top-[16px] h-[2px] w-[240px] -translate-x-1/2 bg-[#e8e8e8]">
              <div className="h-full w-full bg-brand-green" />
            </div>
            <div className="flex w-[90px] flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-green p-[2px] text-[14px] font-semibold text-white">
                ✓
              </div>
              <span className="text-[12px] font-semibold leading-[18px] text-black">Account</span>
            </div>
            <div className="flex w-[90px] flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-green p-[2px] text-[14px] font-semibold text-white">
                ✓
              </div>
              <span className="text-[12px] font-semibold leading-[18px] text-black">Work Details</span>
            </div>
            <div className="flex w-[90px] flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-green p-[2px] text-[14px] font-semibold text-white">
                ✓
              </div>
              <span className="text-[12px] font-semibold leading-[18px] text-black">Location</span>
            </div>
            <div className="flex w-[90px] flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-green p-[2px] text-[14px] font-semibold text-white">
                4
              </div>
              <span className="text-[12px] font-semibold leading-[18px] text-black">Verify</span>
            </div>
          </div>

          <div className="px-12 pt-[32px]">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-[22px] font-bold leading-[33px] text-black">Verify your identity</h1>
              <p className="text-[13px] leading-[19.5px] text-neutral-muted">
                Upload your ID and relevant documents to get approved for jobs
              </p>
            </div>
          </div>

          <form className="px-12 pb-12 pt-[28px]" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <p className="text-[12px] font-semibold leading-[18px] text-black">Government ID (Optional)</p>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col items-center justify-center gap-2 rounded-[12px] border border-[#e8e8e8] bg-[#dbf7e5] px-4 py-6 text-center text-[11px] text-neutral-muted">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-muted">+</span>
                  <span className="text-[12px] font-semibold text-black">Front of ID</span>
                  JPG, PNG or PDF
                  <input type="file" className="hidden" {...register("idFront")} />
                </label>
                <label className="flex flex-col items-center justify-center gap-2 rounded-[12px] border border-[#e8e8e8] bg-[#dbf7e5] px-4 py-6 text-center text-[11px] text-neutral-muted">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-muted">+</span>
                  <span className="text-[12px] font-semibold text-black">Back of ID</span>
                  JPG, PNG or PDF
                  <input type="file" className="hidden" {...register("idBack")} />
                </label>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[12px] font-semibold leading-[18px] text-black">Professional License (Optional)</p>
              <label className="mt-3 flex items-center justify-between gap-3 rounded-[12px] border border-[#e8e8e8] bg-white px-4 py-4 text-[12px] text-neutral-muted">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f0f0] text-neutral-muted">📄</span>
                  <div>
                    <p className="text-[12px] font-semibold text-black">Upload Trade License</p>
                    <p className="text-[11px] text-neutral-muted">For Electricians, Plumbers, etc.</p>
                  </div>
                </div>
                <span className="text-[12px] text-brand-green">Upload</span>
                <input type="file" className="hidden" {...register("license")} />
              </label>
            </div>

            <div className="mt-6 rounded-[12px] border border-[#d7f2e3] bg-[#dbf7e5] px-4 py-4">
              <label className="flex items-start gap-3 text-[11px] text-neutral-muted">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-brand-green" {...register("consent")} />
                <span>
                  <span className="block text-[12px] font-semibold text-black">Background Check Consent</span>
                  I agree to a standard background check to verify my criminal history and identity. This helps keep our
                  community safe.
                </span>
              </label>
              {errors.consent ? <span className="mt-2 block text-[11px] text-red-500">{errors.consent.message}</span> : null}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex h-[40px] w-full items-center justify-center gap-2 rounded-[10px] bg-brand-green text-[13px] font-semibold text-white disabled:opacity-70"
            >
              {isLoading ? "Submitting..." : "Submit Application"}
              <img src={arrowRight} alt="" className="h-4 w-4" />
            </button>
            {submitError ? (
              <p className="mt-3 text-center text-[11px] text-red-500">{submitError}</p>
            ) : null}
          </form>
        </div>
      </section>
    </main>
  );
}
