import { AuthForm } from "@/components/auth/auth-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md">
        <AuthForm mode="login" />
      </div>
    </div>
  )
}
