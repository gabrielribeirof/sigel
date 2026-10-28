import type { ReactNode } from 'react'

export function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm font-bold tracking-[0.3em] text-violet-600">SIGEL</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Acesse sua conta</h1>
          <p className="mt-2 text-sm text-slate-500">Entre para administrar o sistema.</p>
        </div>
        {children}
      </section>
    </main>
  )
}
