export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-xl font-bold text-white">M</div>
          <h1 className="text-xl font-semibold">Monefy Personal</h1>
          <p className="text-sm text-muted">Kelola keuangan pribadi Anda</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-subtle">{children}</div>
      </div>
    </div>
  );
}
