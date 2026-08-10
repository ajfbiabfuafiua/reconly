import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/app/AuthShell";

export default function RegisterPage() {
  return (
    <AuthShell caption="New accounts start in a pending state and are activated by a Reconly admin — usually within one business day.">
      <SignUp path="/register" forceRedirectUrl="/verifying" signInUrl="/login" />
    </AuthShell>
  );
}
