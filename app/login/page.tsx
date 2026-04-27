import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <LoginForm />
      </div>
    </main>
  );
}
