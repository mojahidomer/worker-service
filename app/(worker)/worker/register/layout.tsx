import { RegistrationProvider } from "./_components/RegistrationProvider";

export default function WorkerRegisterLayout({ children }: { children: React.ReactNode }) {
  return <RegistrationProvider>{children}</RegistrationProvider>;
}
