import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/app/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell caption="Access is granted per company. After signing in, new accounts wait for activation by a Reconly admin.">
      <SignIn path="/login" forceRedirectUrl="/verifying" signUpUrl="/register" />
    </AuthShell>
  );
}
