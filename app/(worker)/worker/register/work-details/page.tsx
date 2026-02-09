"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRegistration } from "../_components/RegistrationProvider";
import { useRegisterWorkerStep2Mutation } from "@/lib/api/workerRegistrationApi";
import { useServerFieldErrors } from "@/lib/hooks/useServerFieldErrors";
import { SkillsCombobox } from "../_components/SkillsCombobox";
import { useServiceTypes } from "@/lib/hooks/useServiceTypes";
import { workDetailsSchema, type WorkDetailsFormValues } from "../_schemas/work-details";

const logoMark = "https://www.figma.com/api/mcp/asset/7515972f-ae3f-493a-8636-887c84646c06";
const arrowRight = "https://www.figma.com/api/mcp/asset/f3cc806a-630c-4dec-8247-f6460315dde9";

const PAY_TYPES = [
  { value: "HOURLY", label: "Per hour" },
  { value: "DAILY", label: "Per day" },
  { value: "WEEKLY", label: "Per week" },
  { value: "MONTHLY", label: "Per month" },
];

export default function WorkerRegisterWorkDetailsPage() {
  const router = useRouter();
  const { data, setWorkDetails } = useRegistration();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registerWorkerStep2, { isLoading }] = useRegisterWorkerStep2Mutation();
  const { services: apiServices } = useServiceTypes();
  const skillOptions = apiServices.map((service) => service.name);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<WorkDetailsFormValues>({
    resolver: zodResolver(workDetailsSchema),
    defaultValues: data.workDetails,
  });

  const selectedSkills = watch("skills");
  const selectedPayType = watch("payType");
  const rateLabel =
    selectedPayType === "DAILY"
      ? "Rate (per day)"
      : selectedPayType === "WEEKLY"
        ? "Rate (per week)"
        : selectedPayType === "MONTHLY"
          ? "Rate (per month)"
          : "Rate (per hour)";

  const handleServerError = useServerFieldErrors<WorkDetailsFormValues>(setError, [
    { field: "skills", pattern: /skills?/i },
    { field: "experienceYears", pattern: /experience/i },
    { field: "workDescription", pattern: /description/i },
    { field: "rate", pattern: /rate|price|amount/i },
    { field: "payType", pattern: /pay|type/i },
  ]);

  const updateSkills = (next: string[]) => {
    setValue("skills", next, { shouldValidate: true });
  };

  const onSubmit = async (values: WorkDetailsFormValues) => {
    setWorkDetails(values);
    setSubmitError(null);

    if (!data.userId) {
      setSubmitError("Please complete step 1 first.");
      return;
    }

    try {
      await registerWorkerStep2({
        userId: data.userId,
        experienceYears: values.experienceYears,
        skills: values.skills,
        workDescription: values.workDescription,
        payType: values.payType,
        rate: values.rate,
      }).unwrap();
      router.push("/worker/register/location");
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
            <Link href="/worker/register" className="text-[12px] leading-[18px] text-neutral-muted">
              ← Back to Account Info
            </Link>
          </div>

          <div className="relative flex items-center justify-center px-12 pt-6">
            <div className="absolute left-1/2 top-[16px] h-[2px] w-[240px] -translate-x-1/2 bg-[#e8e8e8]">
              <div className="h-full w-1/2 bg-brand-green" />
            </div>
            <div className="flex w-[90px] flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-green p-[2px] text-[14px] font-semibold text-white">
                ✓
              </div>
              <span className="text-[12px] font-semibold leading-[18px] text-black">Account</span>
            </div>
            <div className="flex w-[90px] flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-green p-[2px] text-[14px] font-semibold text-white">
                2
              </div>
              <span className="text-[12px] font-semibold leading-[18px] text-black">Work Details</span>
            </div>
            <div className="flex w-[90px] flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#e8e8e8] p-[2px] text-[14px] font-semibold text-neutral-muted">
                3
              </div>
              <span className="text-[12px] font-medium leading-[18px] text-neutral-muted">Location</span>
            </div>
            <div className="flex w-[90px] flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#e8e8e8] p-[2px] text-[14px] font-semibold text-neutral-muted">
                4
              </div>
              <span className="text-[12px] font-medium leading-[18px] text-neutral-muted">Verify</span>
            </div>
          </div>

          <div className="px-12 pt-[32px]">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-[22px] font-bold leading-[33px] text-black">Tell us about your work</h1>
              <p className="text-[14px] leading-[21px] text-neutral-muted">
                Share your skills, experience, and rates to attract the right clients.
              </p>
            </div>
          </div>

          <form className="px-12 pb-12 pt-[36px]" onSubmit={handleSubmit(onSubmit)}>
            <label className="flex flex-col gap-2 text-[14px] font-medium leading-[21px] text-black">
              Years of Experience
              <input
                type="number"
                min={0}
                max={100}
                placeholder="0"
                className="h-[44px] rounded-[8px] border border-[#e8e8e8] bg-[#f8f8f7] px-[17px] text-[13.3px] text-black placeholder:text-[#757575]"
                {...register("experienceYears", { valueAsNumber: true })}
              />
              {errors.experienceYears ? (
                <span className="text-[12px] text-red-500">{errors.experienceYears.message}</span>
              ) : null}
            </label>

            <div className="mt-6">
              <p className="text-[14px] font-medium leading-[21px] text-black">Skill Types</p>
              <div className="mt-3">
                <SkillsCombobox
                  options={skillOptions}
                  value={selectedSkills ?? []}
                  onChange={updateSkills}
                  placeholder="Search and select skills"
                  error={errors.skills?.message}
                />
              </div>
            </div>

            <label className="mt-6 flex flex-col gap-2 text-[14px] font-medium leading-[21px] text-black">
              Work Description (Optional)
              <textarea
                rows={3}
                placeholder="Tell us about the kind of jobs you take and your experience."
                className="rounded-[8px] border border-[#e8e8e8] bg-[#f8f8f7] px-[17px] py-3 text-[13.3px] text-black placeholder:text-[#757575]"
                {...register("workDescription")}
              />
              {errors.workDescription ? (
                <span className="text-[12px] text-red-500">{errors.workDescription.message}</span>
              ) : null}
            </label>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-[14px] font-medium leading-[21px] text-black">
                Pay Type
                <select
                  className="h-[44px] rounded-[8px] border border-[#e8e8e8] bg-[#f8f8f7] px-[14px] text-[13.3px] text-black"
                  {...register("payType")}
                >
                  {PAY_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.payType ? <span className="text-[12px] text-red-500">{errors.payType.message}</span> : null}
              </label>
              <label className="flex flex-col gap-2 text-[14px] font-medium leading-[21px] text-black">
                {rateLabel}
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  className="h-[44px] rounded-[8px] border border-[#e8e8e8] bg-[#f8f8f7] px-[17px] text-[13.3px] text-black placeholder:text-[#757575]"
                  {...register("rate", { valueAsNumber: true })}
                />
                {errors.rate ? <span className="text-[12px] text-red-500">{errors.rate.message}</span> : null}
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 flex h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-brand-green text-[16px] font-semibold text-white disabled:opacity-70"
            >
              {isLoading ? "Submitting..." : "Continue to Location"}
              <img src={arrowRight} alt="" className="h-5 w-5" />
            </button>
            {submitError ? <p className="mt-3 text-center text-[12px] text-red-500">{submitError}</p> : null}
          </form>
        </div>
      </section>
    </main>
  );
}
