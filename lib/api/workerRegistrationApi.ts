import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type RegisterWorkerStep1Payload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export type RegisterWorkerStep1Response = {
  success: boolean;
  message: string;
  userId: string;
  workerId: string;
};

export type RegisterWorkerStep2Payload = {
  userId: string;
  experienceYears: number;
  skills: string[];
  workDescription?: string;
  payType: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  rate: number;
};

export type RegisterWorkerStep2Response = {
  success: boolean;
  message: string;
  workerId: string;
};

export type RegisterWorkerStep3Payload = {
  userId: string;
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  serviceRadiusMiles: number;
  latitude?: number | null;
  longitude?: number | null;
};

export type RegisterWorkerStep3Response = {
  success: boolean;
  message: string;
  workerId: string;
};

export type RegisterWorkerStep4Payload = {
  userId: string;
  idFront?: boolean;
  idBack?: boolean;
  license?: boolean;
  consent: boolean;
};

export type RegisterWorkerStep4Response = {
  success: boolean;
  message: string;
};

export const workerRegistrationApi = createApi({
  reducerPath: "workerRegistrationApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  endpoints: (builder) => ({
    registerWorkerStep1: builder.mutation<RegisterWorkerStep1Response, RegisterWorkerStep1Payload>({
      query: (payload) => ({
        url: "api/auth/register/worker/step-1",
        method: "POST",
        body: payload,
      }),
    }),
    registerWorkerStep2: builder.mutation<RegisterWorkerStep2Response, RegisterWorkerStep2Payload>({
      query: (payload) => ({
        url: "api/auth/register/worker/step-2",
        method: "POST",
        body: payload,
      }),
    }),
    registerWorkerStep3: builder.mutation<RegisterWorkerStep3Response, RegisterWorkerStep3Payload>({
      query: (payload) => ({
        url: "api/auth/register/worker/step-3",
        method: "POST",
        body: payload,
      }),
    }),
    registerWorkerStep4: builder.mutation<RegisterWorkerStep4Response, RegisterWorkerStep4Payload>({
      query: (payload) => ({
        url: "api/auth/register/worker/step-4",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useRegisterWorkerStep1Mutation,
  useRegisterWorkerStep2Mutation,
  useRegisterWorkerStep3Mutation,
  useRegisterWorkerStep4Mutation,
} = workerRegistrationApi;
