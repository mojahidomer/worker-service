"use client";

import { createContext, useContext, useMemo, useState } from "react";

type AccountInfo = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  experienceYears: number;
  skills: string[];
  workDescription?: string;
};

type LocationInfo = {
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  radius: number;
  latitude?: number | null;
  longitude?: number | null;
};

type VerificationInfo = {
  idFront: File | null;
  idBack: File | null;
  license: File | null;
  consent: boolean;
};

type RegistrationData = {
  account: AccountInfo;
  location: LocationInfo;
  verification: VerificationInfo;
  userId?: string;
  workerId?: string;
};

type RegistrationContextValue = {
  data: RegistrationData;
  setAccount: (values: AccountInfo) => void;
  setLocation: (values: LocationInfo) => void;
  setVerification: (values: VerificationInfo) => void;
  setUserIds: (ids: { userId?: string; workerId?: string }) => void;
};

const defaultData: RegistrationData = {
  account: {
    fullName: "",
    phone: "",
    email: "",
    password: "",
    experienceYears: 0,
    skills: [],
    workDescription: "",
  },
  location: {
    street: "",
    unit: "",
    city: "",
    state: "",
    zip: "",
    radius: 25,
    latitude: null,
    longitude: null,
  },
  verification: {
    idFront: null,
    idBack: null,
    license: null,
    consent: false,
  },
};

const RegistrationContext = createContext<RegistrationContextValue | null>(null);

export function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<RegistrationData>(defaultData);

  const value = useMemo<RegistrationContextValue>(
    () => ({
      data,
      setAccount: (values) => setData((prev) => ({ ...prev, account: values })),
      setLocation: (values) => setData((prev) => ({ ...prev, location: values })),
      setVerification: (values) => setData((prev) => ({ ...prev, verification: values })),
      setUserIds: (ids) =>
        setData((prev) => ({
          ...prev,
          userId: ids.userId ?? prev.userId,
          workerId: ids.workerId ?? prev.workerId,
        })),
    }),
    [data]
  );

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export function useRegistration() {
  const ctx = useContext(RegistrationContext);
  if (!ctx) throw new Error("useRegistration must be used within RegistrationProvider");
  return ctx;
}
