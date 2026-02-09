import { LoginForm } from "@/ui/forms/login-form";
import styles from "@/ui/styles/login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.loginPage}>
      <h1 className={styles.loginPageTitle}>Sign in</h1>
      <LoginForm />
    </main>
  );
}
