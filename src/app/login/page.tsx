import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { login, signup } from './actions'
import { OAuthButtons } from './oauth-buttons'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-5">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-14 h-14 rounded-xl bg-forest flex items-center justify-center shadow-md mb-4">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-cream/20 rounded-full" />
            <BookOpen className="w-6 h-6 text-cream" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-3xl text-ink">bookstride</h1>
          <p className="text-xs text-ink-light uppercase tracking-widest mt-1">
            Track your reads
          </p>
        </div>

        {/* Auth Card */}
        <div className="card-dotted p-6 sm:p-8">
          <form className="flex-1 flex flex-col w-full justify-center gap-4 text-ink">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-ink-light" htmlFor="email">
                Email
              </label>
              <input
                className="w-full px-4 py-3 bg-beige/50 border border-beige-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
                name="email"
                placeholder="reader@example.com"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-ink-light" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-4 py-3 bg-beige/50 border border-beige-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>

            {searchParams?.message && (
              <p className="text-sm text-terracotta bg-terracotta/5 p-3 rounded-xl border border-terracotta/20 text-center">
                {searchParams.message}
              </p>
            )}

            <div className="flex flex-col gap-3 mt-4">
              <button
                formAction={login}
                className="w-full px-4 py-3 rounded-xl bg-forest text-cream text-sm font-medium hover:bg-forest-light transition-colors shadow-sm"
              >
                Sign In
              </button>
              <button
                formAction={signup}
                className="w-full px-4 py-3 rounded-xl bg-beige text-ink text-sm font-medium hover:bg-beige-border transition-colors border border-beige-border/50"
              >
                Create Account
              </button>
            </div>
            
            <div className="chapter-divider my-2">Or</div>
            
            {/* OAuth Buttons */}
            <OAuthButtons />
          </form>
        </div>
      </div>
    </div>
  )
}
