import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { login, signup } from './actions'

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
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-beige-border text-ink text-sm font-medium hover:bg-beige/50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#24292F] text-white text-sm font-medium hover:bg-[#24292F]/90 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                GitHub
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
