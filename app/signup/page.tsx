import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <SignupForm />
      </div>
    </main>
  );
}
