"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegistration } from "./_components/RegistrationProvider";
import { useRegisterWorkerStep1Mutation } from "@/lib/api/workerRegistrationApi";
import { useState } from "react";
import { useServerFieldErrors } from "@/lib/hooks/useServerFieldErrors";
import { accountSchema, type AccountFormValues } from "./_schemas/account";

const logoMark = "https://www.figma.com/api/mcp/asset/7515972f-ae3f-493a-8636-887c84646c06";
const arrowRight = "https://www.figma.com/api/mcp/asset/f3cc806a-630c-4dec-8247-f6460315dde9";

export default function WorkerRegisterPage() {
  const router = useRouter();
  const { data, setAccount, setUserIds } = useRegistration();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registerWorkerStep1, { isLoading }] = useRegisterWorkerStep1Mutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: data.account,
  });

  const handleServerError = useServerFieldErrors<AccountFormValues>(setError, [
    { field: "email", pattern: /email/i },
    { field: "phone", pattern: /phone/i },
    { field: "fullName", pattern: /name/i },
    { field: "password", pattern: /password/i },
  ]);

  const onSubmit = async (values: AccountFormValues) => {
    setAccount(values);
    setSubmitError(null);
    try {
      const response = await registerWorkerStep1({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      }).unwrap();
      setUserIds({ userId: response.userId, workerId: response.workerId });
      router.push("/worker/register/work-details");
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
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-green">
              Log in
            </Link>
          </div>
        </div>
      </nav>

      <section className="bg-[#dbf7e5] px-6 py-[64px] sm:px-12 lg:px-[24px]">
        <div className="mx-auto w-full max-w-[680px] rounded-[24px] border border-[#e8e8e8] bg-white shadow-[0px_4px_24px_0px_rgba(0,0,0,0.04)]">
          <div className="relative flex items-center justify-center px-12 pt-12">
            <div className="absolute left-1/2 top-[16px] h-[2px] w-[240px] -translate-x-1/2 bg-[#e8e8e8]">
              <div className="h-full w-1/4 bg-brand-green" />
            </div>
            <div className="flex w-[90px] flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-green p-[2px] text-[14px] font-semibold text-white">
                1
              </div>
              <span className="text-[12px] font-semibold leading-[18px] text-black">Account Info</span>
            </div>
            <div className="flex w-[90px] flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#e8e8e8] p-[2px] text-[14px] font-semibold text-neutral-muted">
                2
              </div>
              <span className="text-[12px] font-medium leading-[18px] text-neutral-muted">Work Details</span>
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

          <div className="px-12 pt-[106px]">
            <div className="flex flex-col items-center gap-3 text-center">
              <h1 className="text-[28px] font-bold leading-[42px] text-black">Create your pro account</h1>
              <p className="text-[16px] leading-[24px] text-neutral-muted">
                Start growing your business with LocalPros today
              </p>
            </div>
          </div>

          <form className="px-12 pb-12 pt-[36px]" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-[14px] font-medium leading-[21px] text-black">
                Full Name
                <input
                  type="text"
                  placeholder="e.g. John Smith"
                  className="h-[44px] rounded-[8px] border border-[#e8e8e8] bg-[#f8f8f7] px-[17px] text-[13.3px] text-black placeholder:text-[#757575]"
                  {...register("fullName")}
                />
                {errors.fullName ? <span className="text-[12px] text-red-500">{errors.fullName.message}</span> : null}
              </label>
              <label className="flex flex-col gap-2 text-[14px] font-medium leading-[21px] text-black">
                Phone Number
                <input
                  type="tel"
                  placeholder="(555) 000-0000"
                  className="h-[44px] rounded-[8px] border border-[#e8e8e8] bg-[#f8f8f7] px-[17px] text-[13.3px] text-black placeholder:text-[#757575]"
                  {...register("phone")}
                />
                {errors.phone ? <span className="text-[12px] text-red-500">{errors.phone.message}</span> : null}
              </label>
            </div>

            <label className="mt-6 flex flex-col gap-2 text-[14px] font-medium leading-[21px] text-black">
              Email Address
              <input
                type="email"
                placeholder="john@example.com"
                className="h-[44px] rounded-[8px] border border-[#e8e8e8] bg-[#f8f8f7] px-[17px] text-[13.3px] text-black placeholder:text-[#757575]"
                {...register("email")}
              />
              {errors.email ? <span className="text-[12px] text-red-500">{errors.email.message}</span> : null}
            </label>

            <label className="mt-6 flex flex-col gap-2 text-[14px] font-medium leading-[21px] text-black">
              Create Password
              <input
                type="password"
                placeholder="Minimum 8 characters"
                className="h-[44px] rounded-[8px] border border-[#e8e8e8] bg-[#f8f8f7] px-[17px] text-[13.3px] text-black placeholder:text-[#757575]"
                {...register("password")}
              />
              {errors.password ? <span className="text-[12px] text-red-500">{errors.password.message}</span> : null}
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 flex h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-brand-green text-[16px] font-semibold text-white disabled:opacity-70"
            >
              {isLoading ? "Submitting..." : "Continue to Work Details"}
              <img src={arrowRight} alt="" className="h-5 w-5" />
            </button>
            {submitError ? (
              <p className="mt-3 text-center text-[12px] text-red-500">{submitError}</p>
            ) : null}

            <p className="mt-6 text-center text-[13px] leading-[19.5px] text-neutral-muted">
              By registering, you agree to our{" "}
              <Link href="/terms" className="underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
